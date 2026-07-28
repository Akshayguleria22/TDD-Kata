import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import { generateToken } from '../utils/auth';

describe('Vehicle API - Inventory Management', () => {
  let mongoServer: MongoMemoryServer;
  let adminToken: string;
  let userToken: string;
  let vehicleId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    process.env.JWT_SECRET = 'test-secret-for-inventory';

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
      quantity: 2, // Start with 2
    });
    vehicleId = vehicle._id!.toString();
  });

  describe('POST /api/vehicles/:id/purchase', () => {
    it('should successfully decrease quantity by 1 when purchased', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quantity).toBe(1);

      const dbVehicle = await Vehicle.findById(vehicleId);
      expect(dbVehicle?.quantity).toBe(1);
    });

    it('should return 400 "Out of Stock" if quantity is 0', async () => {
      await Vehicle.findByIdAndUpdate(vehicleId, { quantity: 0 });

      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/out of stock/i);
    });

    it('should handle concurrent purchases atomically (prevent negative stock)', async () => {
      await Vehicle.findByIdAndUpdate(vehicleId, { quantity: 1 });

      // Simulate 3 concurrent purchases of a vehicle with only 1 in stock
      const responses = await Promise.all([
        request(app).post(`/api/vehicles/${vehicleId}/purchase`).set('Authorization', `Bearer ${userToken}`),
        request(app).post(`/api/vehicles/${vehicleId}/purchase`).set('Authorization', `Bearer ${userToken}`),
        request(app).post(`/api/vehicles/${vehicleId}/purchase`).set('Authorization', `Bearer ${userToken}`),
      ]);

      const successCount = responses.filter((r) => r.status === 200).length;
      const failCount = responses.filter((r) => r.status === 400).length;

      expect(successCount).toBe(1);
      expect(failCount).toBe(2);

      const finalVehicle = await Vehicle.findById(vehicleId);
      expect(finalVehicle?.quantity).toBe(0); // Should not be negative
    });

    it('should return 404 if vehicle does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post(`/api/vehicles/${fakeId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
    
    it('should return 401 if unauthenticated', async () => {
      const res = await request(app).post(`/api/vehicles/${vehicleId}/purchase`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/vehicles/:id/restock', () => {
    it('should increase quantity by provided amount (admin only)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantityToAdd: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quantity).toBe(7); // 2 + 5
    });

    it('should default to increasing quantity by 1 if not provided', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.data.quantity).toBe(3); // 2 + 1
    });

    it('should return 400 if quantityToAdd is negative', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantityToAdd: -2 });

      expect(res.status).toBe(400);
    });

    it('should return 403 if user is not admin', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantityToAdd: 5 });

      expect(res.status).toBe(403);
    });
    
    it('should return 404 if vehicle does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post(`/api/vehicles/${fakeId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantityToAdd: 5 });

      expect(res.status).toBe(404);
    });
  });
});
