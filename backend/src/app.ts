// backend/src/app.ts
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import healthRoutes from './routes/healthRoutes';
import { trackLatency } from './controllers/healthController';

const app = express();

app.use(cors());
app.use(express.json());

// API latency tracking middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    trackLatency(Date.now() - start);
  });
  next();
});

// Health check
app.get('/api/ping', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/health', healthRoutes);

export default app;