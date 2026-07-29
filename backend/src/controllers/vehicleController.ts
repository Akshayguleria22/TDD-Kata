// backend/src/controllers/vehicleController.ts
import { Request, Response } from 'express';
import Vehicle from '../models/Vehicle';
import { getIO } from '../socket';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minute TTL


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
    
    cache.del("all_vehicles");

    // Emit real-time update
    try { getIO().emit('inventory_updated', vehicle); } catch (e) {}
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
    const cachedVehicles = cache.get("all_vehicles");
    if (cachedVehicles) {
      res.status(200).json({
        success: true,
        data: cachedVehicles,
      });
      return;
    }

    const vehicles = await Vehicle.find({});
    
    cache.set("all_vehicles", vehicles);

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

/**
 * GET /api/vehicles/search
 * Search vehicles by make, model, category (partial matches) and minPrice/maxPrice
 */
export const searchVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { make, model, category, minPrice, maxPrice } = req.query;
    
    // Build filter object
    const filter: any = {};

    if (make) {
      filter.make = { $regex: make as string, $options: 'i' };
    }
    if (model) {
      filter.model = { $regex: model as string, $options: 'i' };
    }
    if (category) {
      filter.category = { $regex: category as string, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    const vehicles = await Vehicle.find(filter);

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

/**
 * PUT /api/vehicles/:id
 * Update a vehicle (Admin only)
 */
export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if valid ObjectId
    if (typeof id !== 'string' || !id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
      return;
    }

    const vehicle = await Vehicle.findByIdAndUpdate(id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!vehicle) {
      res.status(404).json({ success: false, message: 'Vehicle not found' });
      return;
    }

    res.status(200).json({ success: true, data: vehicle });

    cache.del("all_vehicles");

    // Emit real-time update
    try { getIO().emit('inventory_updated', vehicle); } catch (e) {}
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * DELETE /api/vehicles/:id
 * Delete a vehicle (Admin only)
 */
export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if valid ObjectId
    if (typeof id !== 'string' || !id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
      return;
    }

    const vehicle = await Vehicle.findByIdAndDelete(id);

    if (!vehicle) {
      res.status(404).json({ success: false, message: 'Vehicle not found' });
      return;
    }

    res.status(200).json({ success: true, data: {} });

    cache.del("all_vehicles");

    // Emit real-time update
    try { getIO().emit('inventory_deleted', id); } catch (e) {}
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * POST /api/vehicles/:id/purchase
 * Purchase a vehicle (decrease stock by 1 atomically)
 */
export const purchaseVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string' || !id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
      return;
    }

    // Atomic update: only decrement if quantity > 0
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: id, quantity: { $gt: 0 } },
      { $inc: { quantity: -1 } },
      { returnDocument: 'after', runValidators: true }
    );

    if (!vehicle) {
      // Differentiate between 404 Not Found and 400 Out of Stock
      const existingVehicle = await Vehicle.findById(id);
      if (!existingVehicle) {
        res.status(404).json({ success: false, message: 'Vehicle not found' });
        return;
      }
      res.status(400).json({ success: false, message: 'Vehicle is out of stock' });
      return;
    }

    res.status(200).json({ success: true, data: vehicle });

    cache.del("all_vehicles");

    // Emit real-time update
    try { getIO().emit('inventory_updated', vehicle); } catch (e) {}
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * POST /api/vehicles/:id/restock
 * Restock a vehicle (increase stock atomically, Admin only)
 */
export const restockVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let { quantityToAdd } = req.body;

    if (typeof id !== 'string' || !id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
      return;
    }

    if (quantityToAdd === undefined) {
      quantityToAdd = 1;
    }

    if (typeof quantityToAdd !== 'number' || quantityToAdd < 0) {
      res.status(400).json({ success: false, message: 'quantityToAdd must be a positive number' });
      return;
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { $inc: { quantity: quantityToAdd } },
      { returnDocument: 'after', runValidators: true }
    );

    if (!vehicle) {
      res.status(404).json({ success: false, message: 'Vehicle not found' });
      return;
    }

    res.status(200).json({ success: true, data: vehicle });

    cache.del("all_vehicles");

    // Emit real-time update
    try { getIO().emit('inventory_updated', vehicle); } catch (e) {}
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
