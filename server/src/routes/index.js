import { Router } from 'express';
import localLoginRoutes from './auth/login.js';
import localRegisterRoutes from './auth/register.js';
import localLogoutRoutes from './auth/logout.js';
import googleAuthRoutes from './auth/googleAuth.js';
import facebookAuthRoutes from './auth/facebookAuth.js';
import apiRoutes from './api/index.js';
import products from './data/product.js';
const router = Router();

router.use('/auth', localLoginRoutes);
router.use('/auth', localRegisterRoutes);
router.use('/auth', localLogoutRoutes);
// router.use('/auth', googleAuthRoutes);
// router.use('/auth', facebookAuthRoutes);
router.use('/api', apiRoutes);

router.get('/data/products', (req, res) => {
    res.json(products);
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// fallback 404 for API routes only - phải đặt cuối cùng
router.use('*', (req, res) => res.status(404).json({ message: 'API route not found' }));

export default router;
