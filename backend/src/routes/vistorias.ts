import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { buildVistoriaPdf } from '../lib/pdf';

const router = Router();
router.use(authenticate);

const FULL_INCLUDE = {
  veiculo: true,
  cliente: true,
  funcionario: { select: { id: true, nome: true, role: true } },
  pneus: true,
  danos: { include: { fotos: true } },
  itensFaltantes: true,
  fotos: true,
  assinaturas: true,
};

// POST /vistorias — create
router.post('/', async (req: AuthRequest, res) => {
  const {
    veiculo,
    cliente,
    observacoes_gerais,
    pneus = [],
    danos = [],
    itensFaltantes = [],
  } = req.body as {
    veiculo: { placa: string; marca: string; modelo: string; ano: number; cor: string; chassi?: string; quilometragem?: number };
    cliente: { nome: string; documento: string; telefone?: string; email?: string };
    observacoes_gerais?: string;
    pneus?: { posicao: string; estado: string }[];
    danos?: { tipo: string; localizacao: string; gravidade: string; descricao?: string }[];
    itensFaltantes?: { nome: string }[];
  };

  if (!veiculo?.placa || !cliente?.documento) {
    return res.status(400).json({ error: 'veiculo.placa e cliente.documento são obrigatórios' });
  }

  // Upsert veiculo and cliente
  const veiculoRec = await prisma.veiculo.upsert({
    where: { placa: veiculo.placa },
    create: veiculo,
    update: { marca: veiculo.marca, modelo: veiculo.modelo, ano: veiculo.ano, cor: veiculo.cor, chassi: veiculo.chassi, quilometragem: veiculo.quilometragem },
  });

  const clienteRec = await prisma.cliente.upsert({
    where: { documento: cliente.documento },
    create: cliente,
    update: { nome: cliente.nome, telefone: cliente.telefone, email: cliente.email },
  });

  const vistoria = await prisma.vistoria.create({
    data: {
      veiculo_id: veiculoRec.id,
      cliente_id: clienteRec.id,
      funcionario_id: req.user!.id,
      observacoes_gerais,
      pneus: { create: pneus },
      danos: { create: danos },
      itensFaltantes: { create: itensFaltantes },
    },
    include: FULL_INCLUDE,
  });

  return res.status(201).json(vistoria);
});

// GET /vistorias — list with filters
router.get('/', async (req, res) => {
  const { placa, cliente, data, funcionario } = req.query as Record<string, string | undefined>;

  const where: Record<string, unknown> = {};
  if (placa) where.veiculo = { placa: { contains: placa, mode: 'insensitive' } };
  if (cliente) where.cliente = { OR: [{ nome: { contains: cliente, mode: 'insensitive' } }, { documento: { contains: cliente } }] };
  if (data) {
    const day = new Date(data);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    where.data_inicio = { gte: day, lt: next };
  }
  if (funcionario) where.funcionario = { nome: { contains: funcionario, mode: 'insensitive' } };

  const vistorias = await prisma.vistoria.findMany({
    where,
    include: {
      veiculo: true,
      cliente: true,
      funcionario: { select: { id: true, nome: true } },
      _count: { select: { danos: true, fotos: true } },
    },
    orderBy: { data_inicio: 'desc' },
  });

  return res.json(vistorias);
});

// GET /vistorias/:id — full detail
router.get('/:id', async (req, res) => {
  const vistoria = await prisma.vistoria.findUnique({
    where: { id: req.params.id },
    include: FULL_INCLUDE,
  });

  if (!vistoria) return res.status(404).json({ error: 'Vistoria não encontrada' });
  return res.json(vistoria);
});

// PATCH /vistorias/:id — update (rascunho only)
router.patch('/:id', async (req, res) => {
  const vistoria = await prisma.vistoria.findUnique({ where: { id: req.params.id } });
  if (!vistoria) return res.status(404).json({ error: 'Vistoria não encontrada' });
  if (vistoria.status === 'finalizado') return res.status(409).json({ error: 'Vistoria já finalizada, não pode ser alterada' });

  const { observacoes_gerais } = req.body as { observacoes_gerais?: string };
  const updated = await prisma.vistoria.update({
    where: { id: req.params.id },
    data: { observacoes_gerais },
    include: FULL_INCLUDE,
  });

  return res.json(updated);
});

// POST /vistorias/:id/finalizar
router.post('/:id/finalizar', async (req, res) => {
  const vistoria = await prisma.vistoria.findUnique({ where: { id: req.params.id } });
  if (!vistoria) return res.status(404).json({ error: 'Vistoria não encontrada' });
  if (vistoria.status === 'finalizado') return res.status(409).json({ error: 'Vistoria já finalizada' });

  const { assinaturas = [] } = req.body as {
    assinaturas?: { tipo: string; imagem_base64: string }[];
  };

  // Create assinaturas and finalize in a transaction
  await prisma.$transaction([
    prisma.assinatura.createMany({
      data: assinaturas.map((a) => ({ ...a, vistoria_id: req.params.id })),
    }),
    prisma.vistoria.update({
      where: { id: req.params.id },
      data: { status: 'finalizado', data_fim: new Date() },
    }),
  ]);

  const finalizada = await prisma.vistoria.findUnique({
    where: { id: req.params.id },
    include: FULL_INCLUDE,
  });

  return res.json(finalizada);
});

// GET /vistorias/:id/pdf
router.get('/:id/pdf', async (req, res) => {
  const vistoria = await prisma.vistoria.findUnique({
    where: { id: req.params.id },
    include: FULL_INCLUDE,
  });

  if (!vistoria) return res.status(404).json({ error: 'Vistoria não encontrada' });

  try {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="vistoria-${req.params.id}.pdf"`);
    const pdfDoc = buildVistoriaPdf(vistoria);
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    console.error('[pdf] Error:', err);
    return res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
});

export default router;
