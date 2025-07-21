import { Router } from 'express';
import CategoryController from '../../controllers/categoryController.js';
import requireJwtAuth from '../../middleware/requireJwtAuth.js';
import requireAdmin from '../../middleware/requireAdmin.js';

const router = Router();

// Public routes
router.get('/featured', CategoryController.getFeaturedCategories);
router.get('/parent-categories', CategoryController.getParentCategories);
router.get('/', CategoryController.getAllCategories);

// Admin routes (if needed in future)
// router.post('/', protect, authorize('admin'), CategoryController.createCategory);
// router.put('/:id', protect, authorize('admin'), CategoryController.updateCategory);
// router.delete('/:id', protect, authorize('admin'), CategoryController.deleteCategory);

export default router;
