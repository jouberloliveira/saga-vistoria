import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

export const authRouter = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

authRouter.post('/login', loginLimiter, async (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha) {
    res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    return;
  }
  const funcionario = await prisma.funcionario.findUnique({ where: { usuario } });
  if (!funcionario || !funcionario.ativo) {
    res.status(401).json({ error: 'Credenciais inválidas' });
    return;
  }
  const valid = await bcrypt.compare(senha, funcionario.senhaHash);
  if (!valid) {
    res.status(401).json({ error: 'Credenciais inválidas' });
    return;
  }
  const token = jwt.sign(
    { id: funcionario.id, role: funcionario.role },
    process.env.JWT_SECRET!,
    { expiresIn: '8h' }
  );
  res.json({ token, funcionario: { id: funcionario.id, nome: funcionario.nome, role: funcionario.role } });
});

authRouter.get('/me', authenticate, async (req: AuthRequest, res) => {
  const funcionario = await prisma.funcionario.findUnique({
    where: { id: req.user!.id },
    select: { id: true, nome: true, usuario: true, role: true, ativo: true }
  });
  res.json(funcionario);
});
