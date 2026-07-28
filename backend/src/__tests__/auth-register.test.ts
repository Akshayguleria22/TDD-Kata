// backend/src/__tests__/auth-register.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import User from '../models/User';

describe('POST /api/auth/register', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    process.env.JWT_SECRET = 'test-secret-for-register';
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.name).toBe('John Doe');
    expect(res.body.data.user.email).toBe('john@example.com');
    expect(res.body.data.token).toBeDefined();
    // Password should NOT be in response
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('should hash the password before storing', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'PlainText123!',
      });

    const user = await User.findOne({ email: 'jane@example.com' });
    expect(user).toBeDefined();
    expect(user!.password).not.toBe('PlainText123!');
  });

  it('should return 400 if email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'No Email',
        password: 'Password123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBeDefined();
  });

  it('should return 400 if name is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'noname@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 if password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'No Pass',
        email: 'nopass@example.com',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 409 if email is already registered', async () => {
    // Register first user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'Password123!',
      });

    // Attempt duplicate registration
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Second User',
        email: 'duplicate@example.com',
        password: 'Password456!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already/i);
  });

  it('should default role to "user"', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Default Role',
        email: 'default@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('user');
  });

  it('should return a valid JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Token User',
        email: 'token@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    const token = res.body.data.token;
    expect(token).toBeDefined();
    expect(token.split('.')).toHaveLength(3); // JWT format
  });

  it('should validate email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bad Email',
        email: 'not-an-email',
        password: 'Password123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
