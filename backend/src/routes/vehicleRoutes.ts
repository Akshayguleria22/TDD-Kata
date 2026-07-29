// backend/src/routes/vehicleRoutes.ts
import { Router } from 'express';
import { 
  createVehicle, 
  getVehicles, 
  searchVehicles, 
  updateVehicle, 
  deleteVehicle,
  purchaseVehicle,
  restockVehicle
} from '../controllers/vehicleController';
import { smartSearch } from '../controllers/smartSearchController';
import { authMiddleware, adminOnlyMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All vehicle routes require authentication
router.use(authMiddleware);

router.post('/', adminOnlyMiddleware, createVehicle);
router.post('/smart-search', smartSearch);
router.get('/search', searchVehicles);
router.get('/', getVehicles);

router.put('/:id', adminOnlyMiddleware, updateVehicle);
router.delete('/:id', adminOnlyMiddleware, deleteVehicle);

router.post('/:id/purchase', purchaseVehicle); // Any authenticated user
router.post('/:id/restock', adminOnlyMiddleware, restockVehicle); // Admin only

export default router;
