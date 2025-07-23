import { Router } from 'express';
import ProductService from '../../services/productService.js';
import { ERROR_MESSAGES } from '../../constants/errorMessages.js';

const router = Router();

router.get('/api/products', async (req, res) => {
    try {
        const result = await ProductService.getProducts();
        if (result.success) {
            res.json({ success: true, products: result.products });
        } else {
            res.status(400).json({ success: false, error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
