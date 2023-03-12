import mongoose, { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Connects the application to MongoDB
 */
export const connectMongoDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    // TODO: Ensure that you have your MongoDB URI in your .env file, then uncomment the line below
    await mongoose.connect(process.env.MONGODB_URI!, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    } as ConnectOptions);
  } catch (err: any) {
    console.error(err.message);
  } finally {
    console.log('Successfully connected to MongoDB!');
  }
};
