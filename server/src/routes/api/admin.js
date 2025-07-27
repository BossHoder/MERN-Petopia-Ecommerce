import { Router } from 'express';
import requireJwtAuth from '../../middleware/requireJwtAuth.js';
import requireAdmin from '../../middleware/requireAdmin.js';
import adminController from '../../controllers/adminController.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(requireJwtAuth);
router.use(requireAdmin);

// ===========================================
// DASHBOARD ROUTES
// ===========================================
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/recent-orders', adminController.getRecentOrders);
router.get('/dashboard/recent-users', adminController.getRecentUsers);

// ===========================================
// ANALYTICS ROUTES
// ===========================================
router.get('/analytics/sales', adminController.getSalesAnalytics);
router.get('/analytics/products', adminController.getProductAnalytics);
router.get('/analytics/users', adminController.getUserAnalytics);
router.get('/analytics/orders', adminController.getOrderAnalytics);

// ===========================================
// ENHANCED MANAGEMENT ROUTES
// ===========================================

// Orders Management
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.get('/orders/:id', adminController.getOrderDetails);

// Users Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/users/:id', adminController.getUserDetails);

// Products Management (Enhanced)
router.get('/products', adminController.getAllProductsAdmin);
router.post('/products/bulk-update', adminController.bulkUpdateProducts);
router.put('/products/:id/featured', adminController.toggleProductFeatured);
router.put('/products/:id/publish', adminController.toggleProductPublish);

// Categories Management
router.get('/categories', adminController.getAllCategoriesAdmin);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// System Settings
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);

export default router;
