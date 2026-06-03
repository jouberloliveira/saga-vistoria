import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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

const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, same-origin)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Rate-limit login endpoint: 10 attempts per 15 min per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});

app.use('/auth/login', loginLimiter);
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
