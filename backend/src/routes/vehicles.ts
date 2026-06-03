import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req: Request, res: Response): void => {
  const { q } = req.query;
  let vehicles;

  if (q) {
    const term = `%${q}%`;
    vehicles = db
      .prepare(
        'SELECT * FROM vehicles WHERE plate LIKE ? OR brand LIKE ? OR model LIKE ? ORDER BY created_at DESC'
      )
      .all(term, term, term);
  } else {
    vehicles = db.prepare('SELECT * FROM vehicles ORDER BY created_at DESC').all();
  }

  res.json(vehicles);
});

router.get('/:id', (req: Request, res: Response): void => {
  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
  if (!vehicle) {
    res.status(404).json({ error: 'Veículo não encontrado' });
    return;
  }
  res.json(vehicle);
});

router.post('/', (req: Request, res: Response): void => {
  const { plate, brand, model, year, color } = req.body;

  if (!plate || !brand || !model || !year || !color) {
    res.status(400).json({ error: 'Placa, marca, modelo, ano e cor são obrigatórios' });
    return;
  }

  const existing = db.prepare('SELECT id FROM vehicles WHERE plate = ?').get(plate.toUpperCase());
  if (existing) {
    res.status(409).json({ error: 'Placa já cadastrada' });
    return;
  }

  const id = uuidv4();
  db.prepare(
    'INSERT INTO vehicles (id, plate, brand, model, year, color) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, plate.toUpperCase(), brand, model, year, color);

  res.status(201).json({ id, plate: plate.toUpperCase(), brand, model, year, color });
});

router.put('/:id', (req: Request, res: Response): void => {
  const { plate, brand, model, year, color } = req.body;
  const { id } = req.params;

  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id);
  if (!vehicle) {
    res.status(404).json({ error: 'Veículo não encontrado' });
    return;
  }

  db.prepare(
    'UPDATE vehicles SET plate = ?, brand = ?, model = ?, year = ?, color = ? WHERE id = ?'
  ).run(
    plate?.toUpperCase() ?? (vehicle as any).plate,
    brand ?? (vehicle as any).brand,
    model ?? (vehicle as any).model,
    year ?? (vehicle as any).year,
    color ?? (vehicle as any).color,
    id
  );

  res.json({ message: 'Veículo atualizado' });
});

router.delete('/:id', (req: Request, res: Response): void => {
  const vehicle = db.prepare('SELECT id FROM vehicles WHERE id = ?').get(req.params.id);
  if (!vehicle) {
    res.status(404).json({ error: 'Veículo não encontrado' });
    return;
  }

  const hasInspections = db
    .prepare("SELECT id FROM inspections WHERE vehicle_id = ? AND status != 'cancelled' LIMIT 1")
    .get(req.params.id);

  if (hasInspections) {
    res.status(409).json({ error: 'Veículo possui vistorias vinculadas' });
    return;
  }

  db.prepare('DELETE FROM vehicles WHERE id = ?').run(req.params.id);
  res.json({ message: 'Veículo removido' });
});

export default router;
