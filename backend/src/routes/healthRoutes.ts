// backend/src/routes/healthRoutes.ts
import { Router } from 'express';
import { getHealthMetrics } from '../controllers/healthController';
import { authMiddleware, adminOnlyMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Health metrics require admin authentication
router.get('/metrics', authMiddleware, adminOnlyMiddleware, getHealthMetrics);

export default router;
