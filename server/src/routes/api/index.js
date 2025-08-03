import { Router } from 'express';
import usersRoutes from './users.js';
import productsRoutes from './products.js';
import categoriesRoutes from './categories.js';
import cartRoutes from './cart.js';
import orderRoutes from './orders.js';
import reviewRoutes from './reviews.js'; // Import review routes
import breadcrumbRoutes from './breadcrumb.js'; // Import breadcrumb routes
import adminRoutes from './admin.js'; // Import admin routes
import stockRoutes from './stock.js'; // Import stock management routes
import couponRoutes from './coupons.js'; // Import public coupon routes
import notificationRoutes from './notifications.js'; // Import notification routes

// import messagesRoutes from './messages.js';

const router = Router();

router.use('/users', usersRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes); // Use review routes
router.use('/breadcrumb', breadcrumbRoutes); // Use breadcrumb routes
router.use('/admin', adminRoutes); // Use admin routes
router.use('/stock', stockRoutes); // Use stock management routes
router.use('/coupons', couponRoutes); // Use public coupon routes
router.use('/notifications', notificationRoutes); // Use notification routes

// router.use('/messages', messagesRoutes);

export default router;
