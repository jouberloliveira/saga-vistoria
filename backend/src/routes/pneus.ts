import { Router, Request } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

interface Params { vistoriaId: string; pneuId: string }

const router = Router({ mergeParams: true });
router.use(authenticate);

router.get('/', async (req: Request<Params>, res) => {
  const pneus = await prisma.pneu.findMany({ where: { vistoria_id: req.params.vistoriaId } });
  res.json(pneus);
});

router.post('/', async (req: Request<Params>, res) => {
  const vistoria = await prisma.vistoria.findUnique({ where: { id: req.params.vistoriaId } });
  if (!vistoria) return res.status(404).json({ error: 'Vistoria não encontrada' });
  if (vistoria.status === 'finalizado') return res.status(409).json({ error: 'Vistoria já finalizada' });

  const { posicao, estado } = req.body as { posicao?: string; estado?: string };
  if (!posicao || !estado) return res.status(400).json({ error: 'posicao e estado são obrigatórios' });

  const pneu = await prisma.pneu.create({ data: { vistoria_id: req.params.vistoriaId, posicao, estado } });
  return res.status(201).json(pneu);
});

router.patch('/:pneuId', async (req: Request<Params>, res) => {
  const vistoria = await prisma.vistoria.findUnique({ where: { id: req.params.vistoriaId } });
  if (!vistoria) return res.status(404).json({ error: 'Vistoria não encontrada' });
  if (vistoria.status === 'finalizado') return res.status(409).json({ error: 'Vistoria já finalizada' });

  const { posicao, estado } = req.body as { posicao?: string; estado?: string };
  try {
    const pneu = await prisma.pneu.update({ where: { id: req.params.pneuId }, data: { posicao, estado } });
    return res.json(pneu);
  } catch {
    return res.status(404).json({ error: 'Pneu não encontrado' });
  }
});

router.delete('/:pneuId', async (req: Request<Params>, res) => {
  const vistoria = await prisma.vistoria.findUnique({ where: { id: req.params.vistoriaId } });
  if (!vistoria) return res.status(404).json({ error: 'Vistoria não encontrada' });
  if (vistoria.status === 'finalizado') return res.status(409).json({ error: 'Vistoria já finalizada' });

  try {
    await prisma.pneu.delete({ where: { id: req.params.pneuId } });
    return res.status(204).send();
  } catch {
    return res.status(404).json({ error: 'Pneu não encontrado' });
  }
});

export default router;
