import { Router } from 'express';
import usersRoutes from './users.js';
// import messagesRoutes from './messages.js';
// import productsRoutes from './products.js';

const router = Router();

router.use('/users', usersRoutes);
// router.use('/messages', messagesRoutes);
// router.use('/products', productsRoutes);

export default router;
