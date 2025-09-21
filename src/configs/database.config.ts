import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string, {});

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Unable to connect to MongoDB:', error.message);
    } else {
      console.error('An unknown error occurred while connecting to MongoDB:', error);
    }
    process.exit(1);
  }
};

export default connectDB;
