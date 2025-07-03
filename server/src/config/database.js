import mongoose from 'mongoose';
import config from 'config';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI_DEV || config.get('mongoURI');
    
    if (!mongoURI) {
      throw new Error('MongoDB URI not found in config or environment variables');
    }
    
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Database connection error:', error.message);
    throw error;
  }
};

export default connectDB;
