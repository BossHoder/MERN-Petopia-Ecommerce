import { Router } from 'express';
import usersRoutes from './users.js';
import productsRoutes from './products.js';
// import messagesRoutes from './messages.js';

const router = Router();

router.use('/users', usersRoutes);
router.use('/products', productsRoutes);
// router.use('/messages', messagesRoutes);

export default router;
