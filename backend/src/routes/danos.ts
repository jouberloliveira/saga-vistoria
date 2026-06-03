import { Router, Request } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

interface Params { vistoriaId: string; danoId: string }

const router = Router({ mergeParams: true });
router.use(authenticate);

router.get('/', async (req: Request<Params>, res) => {
  const danos = await prisma.dano.findMany({
    where: { vistoria_id: req.params.vistoriaId },
    include: { fotos: true },
  });
  res.json(danos);
});

router.post('/', async (req: Request<Params>, res) => {
  const vistoria = await prisma.vistoria.findUnique({ where: { id: req.params.vistoriaId } });
  if (!vistoria) return res.status(404).json({ error: 'Vistoria não encontrada' });
  if (vistoria.status === 'finalizado') return res.status(409).json({ error: 'Vistoria já finalizada' });

  const { tipo, localizacao, gravidade, descricao } = req.body as {
    tipo?: string; localizacao?: string; gravidade?: string; descricao?: string;
  };

  if (!tipo || !localizacao || !gravidade) {
    return res.status(400).json({ error: 'tipo, localizacao e gravidade são obrigatórios' });
  }

  const dano = await prisma.dano.create({
    data: { vistoria_id: req.params.vistoriaId, tipo, localizacao, gravidade, descricao },
    include: { fotos: true },
  });
  return res.status(201).json(dano);
});

router.patch('/:danoId', async (req: Request<Params>, res) => {
  const vistoria = await prisma.vistoria.findUnique({ where: { id: req.params.vistoriaId } });
  if (!vistoria) return res.status(404).json({ error: 'Vistoria não encontrada' });
  if (vistoria.status === 'finalizado') return res.status(409).json({ error: 'Vistoria já finalizada' });

  const { tipo, localizacao, gravidade, descricao } = req.body as {
    tipo?: string; localizacao?: string; gravidade?: string; descricao?: string;
  };

  try {
    const dano = await prisma.dano.update({
      where: { id: req.params.danoId },
      data: { tipo, localizacao, gravidade, descricao },
      include: { fotos: true },
    });
    return res.json(dano);
  } catch {
    return res.status(404).json({ error: 'Dano não encontrado' });
  }
});

router.delete('/:danoId', async (req: Request<Params>, res) => {
  const vistoria = await prisma.vistoria.findUnique({ where: { id: req.params.vistoriaId } });
  if (!vistoria) return res.status(404).json({ error: 'Vistoria não encontrada' });
  if (vistoria.status === 'finalizado') return res.status(409).json({ error: 'Vistoria já finalizada' });

  try {
    await prisma.dano.delete({ where: { id: req.params.danoId } });
    return res.status(204).send();
  } catch {
    return res.status(404).json({ error: 'Dano não encontrado' });
  }
});

export default router;
