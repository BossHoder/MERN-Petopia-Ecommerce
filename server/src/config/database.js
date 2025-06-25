import mongoose from 'mongoose';
import config from 'config';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || config.get('mongoURI');
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('Continuing without database connection...');
    // Comment out process.exit(1) to allow server to start without DB
    // process.exit(1);
  }
};

export default connectDB;
