import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

import authRoutes from './routes/auth';
import employeeRoutes from './routes/employees';
import vehicleRoutes from './routes/vehicles';
import inspectionRoutes from './routes/inspections';
import photoRoutes from './routes/photos';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3000', 10);
const UPLOADS_DIR = process.env.UPLOADS_DIR ?? './uploads';

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.resolve(UPLOADS_DIR)));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/inspections/:id/photos', photoRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.message);
  res.status(500).json({ error: err.message ?? 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`SAGA Vistoria API rodando na porta ${PORT}`);
});

export default app;
