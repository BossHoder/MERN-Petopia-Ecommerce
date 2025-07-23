import { Router } from 'express';
import usersRoutes from './users.js';
import productsRoutes from './products.js';
import categoriesRoutes from './categories.js';
import cartRoutes from './cart.js';
import orderRoutes from './orders.js';
import reviewRoutes from './reviews.js'; // Import review routes
// import messagesRoutes from './messages.js';

const router = Router();

router.use('/users', usersRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes); // Use review routes
// router.use('/messages', messagesRoutes);

export default router;
