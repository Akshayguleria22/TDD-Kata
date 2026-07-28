// backend/src/app.ts
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import vehicleRoutes from './routes/vehicleRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/ping', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

export default app;