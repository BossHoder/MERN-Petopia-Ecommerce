import 'dotenv/config.js';
import express, { Router } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
// import https from 'https';
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
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

// CORS Middleware
const allowedOrigins = isProduction
    ? [
          'https://petopiavn.live',
          'https://www.petopiavn.live',
          'https://petopia-12598ae75272.herokuapp.com',
          process.env.CLIENT_URL_PROD,
      ].filter(Boolean) // Remove any undefined values
    : ['http://localhost:3000', 'https://localhost:3000'];

console.log('🌐 CORS Configuration:');
console.log('Environment:', process.env.NODE_ENV);
console.log('Allowed Origins:', allowedOrigins);

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    }),
);

// Bodyparser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(passport.initialize());
import './services/jwtStrategy.js';
// import './services/facebookStrategy.js';
// import './services/googleStrategy.js';
import './services/localStrategy.js';

// Import models to register them with Mongoose
import './models/User.js';
import './models/Product.js';

const isProduction = process.env.NODE_ENV === 'production';

const dbConnection = isProduction ? process.env.MONGO_URI_PROD : process.env.MONGO_URI_DEV;

connectDB();

// SIMPLE STATIC FILE SERVING - MOVE TO TOP
app.use('/public', express.static(join(__dirname, '../public')));

console.log('📁 Static files served from:', join(__dirname, '../public'));
console.log('🔗 Access via: http://localhost:5000/public/images/filename');

// Routes come after static files
app.use('/', routes);

// Debug static paths
console.log('Public images path:', join(__dirname, '../public/images'));

console.log('Files in public/images:');
try {
    const files = readdirSync(join(__dirname, '../public/images'));
    console.log(files);
} catch (err) {
    console.error('Error reading public/images:', err.message);
}

// Debug: Show all available routes
app.get('/debug/routes', (req, res) => {
    res.json(all_routes(app));
});

// Debug: Check static files
app.get('/debug/static', (req, res) => {
    const publicDir = join(__dirname, '../public/images');
    try {
        const files = readdirSync(publicDir);
        res.json({
            publicDir,
            files: files.map((file) => ({
                name: file,
                url: `${req.protocol}://${req.get('host')}/public/images/${file}`,
            })),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve static assets if in production
if (isProduction) {
    // Set static folder - serve React build files
    app.use(express.static(join(__dirname, '../../client/build')));

    // IMPORTANT: Catch-all handler for React Router (must be LAST)
    app.get('*', (req, res) => {
        // Serve React index.html for all routes not handled above
        res.sendFile(resolve(__dirname, '../..', 'client', 'build', 'index.html'));
    });
} // Port configuration - let Heroku assign port automatically
const port = process.env.PORT || (isProduction ? 80 : 5000);

app.listen(port, '0.0.0.0', () => {
    if (isProduction) {
        console.log(`🚀 Production server running on port ${port}`);
        console.log(`🌐 App URL: https://petopia-12598ae75272.herokuapp.com`);
    } else {
        console.log(`🚀 Development server running at http://localhost:${port}`);
    }
});
