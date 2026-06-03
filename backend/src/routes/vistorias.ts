import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

export const vistoriasRouter = Router();
vistoriasRouter.use(authenticate);

vistoriasRouter.get('/', async (req: AuthRequest, res) => {
  const { placa, cliente, funcionarioId, dataInicio, dataFim, page = '1', limit = '20' } = req.query;
  const where: Record<string, unknown> = {};
  if (placa) where.veiculo = { placa: { contains: String(placa), mode: 'insensitive' } };
  if (cliente) where.cliente = { nome: { contains: String(cliente), mode: 'insensitive' } };
  if (funcionarioId) where.funcionarioId = String(funcionarioId);
  if (dataInicio || dataFim) {
    where.dataInicio = {
      ...(dataInicio ? { gte: new Date(String(dataInicio)) } : {}),
      ...(dataFim ? { lte: new Date(String(dataFim)) } : {}),
    };
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [total, items] = await Promise.all([
    prisma.vistoria.count({ where }),
    prisma.vistoria.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { dataInicio: 'desc' },
      include: {
        veiculo: { select: { placa: true, marca: true, modelo: true, ano: true } },
        cliente: { select: { nome: true, documento: true } },
        funcionario: { select: { nome: true } },
        _count: { select: { fotos: true, danos: true } }
      }
    })
  ]);
  res.json({ total, page: Number(page), limit: Number(limit), items });
});

vistoriasRouter.post('/', async (req: AuthRequest, res) => {
  const { veiculo, cliente, observacoesGerais } = req.body;
  const veiculoRecord = await prisma.veiculo.upsert({
    where: { id: veiculo.id || 'new' },
    create: { placa: veiculo.placa, marca: veiculo.marca, modelo: veiculo.modelo, ano: veiculo.ano, cor: veiculo.cor, chassi: veiculo.chassi, quilometragem: veiculo.quilometragem },
    update: { quilometragem: veiculo.quilometragem, cor: veiculo.cor }
  });
  const clienteRecord = await prisma.cliente.upsert({
    where: { id: cliente.id || 'new' },
    create: { nome: cliente.nome, documento: cliente.documento, telefone: cliente.telefone, email: cliente.email },
    update: { nome: cliente.nome, telefone: cliente.telefone, email: cliente.email }
  });
  const vistoria = await prisma.vistoria.create({
    data: {
      veiculoId: veiculoRecord.id,
      clienteId: clienteRecord.id,
      funcionarioId: req.user!.id,
      observacoesGerais,
    },
    include: { veiculo: true, cliente: true, funcionario: { select: { nome: true } } }
  });
  res.status(201).json(vistoria);
});

vistoriasRouter.get('/:id', async (req, res) => {
  const vistoria = await prisma.vistoria.findUnique({
    where: { id: req.params.id },
    include: {
      veiculo: true,
      cliente: true,
      funcionario: { select: { id: true, nome: true } },
      pneus: true,
      danos: { include: { fotos: true } },
      itensFaltantes: true,
      fotos: true,
      assinaturas: true,
    }
  });
  if (!vistoria) { res.status(404).json({ error: 'Vistoria não encontrada' }); return; }
  res.json(vistoria);
});

vistoriasRouter.patch('/:id', async (req: AuthRequest, res) => {
  const existing = await prisma.vistoria.findUnique({ where: { id: req.params.id } });
  if (!existing) { res.status(404).json({ error: 'Vistoria não encontrada' }); return; }
  if (existing.status === 'finalizado') {
    res.status(403).json({ error: 'Vistoria finalizada não pode ser editada' });
    return;
  }
  const { observacoesGerais, nivelSujeiraInterna, nivelSujeiraExterna, pneus, danos, itensFaltantes } = req.body;

  await prisma.$transaction(async (tx) => {
    if (pneus) {
      await tx.pneu.deleteMany({ where: { vistoriaId: req.params.id } });
      if (pneus.length) await tx.pneu.createMany({ data: pneus.map((p: Record<string, unknown>) => ({ ...p, vistoriaId: req.params.id })) });
    }
    if (danos) {
      await tx.dano.deleteMany({ where: { vistoriaId: req.params.id } });
      if (danos.length) await tx.dano.createMany({ data: danos.map((d: Record<string, unknown>) => ({ ...d, vistoriaId: req.params.id })) });
    }
    if (itensFaltantes) {
      await tx.itemFaltante.deleteMany({ where: { vistoriaId: req.params.id } });
      if (itensFaltantes.length) await tx.itemFaltante.createMany({ data: itensFaltantes.map((i: Record<string, unknown>) => ({ ...i, vistoriaId: req.params.id })) });
    }
    await tx.vistoria.update({
      where: { id: req.params.id },
      data: { ...(observacoesGerais !== undefined && { observacoesGerais }), ...(nivelSujeiraInterna !== undefined && { nivelSujeiraInterna }), ...(nivelSujeiraExterna !== undefined && { nivelSujeiraExterna }) }
    });
  });

  const updated = await prisma.vistoria.findUnique({
    where: { id: req.params.id },
    include: { pneus: true, danos: true, itensFaltantes: true }
  });
  res.json(updated);
});

vistoriasRouter.post('/:id/finalizar', async (req: AuthRequest, res) => {
  const existing = await prisma.vistoria.findUnique({ where: { id: req.params.id } });
  if (!existing) { res.status(404).json({ error: 'Vistoria não encontrada' }); return; }
  if (existing.status === 'finalizado') {
    res.status(409).json({ error: 'Vistoria já finalizada' });
    return;
  }
  const { assinaturaFuncionario, assinaturaCliente } = req.body;
  if (!assinaturaFuncionario || !assinaturaCliente) {
    res.status(400).json({ error: 'Assinaturas do funcionário e do cliente são obrigatórias' });
    return;
  }
  await prisma.$transaction(async (tx) => {
    await tx.assinatura.createMany({
      data: [
        { vistoriaId: req.params.id, tipo: 'funcionario', imagemBase64: assinaturaFuncionario },
        { vistoriaId: req.params.id, tipo: 'cliente', imagemBase64: assinaturaCliente }
      ]
    });
    await tx.vistoria.update({
      where: { id: req.params.id },
      data: { status: 'finalizado', dataFim: new Date() }
    });
  });
  const vistoria = await prisma.vistoria.findUnique({
    where: { id: req.params.id },
    include: { veiculo: true, cliente: true, funcionario: { select: { nome: true } }, pneus: true, danos: { include: { fotos: true } }, itensFaltantes: true, fotos: true, assinaturas: true }
  });
  res.json(vistoria);
});

vistoriasRouter.get('/:id/pdf', async (req, res) => {
  const vistoria = await prisma.vistoria.findUnique({
    where: { id: req.params.id },
    include: { veiculo: true, cliente: true, funcionario: { select: { nome: true } }, pneus: true, danos: true, itensFaltantes: true, fotos: true, assinaturas: true }
  });
  if (!vistoria) { res.status(404).json({ error: 'Vistoria não encontrada' }); return; }

  const PdfPrinter = require('pdfmake');
  const fonts = {
    Helvetica: {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique',
      bolditalics: 'Helvetica-BoldOblique'
    }
  };
  const printer = new PdfPrinter(fonts);
  const docDefinition = {
    defaultStyle: { font: 'Helvetica' },
    content: [
      { text: 'SAGA — Comprovante de Vistoria Prévia Veicular', style: 'header' },
      { text: `Data: ${vistoria.dataInicio.toLocaleDateString('pt-BR')}`, margin: [0, 0, 0, 10] },
      { text: 'Veículo', style: 'sectionTitle' },
      { text: `Placa: ${vistoria.veiculo.placa} | Marca/Modelo: ${vistoria.veiculo.marca} ${vistoria.veiculo.modelo} | Ano: ${vistoria.veiculo.ano} | Cor: ${vistoria.veiculo.cor} | KM: ${vistoria.veiculo.quilometragem}` },
      { text: 'Cliente', style: 'sectionTitle', margin: [0, 10, 0, 0] },
      { text: `Nome: ${vistoria.cliente.nome} | Documento: ${vistoria.cliente.documento}` },
      { text: 'Pneus', style: 'sectionTitle', margin: [0, 10, 0, 0] },
      { ul: vistoria.pneus.map(p => `${p.posicao.replace(/_/g, ' ')}: ${p.estado}`) },
      { text: 'Danos', style: 'sectionTitle', margin: [0, 10, 0, 0] },
      vistoria.danos.length ? { ul: vistoria.danos.map(d => `${d.tipo} — ${d.localizacao} (${d.gravidade})${d.descricao ? ': ' + d.descricao : ''}`) } : { text: 'Nenhum dano registrado' },
      { text: 'Itens Faltantes', style: 'sectionTitle', margin: [0, 10, 0, 0] },
      vistoria.itensFaltantes.length ? { ul: vistoria.itensFaltantes.map(i => i.nome) } : { text: 'Nenhum item faltante' },
      { text: 'Assinaturas', style: 'sectionTitle', margin: [0, 10, 0, 0] },
      ...vistoria.assinaturas.map(a => ({ text: `${a.tipo === 'funcionario' ? 'Funcionário' : 'Cliente'}: assinado em ${a.dataHora.toLocaleDateString('pt-BR')}` })),
      { text: `Funcionário responsável: ${vistoria.funcionario.nome}`, margin: [0, 10, 0, 0] },
    ],
    styles: {
      header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
      sectionTitle: { fontSize: 12, bold: true }
    }
  };
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="vistoria-${vistoria.id}.pdf"`);
  pdfDoc.pipe(res);
  pdfDoc.end();
});
