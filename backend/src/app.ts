import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import routes from './routes/index';
import { errorHandler } from './middlewares/error';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.json({ status: 'ok', db: connected ? 'connected' : 'disconnected' });
});

app.use('/api', routes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route introuvable' });
});

app.use(errorHandler);

export default app;