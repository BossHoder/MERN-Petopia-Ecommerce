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

router.use(requireJwtAuth);

router.route('/').post(createOrder);

router.route('/myorders').get(getMyOrders);

router.route('/:id').get(getOrderById);

router.route('/:id/pay').put(updateOrderToPaid);

router.route('/:id/deliver').put(requireAdmin, updateOrderToDelivered);

export default router;
