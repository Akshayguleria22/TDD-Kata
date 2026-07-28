import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import { generateToken } from '../utils/auth';

describe('Vehicle API - Create & List', () => {
  let mongoServer: MongoMemoryServer;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    process.env.JWT_SECRET = 'test-secret-for-vehicle-api';

    // Seed test users
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

  afterEach(async () => {
    await Vehicle.deleteMany({});
  });

  const validVehicleData = {
    make: 'Toyota',
    model: 'Corolla',
    category: 'Sedan',
    price: 20000,
    year: 2023,
    quantity: 10,
    description: 'Compact car',
  };

  describe('POST /api/vehicles', () => {
    it('should create a vehicle if user is admin', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validVehicleData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.make).toBe('Toyota');
      expect(res.body.data._id).toBeDefined();

      const vehicleInDb = await Vehicle.findById(res.body.data._id);
      expect(vehicleInDb).toBeDefined();
    });

    it('should return 403 if user is not admin', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validVehicleData);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 if unauthenticated', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .send(validVehicleData);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ make: 'Toyota' }); // missing other fields

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/vehicles', () => {
    beforeEach(async () => {
      await Vehicle.create([
        validVehicleData,
        { ...validVehicleData, make: 'Honda', model: 'Civic' },
      ]);
    });

    it('should return a list of vehicles for authenticated users', async () => {
      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    it('should return 401 if unauthenticated', async () => {
      const res = await request(app).get('/api/vehicles');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
