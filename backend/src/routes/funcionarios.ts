import { Router } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

export const funcionariosRouter = Router();
funcionariosRouter.use(authenticate);

funcionariosRouter.get('/', requireAdmin, async (_req, res) => {
  const funcionarios = await prisma.funcionario.findMany({
    select: { id: true, nome: true, usuario: true, role: true, ativo: true, criadoEm: true }
  });
  res.json(funcionarios);
});

funcionariosRouter.post('/', requireAdmin, async (req, res) => {
  const { nome, usuario, senha, role } = req.body;
  if (!nome || !usuario || !senha) {
    res.status(400).json({ error: 'Nome, usuário e senha são obrigatórios' });
    return;
  }
  const exists = await prisma.funcionario.findUnique({ where: { usuario } });
  if (exists) {
    res.status(409).json({ error: 'Usuário já existe' });
    return;
  }
  const senhaHash = await bcrypt.hash(senha, 12);
  const funcionario = await prisma.funcionario.create({
    data: { nome, usuario, senhaHash, role: role || 'funcionario' },
    select: { id: true, nome: true, usuario: true, role: true, ativo: true }
  });
  res.status(201).json(funcionario);
});

funcionariosRouter.patch('/:id', requireAdmin, async (req, res) => {
  const { nome, ativo, role, senha } = req.body;
  const data: Record<string, unknown> = {};
  if (nome !== undefined) data.nome = nome;
  if (ativo !== undefined) data.ativo = ativo;
  if (role !== undefined) data.role = role;
  if (senha) data.senhaHash = await bcrypt.hash(senha, 12);

  const funcionario = await prisma.funcionario.update({
    where: { id: req.params.id },
    data,
    select: { id: true, nome: true, usuario: true, role: true, ativo: true }
  });
  res.json(funcionario);
});
