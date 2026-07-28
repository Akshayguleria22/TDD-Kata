// backend/src/config/database.ts
import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the MONGODB_URI environment variable.
 * Throws an error if the URI is not defined.
 */
export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  await mongoose.connect(uri);
};

/**
 * Disconnects from MongoDB gracefully.
 */
export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};
