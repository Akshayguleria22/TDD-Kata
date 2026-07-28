// backend/src/routes/vehicleRoutes.ts
import { Router } from 'express';
import { createVehicle, getVehicles } from '../controllers/vehicleController';
import { authMiddleware, adminOnlyMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All vehicle routes require authentication
router.use(authMiddleware);

router.post('/', adminOnlyMiddleware, createVehicle);
router.get('/', getVehicles);

export default router;
