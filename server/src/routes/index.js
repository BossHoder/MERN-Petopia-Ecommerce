import { Router } from 'express';
import localLoginRoutes from './auth/login.js';
import localRegisterRoutes from './auth/register.js';
import localLogoutRoutes from './auth/logout.js';
import googleAuthRoutes from './auth/googleAuth.js';
import facebookAuthRoutes from './auth/facebookAuth.js';
import apiRoutes from './api/index.js';
import products from './data/product.js';
const router = Router();

router.use('/', localLoginRoutes);
router.use('/', localRegisterRoutes);
router.use('/', localLogoutRoutes);
// router.use('/auth', googleAuthRoutes);
// router.use('/auth', facebookAuthRoutes);
router.use('/api', apiRoutes);

router.get('data/products', (req, res) => {
  res.json(products);
});

// fallback 404
router.use('/api', (req, res) => res.status(404).json('No route for this path'));

router.get('/', (req, res) => {
  res.status(200).send('<h1>Server của bạn đang chạyyyy!</h1><p>Đây là trang chủ.</p>');
});

export default router;
