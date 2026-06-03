import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', async (req, res) => {
  const { usuario, senha } = req.body as { usuario?: string; senha?: string };

  if (!usuario || !senha) {
    return res.status(400).json({ error: 'usuario e senha são obrigatórios' });
  }

  const funcionario = await prisma.funcionario.findUnique({
    where: { usuario },
    select: { id: true, nome: true, role: true, ativo: true, senha_hash: true },
  });

  if (!funcionario || !funcionario.ativo) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const ok = await bcrypt.compare(senha, funcionario.senha_hash);
  if (!ok) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = signToken({ sub: funcionario.id, role: funcionario.role, nome: funcionario.nome });
  return res.json({ token, role: funcionario.role, nome: funcionario.nome });
});

router.get('/me', authenticate, (req: AuthRequest, res) => {
  res.json(req.user);
});

export default router;
