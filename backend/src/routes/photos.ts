import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { authenticate } from '../middleware/auth';

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? './uploads';
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens JPEG, PNG e WebP são aceitas'));
    }
  },
});

const router = Router({ mergeParams: true });
router.use(authenticate);

router.get('/', (req: Request, res: Response): void => {
  const { id } = req.params;
  const inspection = db.prepare('SELECT id FROM inspections WHERE id = ?').get(id);
  if (!inspection) { res.status(404).json({ error: 'Vistoria não encontrada' }); return; }

  const photos = db.prepare('SELECT * FROM photos WHERE inspection_id = ? ORDER BY created_at').all(id);
  res.json(photos);
});

router.post('/', upload.single('file'), (req: Request, res: Response): void => {
  const { id } = req.params;
  const { item_id } = req.body;

  const inspection = db
    .prepare('SELECT status FROM inspections WHERE id = ?')
    .get(id) as any;

  if (!inspection) { res.status(404).json({ error: 'Vistoria não encontrada' }); return; }
  if (inspection.status === 'signed') { res.status(409).json({ error: 'Vistoria assinada' }); return; }

  if (!req.file) { res.status(400).json({ error: 'Arquivo não enviado' }); return; }

  const photoId = uuidv4();
  db.prepare(
    'INSERT INTO photos (id, inspection_id, item_id, filename, original_name) VALUES (?, ?, ?, ?, ?)'
  ).run(photoId, id, item_id ?? null, req.file.filename, req.file.originalname);

  res.status(201).json({
    id: photoId,
    inspection_id: id,
    item_id: item_id ?? null,
    filename: req.file.filename,
    original_name: req.file.originalname,
  });
});

router.delete('/:photoId', (req: Request, res: Response): void => {
  const { id, photoId } = req.params;

  const photo = db
    .prepare('SELECT * FROM photos WHERE id = ? AND inspection_id = ?')
    .get(photoId, id) as any;

  if (!photo) { res.status(404).json({ error: 'Foto não encontrada' }); return; }

  const inspection = db
    .prepare('SELECT status FROM inspections WHERE id = ?')
    .get(id) as any;

  if (inspection?.status === 'signed') { res.status(409).json({ error: 'Vistoria assinada' }); return; }

  const filePath = path.join(UPLOADS_DIR, photo.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  db.prepare('DELETE FROM photos WHERE id = ?').run(photoId);
  res.json({ message: 'Foto removida' });
});

export default router;
