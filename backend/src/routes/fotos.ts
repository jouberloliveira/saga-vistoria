import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (_req, file, cb) => cb(null, `${uuid()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(new Error('Apenas imagens JPEG, PNG ou WebP são permitidas'));
      return;
    }
    cb(null, true);
  }
});

export const fotosRouter = Router();
fotosRouter.use(authenticate);

fotosRouter.post('/vistorias/:id/fotos', upload.single('foto'), async (req: AuthRequest, res) => {
  const vistoria = await prisma.vistoria.findUnique({ where: { id: req.params.id } });
  if (!vistoria) { res.status(404).json({ error: 'Vistoria não encontrada' }); return; }
  if (vistoria.status === 'finalizado') { res.status(403).json({ error: 'Vistoria finalizada' }); return; }
  if (!req.file) { res.status(400).json({ error: 'Arquivo de foto é obrigatório' }); return; }

  const foto = await prisma.foto.create({
    data: {
      vistoriaId: req.params.id,
      danoId: req.body.danoId || null,
      funcionarioId: req.user!.id,
      caminho: req.file.filename,
      mimeType: req.file.mimetype,
      tamanhoBytes: req.file.size,
    }
  });
  res.status(201).json({ ...foto, url: `/uploads/${foto.caminho}` });
});
