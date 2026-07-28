// backend/src/controllers/vehicleController.ts
import { Request, Response } from 'express';
import Vehicle from '../models/Vehicle';

/**
 * POST /api/vehicles
 * Create a new vehicle (Admin only)
 */
export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { make, model, category, price, quantity, year, description } = req.body;

    if (!make || !model || !category || price === undefined || !year) {
      res.status(400).json({
        success: false,
        message: 'Please provide make, model, category, price, and year',
      });
      return;
    }

    const vehicle = await Vehicle.create({
      make,
      model,
      category,
      price,
      quantity,
      year,
      description,
    });

    res.status(201).json({
      success: true,
      data: vehicle,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * GET /api/vehicles
 * Get a list of all available vehicles (Authenticated users)
 */
export const getVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicles = await Vehicle.find({});
    res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
