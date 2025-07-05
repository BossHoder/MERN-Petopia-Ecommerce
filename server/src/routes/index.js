import { Router } from 'express';
import localAuthRoutes from './localAuth.js';
import googleAuthRoutes from './googleAuth.js';
import facebookAuthRoutes from './facebookAuth.js';
import apiRoutes from './api/index.js';
const router = Router();

router.use('/auth', localAuthRoutes);
// router.use('/auth', googleAuthRoutes);
// router.use('/auth', facebookAuthRoutes);
router.use('/api', apiRoutes);
// fallback 404
router.use('/api', (req, res) => res.status(404).json('No route for this path'));
router.get('/', (req, res) => {
  res.status(200).send('<h1>Server của bạn đang chạyyyy!</h1><p>Đây là trang chủ.</p>');
});
router.get('/health', (req, res) => {
  res.status(200).send({ status: 'ok' });
});
export default router;

/*
routes:

GET /auth/google
GET /auth/google/callback

GET /auth/facebook
GET /auth/facebook/callback

POST /auth/login
POST /auth/register
GET /auth/logout

GET api/users/me
GET /api/users/feature

*/
