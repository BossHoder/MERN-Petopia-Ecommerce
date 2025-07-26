import { Router } from 'express';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
} from '../../controllers/orderController.js';
import requireJwtAuth from '../../middleware/requireJwtAuth.js';
import requireAdmin from '../../middleware/requireAdmin.js';

const router = Router();

// Create order route - allow both authenticated and guest users
router.route('/').post(createOrder);

// Protected routes - require authentication
router.use(requireJwtAuth);

router.route('/myorders').get(getMyOrders);

router.route('/:id').get(getOrderById);

router.route('/:id/pay').put(updateOrderToPaid);

router.route('/:id/deliver').put(requireAdmin, updateOrderToDelivered);

export default router;
