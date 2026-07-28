// backend/src/__tests__/auth-middleware.test.ts
import request from 'supertest';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { authMiddleware, adminOnlyMiddleware } from '../middleware/authMiddleware';
import User from '../models/User';
import { generateToken } from '../utils/auth';

// Create a test app with protected routes
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Route protected by authMiddleware only
  app.get('/protected', authMiddleware, (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Access granted',
      user: (req as any).user,
    });
  });

  // Route protected by both authMiddleware and adminOnlyMiddleware
  app.get('/admin', authMiddleware, adminOnlyMiddleware, (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Admin access granted',
      user: (req as any).user,
    });
  });

  return app;
};

describe('Auth Middleware', () => {
  let mongoServer: MongoMemoryServer;
  let testApp: express.Express;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    process.env.JWT_SECRET = 'test-secret-for-middleware';
    testApp = createTestApp();

    // Create test users
    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'Password123!',
      role: 'user',
    });

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'AdminPass123!',
      role: 'admin',
    });

    userToken = generateToken(regularUser._id!.toString(), 'user');
    adminToken = generateToken(adminUser._id!.toString(), 'admin');
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('authMiddleware', () => {
    it('should allow access with a valid token', async () => {
      const res = await request(testApp)
        .get('/protected')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('user@example.com');
    });

    it('should attach user object to request', async () => {
      const res = await request(testApp)
        .get('/protected')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.name).toBe('Regular User');
      expect(res.body.user.role).toBe('user');
      // Password should not be attached
      expect(res.body.user.password).toBeUndefined();
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(testApp).get('/protected');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/token/i);
    });

    it('should return 401 if token is invalid', async () => {
      const res = await request(testApp)
        .get('/protected')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 if Authorization header format is wrong', async () => {
      const res = await request(testApp)
        .get('/protected')
        .set('Authorization', userToken); // Missing "Bearer" prefix

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 if token is expired', async () => {
      const expiredToken = generateToken('someid', 'user', '0s');

      const res = await request(testApp)
        .get('/protected')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('adminOnlyMiddleware', () => {
    it('should allow access for admin users', async () => {
      const res = await request(testApp)
        .get('/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Admin access granted');
    });

    it('should deny access for regular users', async () => {
      const res = await request(testApp)
        .get('/admin')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/admin/i);
    });
  });
});
