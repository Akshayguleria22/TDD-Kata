import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import { generateToken } from '../utils/auth';

describe('Vehicle API - Update & Delete', () => {
  let mongoServer: MongoMemoryServer;
  let adminToken: string;
  let userToken: string;
  let vehicleId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    process.env.JWT_SECRET = 'test-secret-for-vehicle-crud';

    // Seed users
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'AdminPass123!',
      role: 'admin',
    });
    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'Password123!',
      role: 'user',
    });

    adminToken = generateToken(adminUser._id!.toString(), 'admin');
    userToken = generateToken(regularUser._id!.toString(), 'user');
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Vehicle.deleteMany({});
    const vehicle = await Vehicle.create({
      make: 'Toyota',
      model: 'Camry',
      category: 'Sedan',
      price: 25000,
      year: 2023,
      quantity: 5,
    });
    vehicleId = vehicle._id!.toString();
  });

  describe('PUT /api/vehicles/:id', () => {
    it('should update a vehicle if user is admin', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 26000, quantity: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toBe(26000);
      expect(res.body.data.quantity).toBe(10);
      expect(res.body.data.make).toBe('Toyota'); // other fields remain unchanged
    });

    it('should return 404 if vehicle not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .put(`/api/vehicles/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 26000 });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 403 if user is not admin', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ price: 26000 });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 if unauthenticated', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .send({ price: 26000 });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
    
    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .put('/api/vehicles/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 26000 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('should delete a vehicle if user is admin', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const vehicleInDb = await Vehicle.findById(vehicleId);
      expect(vehicleInDb).toBeNull();
    });

    it('should return 404 if vehicle not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .delete(`/api/vehicles/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 403 if user is not admin', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);

      // Vehicle should still exist
      const vehicleInDb = await Vehicle.findById(vehicleId);
      expect(vehicleInDb).toBeDefined();
    });

    it('should return 401 if unauthenticated', async () => {
      const res = await request(app).delete(`/api/vehicles/${vehicleId}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
    
    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .delete('/api/vehicles/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
