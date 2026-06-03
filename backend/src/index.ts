import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { authRouter } from './routes/auth';
import { funcionariosRouter } from './routes/funcionarios';
import { vistoriasRouter } from './routes/vistorias';
import { fotosRouter } from './routes/fotos';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOADS_DIR || './uploads')));

app.use('/auth', authRouter);
app.use('/funcionarios', funcionariosRouter);
app.use('/vistorias', vistoriasRouter);
app.use('/fotos', fotosRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`SAGA Vistoria API running on http://localhost:${PORT}`);
});
