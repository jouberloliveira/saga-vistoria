import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req: Request, res: Response): void => {
  const employees = db
    .prepare('SELECT id, name, email, role, active, created_at FROM employees ORDER BY name')
    .all();
  res.json(employees);
});

router.get('/:id', (req: Request, res: Response): void => {
  const employee = db
    .prepare('SELECT id, name, email, role, active, created_at FROM employees WHERE id = ?')
    .get(req.params.id);

  if (!employee) {
    res.status(404).json({ error: 'Funcionário não encontrado' });
    return;
  }
  res.json(employee);
});

router.post('/', requireAdmin, (req: Request, res: Response): void => {
  const { name, email, password, role = 'inspector' } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    return;
  }

  const existing = db.prepare('SELECT id FROM employees WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'Email já cadastrado' });
    return;
  }

  const id = uuidv4();
  const password_hash = bcrypt.hashSync(password, 10);

  db.prepare(
    'INSERT INTO employees (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
  ).run(id, name, email, password_hash, role);

  res.status(201).json({ id, name, email, role });
});

router.patch('/:id', requireAdmin, (req: Request, res: Response): void => {
  const { name, email, password, role, active } = req.body;
  const { id } = req.params;

  const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
  if (!employee) {
    res.status(404).json({ error: 'Funcionário não encontrado' });
    return;
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (name !== undefined) { updates.push('name = ?'); values.push(name); }
  if (email !== undefined) { updates.push('email = ?'); values.push(email); }
  if (role !== undefined) { updates.push('role = ?'); values.push(role); }
  if (active !== undefined) { updates.push('active = ?'); values.push(active ? 1 : 0); }
  if (password !== undefined) {
    updates.push('password_hash = ?');
    values.push(bcrypt.hashSync(password, 10));
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'Nenhum campo para atualizar' });
    return;
  }

  values.push(id);
  db.prepare(`UPDATE employees SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  res.json({ message: 'Funcionário atualizado' });
});

export default router;
