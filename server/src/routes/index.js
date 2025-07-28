import { Router } from 'express';
import localLoginRoutes from './auth/login.js';
import localRegisterRoutes from './auth/register.js';
import localLogoutRoutes from './auth/logout.js';
import passwordResetRoutes from './auth/passwordReset.js';

import googleAuthRoutes from './auth/googleAuth.js';
import facebookAuthRoutes from './auth/facebookAuth.js';
import apiRoutes from './api/index.js';
import products from './data/product.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';
const router = Router();

router.use('/auth', localLoginRoutes);
router.use('/auth', localRegisterRoutes);
router.use('/auth', localLogoutRoutes);
router.use('/auth', passwordResetRoutes);

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
        message: ERROR_MESSAGES.SERVER_RUNNING,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// Note: No catch-all route here - let Express handle it in main app
export default router;
