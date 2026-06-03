import { Router, Request } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

interface Params { vistoriaId: string; itemId: string }

const router = Router({ mergeParams: true });
router.use(authenticate);

router.get('/', async (req: Request<Params>, res) => {
  const itens = await prisma.itemFaltante.findMany({ where: { vistoria_id: req.params.vistoriaId } });
  res.json(itens);
});

router.post('/', async (req: Request<Params>, res) => {
  const vistoria = await prisma.vistoria.findUnique({ where: { id: req.params.vistoriaId } });
  if (!vistoria) return res.status(404).json({ error: 'Vistoria não encontrada' });
  if (vistoria.status === 'finalizado') return res.status(409).json({ error: 'Vistoria já finalizada' });

  const { nome } = req.body as { nome?: string };
  if (!nome) return res.status(400).json({ error: 'nome é obrigatório' });

  const item = await prisma.itemFaltante.create({ data: { vistoria_id: req.params.vistoriaId, nome } });
  return res.status(201).json(item);
});

router.delete('/:itemId', async (req: Request<Params>, res) => {
  const vistoria = await prisma.vistoria.findUnique({ where: { id: req.params.vistoriaId } });
  if (!vistoria) return res.status(404).json({ error: 'Vistoria não encontrada' });
  if (vistoria.status === 'finalizado') return res.status(409).json({ error: 'Vistoria já finalizada' });

  try {
    await prisma.itemFaltante.delete({ where: { id: req.params.itemId } });
    return res.status(204).send();
  } catch {
    return res.status(404).json({ error: 'Item não encontrado' });
  }
});

export default router;
