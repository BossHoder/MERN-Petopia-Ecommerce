import express from 'express';
import requireJwtAuth from '../../middleware/requireJwtAuth.js';
import requireAdmin from '../../middleware/requireAdmin.js';
import { getStockSummary } from '../../middleware/stockMiddleware.js';
import stockService from '../../services/stockService.js';
import { successResponse, errorResponse } from '../../helpers/responseHelper.js';

const router = express.Router();

/**
 * @desc    Get stock summary for admin dashboard
 * @route   GET /api/stock/summary
 * @access  Private/Admin
 */
router.get('/summary', requireJwtAuth, requireAdmin, getStockSummary);

/**
 * @desc    Get detailed stock information for a specific product
 * @route   GET /api/stock/product/:id
 * @access  Private/Admin
 */
router.get('/product/:id', requireJwtAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { variantId } = req.query;

        const result = await stockService.getStockInfo(id, variantId);

        if (!result.success) {
            return errorResponse(res, result.error, 404);
        }

        return successResponse(res, result.data, 'Stock information retrieved successfully');
    } catch (error) {
        console.error('Get stock info error:', error);
        return errorResponse(res, 'Failed to retrieve stock information', 500);
    }
});

/**
 * @desc    Get low stock products
 * @route   GET /api/stock/low-stock
 * @access  Private/Admin
 */
router.get('/low-stock', requireJwtAuth, requireAdmin, async (req, res) => {
    try {
        const { threshold } = req.query;

        const result = await stockService.getLowStockProducts(threshold ? parseInt(threshold) : null);

        if (!result.success) {
            return errorResponse(res, result.error, 500);
        }

        return successResponse(res, result.data, 'Low stock products retrieved successfully');
    } catch (error) {
        console.error('Get low stock products error:', error);
        return errorResponse(res, 'Failed to retrieve low stock products', 500);
    }
});

/**
 * @desc    Manually adjust stock for a product
 * @route   PUT /api/stock/adjust
 * @access  Private/Admin
 */
router.put('/adjust', requireJwtAuth, requireAdmin, async (req, res) => {
    try {
        const { productId, variantId, quantity, operation, reason } = req.body;

        if (!productId || !quantity || !operation) {
            return errorResponse(res, 'Product ID, quantity, and operation are required', 400);
        }

        if (!['add', 'subtract'].includes(operation)) {
            return errorResponse(res, 'Operation must be either "add" or "subtract"', 400);
        }

        const stockOperation = operation === 'add' ? 'restoreStock' : 'reserveStock';
        const items = [
            {
                product: productId,
                productId: productId,
                variantId: variantId || null,
                quantity: Math.abs(quantity),
            },
        ];

        const result = await stockService[stockOperation](items);

        if (!result.success) {
            return errorResponse(res, result.error, 400);
        }

        // Log the manual adjustment
        console.log(`📦 Manual stock adjustment by admin ${req.user._id}:`, {
            productId,
            variantId: variantId || 'main',
            quantity,
            operation,
            reason: reason || 'Manual adjustment',
            timestamp: new Date(),
        });

        return successResponse(res, null, `Stock ${operation}ed successfully`);
    } catch (error) {
        console.error('Manual stock adjustment error:', error);
        return errorResponse(res, 'Failed to adjust stock', 500);
    }
});

/**
 * @desc    Validate stock for multiple products (bulk check)
 * @route   POST /api/stock/validate
 * @access  Private/Admin
 */
router.post('/validate', requireJwtAuth, requireAdmin, async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return errorResponse(res, 'Items array is required', 400);
        }

        const result = await stockService.validateStockAvailability(items);

        return successResponse(
            res,
            {
                isValid: result.success,
                errors: result.errors || [],
                stockInfo: result.stockInfo || [],
            },
            'Stock validation completed',
        );
    } catch (error) {
        console.error('Bulk stock validation error:', error);
        return errorResponse(res, 'Failed to validate stock', 500);
    }
});

export default router;
