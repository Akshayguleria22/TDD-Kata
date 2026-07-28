// backend/src/__tests__/auth-login.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import User from '../models/User';

describe('POST /api/auth/login', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    process.env.JWT_SECRET = 'test-secret-for-login';
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    // Seed a test user
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      role: 'user',
    });
    // Seed an admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'AdminPass123!',
      role: 'admin',
    });
  });

  it('should login successfully with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe('test@example.com');
    expect(res.body.data.user.name).toBe('Test User');
    expect(res.body.data.token).toBeDefined();
    // Password should NOT be in response
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('should return user role in the response', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'AdminPass123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('admin');
  });

  it('should return a valid JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    const token = res.body.data.token;
    expect(token).toBeDefined();
    expect(token.split('.')).toHaveLength(3); // JWT format
  });

  it('should return 401 for incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('should return 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('should return 400 if email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        password: 'Password123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 if password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should include user id in the response', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.id).toBeDefined();
  });
});
