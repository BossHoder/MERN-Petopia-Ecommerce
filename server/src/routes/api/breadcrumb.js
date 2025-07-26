import { Router } from 'express';
import BreadcrumbController from '../../controllers/breadcrumbController.js';

const router = Router();

// ===========================================
// PUBLIC BREADCRUMB ROUTES
// ===========================================

/**
 * @route   GET /api/breadcrumb/product/:id
 * @desc    Get breadcrumb data for a specific product
 * @access  Public
 */
router.get('/product/:id', BreadcrumbController.getProductBreadcrumb);

/**
 * @route   GET /api/breadcrumb/category/:slug
 * @desc    Get breadcrumb data for a specific category
 * @query   parent - Optional parent category slug for subcategories
 * @access  Public
 */
router.get('/category/:slug', BreadcrumbController.getCategoryBreadcrumb);

/**
 * @route   GET /api/breadcrumb/products/category/:slug
 * @desc    Get breadcrumb data for products filtered by category
 * @access  Public
 */
router.get('/products/category/:slug', BreadcrumbController.getProductsCategoryBreadcrumb);

/**
 * @route   POST /api/breadcrumb/custom
 * @desc    Generate custom breadcrumb for any path
 * @access  Public
 */
router.post('/custom', BreadcrumbController.generateCustomBreadcrumb);

export default router;
