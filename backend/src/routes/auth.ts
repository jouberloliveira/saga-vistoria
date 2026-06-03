import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/database';
import { Employee } from '../types';
import { authenticate } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'default-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h';

router.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email e senha são obrigatórios' });
    return;
  }

  const employee = db
    .prepare('SELECT * FROM employees WHERE email = ? AND active = 1')
    .get(email) as Employee | undefined;

  if (!employee || !bcrypt.compareSync(password, employee.password_hash)) {
    res.status(401).json({ error: 'Credenciais inválidas' });
    return;
  }

  const token = jwt.sign(
    { sub: employee.id, email: employee.email, role: employee.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );

  res.json({
    token,
    user: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
    },
  });
});

router.get('/me', authenticate, (req: Request, res: Response): void => {
  const employee = db
    .prepare('SELECT id, name, email, role, created_at FROM employees WHERE id = ?')
    .get(req.user!.sub) as Omit<Employee, 'password_hash' | 'active'> | undefined;

  if (!employee) {
    res.status(404).json({ error: 'Funcionário não encontrado' });
    return;
  }

  res.json(employee);
});

export default router;
