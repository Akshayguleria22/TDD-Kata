// backend/src/__tests__/database.test.ts
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB, disconnectDB } from '../config/database';

describe('Database Connection', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
  });

  afterAll(async () => {
    await disconnectDB();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Reset connection state between tests
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('should connect to MongoDB successfully', async () => {
    await connectDB();
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });

  it('should use the MONGODB_URI environment variable', async () => {
    const expectedUri = process.env.MONGODB_URI;
    await connectDB();
    // Verify connection is established to the URI from env
    expect(mongoose.connection.readyState).toBe(1);
    expect(expectedUri).toBeDefined();
  });

  it('should throw an error if MONGODB_URI is not defined', async () => {
    const originalUri = process.env.MONGODB_URI;
    delete process.env.MONGODB_URI;

    await expect(connectDB()).rejects.toThrow('MONGODB_URI is not defined');

    // Restore for other tests
    process.env.MONGODB_URI = originalUri;
  });

  it('should export a disconnectDB function that closes the connection', async () => {
    await connectDB();
    expect(mongoose.connection.readyState).toBe(1);

    await disconnectDB();
    expect(mongoose.connection.readyState).toBe(0); // 0 = disconnected
  });
});
