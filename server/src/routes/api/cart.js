import { Router } from 'express';
import {
    getCart,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    clearCart,
    migrateGuestCart,
} from '../../controllers/cartController.js';
import requireJwtAuth from '../../middleware/requireJwtAuth.js';

const router = Router();

// All routes in this file are protected
router.use(requireJwtAuth);

router.route('/').get(getCart).post(addItemToCart).delete(clearCart);
router.route('/migrate').post(migrateGuestCart);

router.route('/items/:productId').put(updateItemQuantity).delete(removeItemFromCart);

export default router;
