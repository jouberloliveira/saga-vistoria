import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Allowlist of safe image extensions to prevent double-extension attacks (e.g. "evil.php.jpg")
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Somente imagens são aceitas'));
  },
});

export const fotosNestedRouter = Router({ mergeParams: true });
fotosNestedRouter.use(authenticate);

// POST /vistorias/:vistoriaId/fotos
fotosNestedRouter.post(
  '/',
  upload.single('foto'),
  async (req: AuthRequest, res) => {
    if (!req.file) return res.status(400).json({ error: 'Arquivo de imagem obrigatório' });

    const vistoria = await prisma.vistoria.findUnique({ where: { id: req.params.vistoriaId } });
    if (!vistoria) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Vistoria não encontrada' });
    }
    if (vistoria.status === 'finalizado') {
      fs.unlinkSync(req.file.path);
      return res.status(409).json({ error: 'Vistoria já finalizada' });
    }

    const { dano_id } = req.body as { dano_id?: string };
    const foto = await prisma.foto.create({
      data: {
        vistoria_id: req.params.vistoriaId,
        dano_id: dano_id || null,
        caminho: req.file.filename,
        funcionario_id: req.user!.id,
      },
    });

    return res.status(201).json(foto);
  },
);

// Standalone GET /fotos/:id
export const fotosRouter = Router();
fotosRouter.use(authenticate);

fotosRouter.get('/:id', async (req, res) => {
  const foto = await prisma.foto.findUnique({ where: { id: req.params.id } });
  if (!foto) return res.status(404).json({ error: 'Foto não encontrada' });

  const filePath = path.resolve(UPLOAD_DIR, foto.caminho);
  // Guard against path traversal: resolved path must stay within UPLOAD_DIR
  if (!filePath.startsWith(path.resolve(UPLOAD_DIR) + path.sep)) {
    return res.status(400).json({ error: 'Caminho de arquivo inválido' });
  }
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Arquivo não encontrado' });

  return res.sendFile(filePath);
});
