import mongoose from 'mongoose';
import dotenv from 'dotenv';
import type { ConnectOptions } from 'mongoose';
dotenv.config();

/**
 * Automatically reads MONGODB_URI and replaces the connected database with
 * the testing database (default name: 'test') to prevent accidental purging
 * of data in the production/development/stage database.
 *
 * @example MONGODB_URI = 'mongodb://localhost:27017/development'
 * @returns 'mongodb://localhost:27017/test'
 */
export const useTestingDatabase = () => {
  if (process.env.MONGODB_URI)
    // replace the last part of the URI with 'test'
    return process.env.MONGODB_URI.replace(/\/[^/]+$/, '/test');
  else return process.env.MONGODB_URI || '';
};

/**
 * Connects the application to MongoDB
 */
export const connectMongoDB = async () => {
  try {
    let uri = process.env.MONGODB_URI || '';

    // if testing, use the testing database
    if (process.env.ENVIRONMENT === 'test') uri = useTestingDatabase();

    console.log('Connecting to MongoDB...');

    await mongoose.connect(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    } as ConnectOptions);
  } catch (err: any) {
    console.error(err.message);
  } finally {
    console.log('Successfully connected to MongoDB!');
  }
};
