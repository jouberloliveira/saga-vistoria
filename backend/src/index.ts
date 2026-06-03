import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';

import { initDb, prisma } from './lib/prisma';
import { startAutoBackup } from './lib/backup';
import authRouter from './routes/auth';
import funcionariosRouter from './routes/funcionarios';
import vistoriasRouter from './routes/vistorias';
import pneusRouter from './routes/pneus';
import danosRouter from './routes/danos';
import itensFaltantesRouter from './routes/itensFaltantes';
import { fotosNestedRouter, fotosRouter } from './routes/fotos';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRouter);
app.use('/funcionarios', funcionariosRouter);
app.use('/vistorias', vistoriasRouter);
app.use('/vistorias/:vistoriaId/pneus', pneusRouter);
app.use('/vistorias/:vistoriaId/danos', danosRouter);
app.use('/vistorias/:vistoriaId/itens-faltantes', itensFaltantesRouter);
app.use('/vistorias/:vistoriaId/fotos', fotosNestedRouter);
app.use('/fotos', fotosRouter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: err.message || 'Erro interno' });
});

async function bootstrap() {
  await initDb();
  console.log('[db] Schema initialized (PGlite)');

  // Seed admin if no users exist
  const count = await prisma.funcionario.count();
  if (count === 0) {
    const bcrypt = await import('bcryptjs');
    const senha_hash = await bcrypt.hash('admin123', 12);
    await prisma.funcionario.create({
      data: { nome: 'Administrador', usuario: 'admin', senha_hash, role: 'admin', ativo: true },
    });
    console.log('[seed] Admin user created: admin / admin123');
  }

  startAutoBackup();
  console.log('[backup] Auto-backup started (every 1h, keep 7 days)');

  app.listen(PORT, () => {
    console.log(`[server] SAGA Vistoria backend running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});
