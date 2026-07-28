import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import { generateToken } from '../utils/auth';

describe('Vehicle API - Search & Filter', () => {
  let mongoServer: MongoMemoryServer;
  let userToken: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    process.env.JWT_SECRET = 'test-secret-for-vehicle-search';

    // Seed a regular user for authentication
    const user = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'Password123!',
      role: 'user',
    });
    userToken = generateToken(user._id!.toString(), 'user');
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Vehicle.deleteMany({});
    
    // Seed vehicles for search tests
    await Vehicle.insertMany([
      { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, year: 2023, quantity: 5 },
      { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000, year: 2022, quantity: 10 },
      { make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, year: 2023, quantity: 8 },
      { make: 'Honda', model: 'CR-V', category: 'SUV', price: 30000, year: 2024, quantity: 3 },
      { make: 'Ford', model: 'F-150', category: 'Truck', price: 40000, year: 2023, quantity: 2 },
      { make: 'Tesla', model: 'Model 3', category: 'Electric', price: 45000, year: 2024, quantity: 4 },
    ]);
  });

  describe('GET /api/vehicles/search', () => {
    it('should return 401 if unauthenticated', async () => {
      const res = await request(app).get('/api/vehicles/search');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return all vehicles if no query params provided', async () => {
      const res = await request(app)
        .get('/api/vehicles/search')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(6);
    });

    it('should filter by make (case-insensitive partial match)', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=toy')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].make).toBe('Toyota');
      expect(res.body.data[1].make).toBe('Toyota');
    });

    it('should filter by model (case-insensitive partial match)', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?model=civ')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].model).toBe('Civic');
    });

    it('should filter by category (case-insensitive partial match)', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?category=suv')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].make).toBe('Honda');
      expect(res.body.data[0].model).toBe('CR-V');
    });

    it('should filter by minPrice', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?minPrice=35000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      const makes = res.body.data.map((v: any) => v.make);
      expect(makes).toContain('Ford');
      expect(makes).toContain('Tesla');
    });

    it('should filter by maxPrice', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?maxPrice=23000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      const models = res.body.data.map((v: any) => v.model);
      expect(models).toContain('Corolla');
      expect(models).toContain('Civic');
    });

    it('should filter by minPrice and maxPrice simultaneously', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?minPrice=22000&maxPrice=30000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);
      const models = res.body.data.map((v: any) => v.model);
      expect(models).toContain('Camry');
      expect(models).toContain('Civic');
      expect(models).toContain('CR-V');
    });

    it('should combine multiple filters (make and price)', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=honda&maxPrice=25000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].make).toBe('Honda');
      expect(res.body.data[0].model).toBe('Civic');
    });

    it('should return empty array when no vehicles match', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=ferrari')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(0);
    });
  });
});
