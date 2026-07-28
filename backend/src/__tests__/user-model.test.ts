// backend/src/__tests__/user-model.test.ts
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User, { IUser } from '../models/User';

describe('User Model', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should create a user with valid fields', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
    };

    const user = await User.create(userData);

    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.role).toBe('user'); // default role
    expect(user._id).toBeDefined();
    expect(user.createdAt).toBeDefined();
  });

  it('should hash the password before saving', async () => {
    const user = await User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'PlainTextPass123!',
    });

    // Password should NOT be stored as plain text
    expect(user.password).not.toBe('PlainTextPass123!');
    expect(user.password.length).toBeGreaterThan(20); // bcrypt hashes are long
  });

  it('should validate correct password using comparePassword method', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'MyPassword123!',
    });

    const isMatch = await user.comparePassword('MyPassword123!');
    expect(isMatch).toBe(true);
  });

  it('should reject incorrect password using comparePassword method', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test2@example.com',
      password: 'MyPassword123!',
    });

    const isMatch = await user.comparePassword('WrongPassword');
    expect(isMatch).toBe(false);
  });

  it('should require name, email, and password', async () => {
    const user = new User({});

    const validationError = user.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError!.errors.name).toBeDefined();
    expect(validationError!.errors.email).toBeDefined();
    expect(validationError!.errors.password).toBeDefined();
  });

  it('should enforce unique email constraint', async () => {
    await User.create({
      name: 'First User',
      email: 'duplicate@example.com',
      password: 'Password123!',
    });

    await expect(
      User.create({
        name: 'Second User',
        email: 'duplicate@example.com',
        password: 'Password456!',
      })
    ).rejects.toThrow();
  });

  it('should support admin and user roles', async () => {
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'AdminPass123!',
      role: 'admin',
    });

    const regularUser = await User.create({
      name: 'Regular',
      email: 'regular@example.com',
      password: 'UserPass123!',
    });

    expect(adminUser.role).toBe('admin');
    expect(regularUser.role).toBe('user');
  });

  it('should reject invalid role values', async () => {
    const user = new User({
      name: 'Bad Role',
      email: 'badrole@example.com',
      password: 'Password123!',
      role: 'superadmin',
    });

    const validationError = user.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError!.errors.role).toBeDefined();
  });
});
