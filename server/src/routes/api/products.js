import { Router } from 'express';
import ProductController from '../../controllers/productController.js';
import requireJwtAuth from '../../middleware/requireJwtAuth.js';
import requireAdmin from '../../middleware/requireAdmin.js';

const router = Router();

// ===========================================
// PUBLIC ROUTES
// ===========================================
router.get('/', ProductController.getAllProducts);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/category/:categorySlug', ProductController.getProductsByCategory);
router.get('/:id', ProductController.getProductById);
router.post('/:id/reviews', requireJwtAuth, ProductController.createProductReview);

// ===========================================
// ADMIN ROUTES
// ===========================================
router.post('/', requireJwtAuth, requireAdmin, ProductController.createProduct);
router.put('/:id', requireJwtAuth, requireAdmin, ProductController.updateProduct);
router.delete('/:id', requireJwtAuth, requireAdmin, ProductController.deleteProduct);

export default router;
