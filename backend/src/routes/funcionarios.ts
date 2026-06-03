import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', async (_req, res) => {
  const funcionarios = await prisma.funcionario.findMany({
    select: { id: true, nome: true, usuario: true, ativo: true, role: true, created_at: true },
    orderBy: { nome: 'asc' },
  });
  res.json(funcionarios);
});

router.post('/', async (req, res) => {
  const { nome, usuario, senha, role } = req.body as {
    nome?: string;
    usuario?: string;
    senha?: string;
    role?: string;
  };

  if (!nome || !usuario || !senha) {
    return res.status(400).json({ error: 'nome, usuario e senha são obrigatórios' });
  }

  const existing = await prisma.funcionario.findUnique({ where: { usuario } });
  if (existing) {
    return res.status(409).json({ error: 'Usuário já existe' });
  }

  const senha_hash = await bcrypt.hash(senha, 12);
  const funcionario = await prisma.funcionario.create({
    data: { nome, usuario, senha_hash, role: role ?? 'funcionario' },
    select: { id: true, nome: true, usuario: true, ativo: true, role: true, created_at: true },
  });

  return res.status(201).json(funcionario);
});

router.patch('/:id', async (req, res) => {
  const { nome, ativo, role, senha } = req.body as {
    nome?: string;
    ativo?: boolean;
    role?: string;
    senha?: string;
  };

  const data: Record<string, unknown> = {};
  if (nome !== undefined) data.nome = nome;
  if (ativo !== undefined) data.ativo = ativo;
  if (role !== undefined) data.role = role;
  if (senha) data.senha_hash = await bcrypt.hash(senha, 12);

  try {
    const funcionario = await prisma.funcionario.update({
      where: { id: req.params.id },
      data,
      select: { id: true, nome: true, usuario: true, ativo: true, role: true, updated_at: true },
    });
    return res.json(funcionario);
  } catch {
    return res.status(404).json({ error: 'Funcionário não encontrado' });
  }
});

export default router;
