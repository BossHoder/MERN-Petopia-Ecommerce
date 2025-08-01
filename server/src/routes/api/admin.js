import { Router } from 'express';
import requireJwtAuth from '../../middleware/requireJwtAuth.js';
import requireAdmin from '../../middleware/requireAdmin.js';
import adminController from '../../controllers/adminController.js';
import upload from '../../utils/uploadConfig.js';

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
router.put('/orders/:id/payment', adminController.updatePaymentStatus);
router.get('/orders/:id', adminController.getOrderDetails);

// Users Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/users/:id', adminController.getUserDetails);
router.post('/users/bulk-update', adminController.bulkUpdateUsers);
router.delete('/users/:id', adminController.deleteUser);

// Products Management (Enhanced)
router.get('/products', adminController.getAllProductsAdmin);
router.get('/products/check-slug/:slug', adminController.checkProductSlugExists);
router.get('/products/:id', adminController.getProductById);
router.post('/products', upload.any(), adminController.createProduct);
router.put('/products/:id', upload.any(), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.post('/products/bulk-delete', adminController.bulkDeleteProducts);
router.post('/products/bulk-update', adminController.bulkUpdateProducts);
router.put('/products/:id/featured', adminController.toggleProductFeatured);
router.put('/products/:id/publish', adminController.toggleProductPublish);

// Parent Categories Management
router.get('/parent-categories', adminController.getAllParentCategoriesAdmin);
router.get('/parent-categories/check-slug/:slug', adminController.checkParentCategorySlugExists);
router.get('/parent-categories/:id', adminController.getParentCategoryById);
router.post('/parent-categories', adminController.createParentCategory);
router.put('/parent-categories/:id', adminController.updateParentCategory);
router.delete('/parent-categories/:id', adminController.deleteParentCategory);
router.post('/parent-categories/bulk-delete', adminController.bulkDeleteParentCategories);

// Categories Management
router.get('/categories', adminController.getAllCategoriesAdmin);
router.get('/categories/check-slug/:slug', adminController.checkCategorySlugExists);
router.get('/categories/:id', adminController.getCategoryById);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);
router.post('/categories/bulk-delete', adminController.bulkDeleteCategories);

// Coupons Management
router.get('/coupons', adminController.getAllCouponsAdmin);
router.get('/coupons/:id', adminController.getCouponById);
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);
router.post('/coupons/bulk-delete', adminController.bulkDeleteCoupons);
router.put('/coupons/:id/status', adminController.toggleCouponStatus);

// System Settings
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);

export default router;
