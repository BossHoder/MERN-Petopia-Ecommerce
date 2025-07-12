import 'dotenv/config.js';
import express, { Router } from 'express';
import mongoose from 'mongoose';
// import https from 'https';
import { readFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import passport from 'passport';
import all_routes from 'express-list-endpoints';
import products from './data/Products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import routes from './routes/index.js';
// import { seedDb } from './utils/seed.js'; // Tạm thời comment out
import connectDB from './config/database.js';

const app = express();
const router = Router();

console.log('🚀 Server is starting...');

// Bodyparser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
import './services/jwtStrategy.js';
// import './services/facebookStrategy.js';
// import './services/googleStrategy.js';
import './services/localStrategy.js';

// Import models to register them with Mongoose
import './models/User.js';
import './models/Product.js';

import sampleProducts from './data/Products.js';

const isProduction = process.env.NODE_ENV === 'production';

// DB Config
const dbConnection = isProduction ? process.env.MONGO_URI_PROD : process.env.MONGO_URI_DEV;

// Connect to MongoDB
connectDB();
// seedDb(); // Tạm thời comment out để tránh lỗi

// Use Routes
app.use('/', routes);
app.use('/public/images', express.static(join(__dirname, '../public/images')));

// Debug: Show all available routes
app.get('/debug/routes', (req, res) => {
  res.json(all_routes(app));
});

// Serve static assets if in production
if (isProduction) {
  // Set static folder
  // nginx will handle this
  // app.use(express.static(join(__dirname, '../../client/build')));

  // app.get('*', (req, res) => {
  //   // index is in /server/src so 2 folders up
  //   res.sendFile(resolve(__dirname, '../..', 'client', 'build', 'index.html')); 
  // });


  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server started on port ${port}`));
} else {
  const port = process.env.PORT || 5000;
  app.get("/data/products", (req, res) => {
    res.json(products);
  });
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}
