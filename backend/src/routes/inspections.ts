import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req: Request, res: Response): void => {
  const { vehicle_id, status, q } = req.query;
  let query = `
    SELECT i.*, v.plate, v.brand, v.model, e.name as employee_name
    FROM inspections i
    JOIN vehicles v ON v.id = i.vehicle_id
    JOIN employees e ON e.id = i.employee_id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (vehicle_id) { query += ' AND i.vehicle_id = ?'; params.push(vehicle_id); }
  if (status) { query += ' AND i.status = ?'; params.push(status); }
  if (q) {
    query += ' AND (v.plate LIKE ? OR i.client_name LIKE ? OR i.client_cpf LIKE ?)';
    const term = `%${q}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY i.created_at DESC';

  const inspections = db.prepare(query).all(...params);
  res.json(inspections);
});

router.get('/:id', (req: Request, res: Response): void => {
  const inspection = db.prepare(`
    SELECT i.*, v.plate, v.brand, v.model, v.year, v.color,
           e.name as employee_name, e.email as employee_email
    FROM inspections i
    JOIN vehicles v ON v.id = i.vehicle_id
    JOIN employees e ON e.id = i.employee_id
    WHERE i.id = ?
  `).get(req.params.id);

  if (!inspection) {
    res.status(404).json({ error: 'Vistoria não encontrada' });
    return;
  }

  const items = db
    .prepare('SELECT * FROM inspection_items WHERE inspection_id = ? ORDER BY created_at')
    .all(req.params.id);

  const photos = db
    .prepare('SELECT * FROM photos WHERE inspection_id = ? ORDER BY created_at')
    .all(req.params.id);

  const signatures = db
    .prepare('SELECT id, type, created_at FROM signatures WHERE inspection_id = ?')
    .all(req.params.id);

  res.json({ ...inspection, items, photos, signatures });
});

router.post('/', (req: Request, res: Response): void => {
  const { vehicle_id, client_name, client_cpf, mileage, notes } = req.body;

  if (!vehicle_id || !client_name || !client_cpf) {
    res.status(400).json({ error: 'vehicle_id, client_name e client_cpf são obrigatórios' });
    return;
  }

  const vehicle = db.prepare('SELECT id FROM vehicles WHERE id = ?').get(vehicle_id);
  if (!vehicle) {
    res.status(404).json({ error: 'Veículo não encontrado' });
    return;
  }

  const openInspection = db
    .prepare("SELECT id FROM inspections WHERE vehicle_id = ? AND status = 'open' LIMIT 1")
    .get(vehicle_id);
  if (openInspection) {
    res.status(409).json({ error: 'Veículo já possui vistoria em aberto' });
    return;
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO inspections (id, vehicle_id, employee_id, client_name, client_cpf, mileage, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, vehicle_id, req.user!.sub, client_name, client_cpf, mileage ?? null, notes ?? null);

  res.status(201).json({ id, vehicle_id, client_name, client_cpf, status: 'open' });
});

router.patch('/:id', (req: Request, res: Response): void => {
  const { client_name, client_cpf, mileage, notes, status } = req.body;
  const { id } = req.params;

  const inspection = db
    .prepare('SELECT * FROM inspections WHERE id = ?')
    .get(id) as any;

  if (!inspection) {
    res.status(404).json({ error: 'Vistoria não encontrada' });
    return;
  }

  if (inspection.status === 'signed') {
    res.status(409).json({ error: 'Vistoria assinada não pode ser alterada' });
    return;
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (client_name !== undefined) { updates.push('client_name = ?'); values.push(client_name); }
  if (client_cpf !== undefined) { updates.push('client_cpf = ?'); values.push(client_cpf); }
  if (mileage !== undefined) { updates.push('mileage = ?'); values.push(mileage); }
  if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
  if (status !== undefined) { updates.push('status = ?'); values.push(status); }

  if (updates.length === 0) {
    res.status(400).json({ error: 'Nenhum campo para atualizar' });
    return;
  }

  values.push(id);
  db.prepare(`UPDATE inspections SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  res.json({ message: 'Vistoria atualizada' });
});

// Items
router.post('/:id/items', (req: Request, res: Response): void => {
  const { type, location, severity = 'low', notes } = req.body;
  const inspection = db
    .prepare("SELECT id, status FROM inspections WHERE id = ?")
    .get(req.params.id) as any;

  if (!inspection) { res.status(404).json({ error: 'Vistoria não encontrada' }); return; }
  if (inspection.status === 'signed') { res.status(409).json({ error: 'Vistoria assinada' }); return; }
  if (!type || !location) { res.status(400).json({ error: 'type e location são obrigatórios' }); return; }

  const itemId = uuidv4();
  db.prepare(
    'INSERT INTO inspection_items (id, inspection_id, type, location, severity, notes) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(itemId, req.params.id, type, location, severity, notes ?? null);

  res.status(201).json({ id: itemId, inspection_id: req.params.id, type, location, severity, notes });
});

router.delete('/:id/items/:itemId', (req: Request, res: Response): void => {
  const inspection = db
    .prepare('SELECT status FROM inspections WHERE id = ?')
    .get(req.params.id) as any;

  if (!inspection) { res.status(404).json({ error: 'Vistoria não encontrada' }); return; }
  if (inspection.status === 'signed') { res.status(409).json({ error: 'Vistoria assinada' }); return; }

  db.prepare('DELETE FROM inspection_items WHERE id = ? AND inspection_id = ?').run(
    req.params.itemId, req.params.id
  );
  res.json({ message: 'Item removido' });
});

// Signatures
router.post('/:id/sign', (req: Request, res: Response): void => {
  const { type, data } = req.body;
  const inspection = db
    .prepare('SELECT status FROM inspections WHERE id = ?')
    .get(req.params.id) as any;

  if (!inspection) { res.status(404).json({ error: 'Vistoria não encontrada' }); return; }
  if (inspection.status === 'signed') { res.status(409).json({ error: 'Vistoria já assinada' }); return; }
  if (!type || !data) { res.status(400).json({ error: 'type e data são obrigatórios' }); return; }
  if (!['employee', 'client'].includes(type)) { res.status(400).json({ error: 'type deve ser employee ou client' }); return; }

  const sigId = uuidv4();
  db.prepare(
    'INSERT OR REPLACE INTO signatures (id, inspection_id, type, data) VALUES (?, ?, ?, ?)'
  ).run(sigId, req.params.id, type, data);

  const sigs = db
    .prepare('SELECT type FROM signatures WHERE inspection_id = ?')
    .all(req.params.id) as any[];

  const hasEmployee = sigs.some(s => s.type === 'employee');
  const hasClient = sigs.some(s => s.type === 'client');

  if (hasEmployee && hasClient) {
    db.prepare(
      "UPDATE inspections SET status = 'signed', signed_at = datetime('now') WHERE id = ?"
    ).run(req.params.id);
  }

  res.status(201).json({
    id: sigId,
    type,
    status_after: hasEmployee && hasClient ? 'signed' : 'open',
  });
});

export default router;
