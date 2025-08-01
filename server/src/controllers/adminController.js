import asyncHandler from '../middleware/asyncHandler.js';
import { successResponse, errorResponse } from '../helpers/responseHelper.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import ParentCategory from '../models/parentCategory.js';
import Coupon from '../models/Coupon.js';
import stockService from '../services/stockService.js';
import couponService from '../services/couponService.js';
import { logOrderStatusChange, logPaymentStatusChange, extractRequestMetadata } from '../utils/auditLogger.js';
import { userDto, usersDto } from '../dto/userDto.js';
import { validateCreateCoupon, validateUpdateCoupon, couponQuerySchema } from '../validations/couponValidation.js';

// ===========================================
// DASHBOARD CONTROLLERS
// ===========================================

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard/stats
 * @access  Private/Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    try {
        // Get current date and date 30 days ago for comparison
        const currentDate = new Date();
        const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Parallel queries for better performance
        const [totalUsers, totalProducts, totalOrders, totalRevenue, recentUsers, recentOrders, recentRevenue] =
            await Promise.all([
                User.countDocuments(),
                Product.countDocuments(),
                Order.countDocuments(),
                Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
                User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
                Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
                Order.aggregate([
                    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
                ]),
            ]);

        // Calculate growth percentages
        const calculateGrowth = (current, recent) => {
            const previous = current - recent;
            if (previous === 0) return recent > 0 ? 100 : 0;
            return ((recent / previous) * 100).toFixed(1);
        };

        const stats = {
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            growth: {
                users: calculateGrowth(totalUsers, recentUsers),
                orders: calculateGrowth(totalOrders, recentOrders),
                revenue: calculateGrowth(totalRevenue[0]?.total || 0, recentRevenue[0]?.total || 0),
            },
        };

        return successResponse(res, stats, 'Dashboard stats retrieved successfully');
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return errorResponse(res, 'Failed to retrieve dashboard stats', 500);
    }
});

/**
 * @desc    Get recent orders for dashboard
 * @route   GET /api/admin/dashboard/recent-orders
 * @access  Private/Admin
 */
const getRecentOrders = asyncHandler(async (req, res) => {
    try {
        const recentOrders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5)
            .select('orderNumber totalPrice orderStatus createdAt user guestInfo');

        return successResponse(res, recentOrders, 'Recent orders retrieved successfully');
    } catch (error) {
        console.error('Recent orders error:', error);
        return errorResponse(res, 'Failed to retrieve recent orders', 500);
    }
});

/**
 * @desc    Get all orders for admin management
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const search = req.query.search;
        const dateFrom = req.query.dateFrom;
        const dateTo = req.query.dateTo;
        const dateRange = req.query.dateRange; // today, yesterday, thisWeek, thisMonth, lastMonth, custom

        // Build query
        let query = {};

        // Status filter
        if (status && status !== 'all') {
            query.orderStatus = status;
        }

        // Search filter
        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'guestInfo.email': { $regex: search, $options: 'i' } },
            ];
        }

        // Date filter
        if (dateRange || dateFrom || dateTo) {
            const now = new Date();
            let startDate, endDate;

            if (dateRange) {
                switch (dateRange) {
                    case 'today':
                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                        break;
                    case 'yesterday':
                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        break;
                    case 'thisWeek':
                        const startOfWeek = now.getDate() - now.getDay();
                        startDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek);
                        endDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek + 7);
                        break;
                    case 'thisMonth':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                        break;
                    case 'lastMonth':
                        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                        endDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    case 'last7Days':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        endDate = now;
                        break;
                    case 'last30Days':
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        endDate = now;
                        break;
                }
            } else {
                // Custom date range
                if (dateFrom) {
                    startDate = new Date(dateFrom);
                }
                if (dateTo) {
                    endDate = new Date(dateTo);
                    endDate.setHours(23, 59, 59, 999); // Include the entire end date
                }
            }

            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = startDate;
                if (endDate) query.createdAt.$lte = endDate;
            }
        }

        const skip = (page - 1) * limit;

        const [orders, totalOrders] = await Promise.all([
            Order.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
            Order.countDocuments(query),
        ]);

        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders,
            hasNext: page < Math.ceil(totalOrders / limit),
            hasPrev: page > 1,
        };

        return successResponse(res, { orders, pagination }, 'Orders retrieved successfully');
    } catch (error) {
        console.error('Get all orders error:', error);
        return errorResponse(res, 'Failed to retrieve orders', 500);
    }
});

/**
 * @desc    Update order status
 * @route   PUT /api/admin/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        const validStatuses = ['pending', 'processing', 'delivering', 'delivered', 'cancelled', 'refunded'];
        if (!validStatuses.includes(status)) {
            return errorResponse(res, 'Invalid order status', 400);
        }

        // Get the current order to track the old status
        const currentOrder = await Order.findById(orderId);
        if (!currentOrder) {
            return errorResponse(res, 'Order not found', 404);
        }

        const oldStatus = currentOrder.orderStatus;

        // Check if stock restoration is needed
        const stockRestorationStatuses = ['cancelled', 'refunded'];
        const needsStockRestoration =
            stockRestorationStatuses.includes(status) && !stockRestorationStatuses.includes(oldStatus);

        // Validate payment requirements for delivering/delivered status
        if (
            (status === 'delivering' || status === 'delivered') &&
            currentOrder.paymentMethod !== 'COD' &&
            !currentOrder.isPaid
        ) {
            const statusAction = status === 'delivering' ? 'start delivery' : 'mark as delivered';
            const statusName = status === 'delivering' ? 'delivering' : 'delivered';
            return errorResponse(
                res,
                `Order must be paid before you can ${statusAction}. Only COD orders can be marked as ${statusName} without payment.`,
                400,
            );
        }

        // Update the order
        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                orderStatus: status,
                ...(status === 'delivered' && {
                    deliveredAt: new Date(),
                    isDelivered: true,
                }),
            },
            { new: true },
        ).populate('user', 'name email');

        // Restore stock if order is cancelled or refunded
        if (needsStockRestoration) {
            console.log(`🔄 Restoring stock for order ${order.orderNumber} (status: ${oldStatus} → ${status})`);

            // Prepare order items for stock restoration
            const itemsForRestoration = order.orderItems.map((item) => ({
                product: item.product,
                productId: item.product,
                variantId: item.variantId || null,
                quantity: item.quantity,
            }));

            try {
                const restoreResult = await stockService.restoreStock(itemsForRestoration);

                if (restoreResult.success) {
                    console.log(`✅ Stock restored successfully for order ${order.orderNumber}`);
                } else {
                    console.error(`❌ Failed to restore stock for order ${order.orderNumber}:`, restoreResult.error);
                    // Log this as a warning but don't fail the status update
                }
            } catch (restoreError) {
                console.error(`❌ Critical error restoring stock for order ${order.orderNumber}:`, restoreError);
                // Log this as a critical error but don't fail the status update
            }
        }

        // Log the status change for audit trail
        const requestMetadata = extractRequestMetadata(req);
        await logOrderStatusChange({
            orderId: order._id,
            orderNumber: order.orderNumber,
            oldStatus,
            newStatus: orderStatus,
            changedBy: req.user._id,
            ipAddress: requestMetadata.ipAddress,
            userAgent: requestMetadata.userAgent,
            notes: `Status changed from ${oldStatus} to ${orderStatus} by admin`,
        });

        return successResponse(res, order, 'Order status updated successfully');
    } catch (error) {
        console.error('Update order status error:', error);
        return errorResponse(res, 'Failed to update order status', 500);
    }
});

/**
 * @desc    Update payment status
 * @route   PUT /api/admin/orders/:id/payment
 * @access  Private/Admin
 */
const updatePaymentStatus = asyncHandler(async (req, res) => {
    try {
        const { isPaid } = req.body;
        const orderId = req.params.id;

        if (typeof isPaid !== 'boolean') {
            return errorResponse(res, 'Invalid payment status', 400);
        }

        // Get the current order to track the old payment status
        const currentOrder = await Order.findById(orderId);
        if (!currentOrder) {
            return errorResponse(res, 'Order not found', 404);
        }

        // Prevent payment status updates for cancelled or refunded orders
        if (currentOrder.orderStatus === 'cancelled' || currentOrder.orderStatus === 'refunded') {
            return errorResponse(res, 'Payment status cannot be changed for cancelled or refunded orders', 400);
        }

        const oldPaymentStatus = currentOrder.isPaid;

        // Update the order
        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                isPaid: isPaid,
                ...(isPaid && { paidAt: new Date() }),
            },
            { new: true },
        ).populate('user', 'name email');

        // Log the payment status change for audit trail
        const requestMetadata = extractRequestMetadata(req);
        await logPaymentStatusChange({
            orderId: order._id,
            orderNumber: order.orderNumber,
            oldPaymentStatus,
            newPaymentStatus: isPaid,
            changedBy: req.user._id,
            ipAddress: requestMetadata.ipAddress,
            userAgent: requestMetadata.userAgent,
            notes: `Payment status changed from ${oldPaymentStatus ? 'Paid' : 'Unpaid'} to ${
                isPaid ? 'Paid' : 'Unpaid'
            } by admin`,
        });

        return successResponse(res, order, 'Payment status updated successfully');
    } catch (error) {
        console.error('Update payment status error:', error);
        return errorResponse(res, 'Failed to update payment status', 500);
    }
});

/**
 * @desc    Get recent users for dashboard
 * @route   GET /api/admin/dashboard/recent-users
 * @access  Private/Admin
 */
const getRecentUsers = asyncHandler(async (req, res) => {
    try {
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email role createdAt avatar');

        return successResponse(res, recentUsers, 'Recent users retrieved successfully');
    } catch (error) {
        console.error('Recent users error:', error);
        return errorResponse(res, 'Failed to retrieve recent users', 500);
    }
});

/**
 * @desc    Get sales analytics
 * @route   GET /api/admin/analytics/sales
 * @access  Private/Admin
 */
const getSalesAnalytics = asyncHandler(async (req, res) => {
    try {
        // Mock analytics data - implement actual analytics logic
        const analyticsData = {
            monthlySales: [],
            topProducts: [],
            salesByCategory: [],
        };

        return successResponse(res, analyticsData, 'Sales analytics retrieved successfully');
    } catch (error) {
        console.error('Sales analytics error:', error);
        return errorResponse(res, 'Failed to retrieve sales analytics', 500);
    }
});

/**
 * @desc    Get all users for admin management
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const role = req.query.role;
        const status = req.query.status;

        let query = {};

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
            ];
        }

        // Role filter
        if (role) {
            query.role = role;
        }

        // Status filter
        if (status) {
            query.isActive = status === 'true';
        }

        const skip = (page - 1) * limit;

        const [users, totalUsers] = await Promise.all([
            User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments(query),
        ]);

        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers,
            hasNext: page < Math.ceil(totalUsers / limit),
            hasPrev: page > 1,
        };

        // Use DTO to format user data consistently
        const formattedUsers = usersDto(users);

        return successResponse(res, { users: formattedUsers, pagination }, 'Users retrieved successfully');
    } catch (error) {
        console.error('Get all users error:', error);
        return errorResponse(res, 'Failed to retrieve users', 500);
    }
});

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = asyncHandler(async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.params.id;

        // Validate role
        const validRoles = ['USER', 'ADMIN', 'STAFF'];
        if (!validRoles.includes(role)) {
            return errorResponse(res, 'Invalid user role', 400);
        }

        // Find and update user
        const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        // Use DTO to format user data consistently
        const formattedUser = userDto(user);

        return successResponse(res, formattedUser, 'User role updated successfully');
    } catch (error) {
        console.error('Update user role error:', error);
        return errorResponse(res, 'Failed to update user role', 500);
    }
});

/**
 * @desc    Update user status
 * @route   PUT /api/admin/users/:id/status
 * @access  Private/Admin
 */
const updateUserStatus = asyncHandler(async (req, res) => {
    try {
        const { isActive } = req.body;
        const userId = req.params.id;

        // Find and update user
        const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true }).select('-password');

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        // Use DTO to format user data consistently
        const formattedUser = userDto(user);

        return successResponse(res, formattedUser, 'User status updated successfully');
    } catch (error) {
        console.error('Update user status error:', error);
        return errorResponse(res, 'Failed to update user status', 500);
    }
});

/**
 * @desc    Get user details
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
const getUserDetails = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.id;

        // Validate ObjectId
        if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
            return errorResponse(res, 'Invalid user ID', 400);
        }

        const user = await User.findById(userId).select('-password').populate('wishlist', 'name slug images price');

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        // Get user's order statistics
        const orderStats = await Order.aggregate([
            { $match: { user: user._id } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$totalPrice' },
                    avgOrderValue: { $avg: '$totalPrice' },
                },
            },
        ]);

        // Use DTO to format user data consistently
        const formattedUser = userDto(user);

        const userDetails = {
            ...formattedUser,
            orderStats: orderStats[0] || {
                totalOrders: 0,
                totalSpent: 0,
                avgOrderValue: 0,
            },
        };

        return successResponse(res, userDetails, 'User details retrieved successfully');
    } catch (error) {
        console.error('Get user details error:', error);
        return errorResponse(res, 'Failed to retrieve user details', 500);
    }
});

/**
 * @desc    Bulk update users
 * @route   POST /api/admin/users/bulk-update
 * @access  Private/Admin
 */
const bulkUpdateUsers = asyncHandler(async (req, res) => {
    try {
        const { userIds, updates } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return errorResponse(res, 'User IDs are required', 400);
        }

        if (!updates || typeof updates !== 'object') {
            return errorResponse(res, 'Updates are required', 400);
        }

        // Validate updates
        const allowedUpdates = ['role', 'isActive'];
        const updateKeys = Object.keys(updates);
        const isValidUpdate = updateKeys.every((key) => allowedUpdates.includes(key));

        if (!isValidUpdate) {
            return errorResponse(res, 'Invalid update fields', 400);
        }

        // Validate role if provided
        if (updates.role && !['USER', 'ADMIN', 'STAFF'].includes(updates.role)) {
            return errorResponse(res, 'Invalid user role', 400);
        }

        // Perform bulk update
        const result = await User.updateMany({ _id: { $in: userIds } }, { $set: updates });

        return successResponse(
            res,
            {
                modifiedCount: result.modifiedCount,
                matchedCount: result.matchedCount,
            },
            'Users updated successfully',
        );
    } catch (error) {
        console.error('Bulk update users error:', error);
        return errorResponse(res, 'Failed to update users', 500);
    }
});

/**
 * @desc    Delete user (soft delete by deactivating)
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.id;

        // Prevent admin from deleting themselves
        if (userId === req.user._id.toString()) {
            return errorResponse(res, 'Cannot delete your own account', 400);
        }

        // Soft delete by deactivating the user
        const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true }).select('-password');

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        return successResponse(res, user, 'User deactivated successfully');
    } catch (error) {
        console.error('Delete user error:', error);
        return errorResponse(res, 'Failed to delete user', 500);
    }
});

// Export all controller functions
export default {
    getDashboardStats,
    getRecentOrders,
    getRecentUsers,
    getAllOrders,
    updateOrderStatus,
    updatePaymentStatus,
    getOrderDetails: asyncHandler(async (req, res) => {
        try {
            const orderId = req.params.id;
            const order = await Order.findById(orderId)
                .populate('user', 'name email')
                .populate('orderItems.product', 'name');

            if (!order) {
                return errorResponse(res, 'Order not found', 404);
            }

            return successResponse(res, order, 'Order details retrieved successfully');
        } catch (error) {
            console.error('Get order details error:', error);
            return errorResponse(res, 'Failed to retrieve order details', 500);
        }
    }),
    getSalesAnalytics,
    getAllUsers,
    updateUserRole,
    updateUserStatus,
    getUserDetails,
    bulkUpdateUsers,
    deleteUser,
    // Placeholder functions for future implementation
    getProductAnalytics: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'Product analytics retrieved successfully');
    }),
    getUserAnalytics: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'User analytics retrieved successfully');
    }),
    getOrderAnalytics: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'Order analytics retrieved successfully');
    }),
    // ===========================================
    // PRODUCTS MANAGEMENT
    // ===========================================
    getAllProductsAdmin: asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';

        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [products, totalProducts] = await Promise.all([
            Product.find(query).populate('category', 'name').sort(sortOptions).skip(skip).limit(limit),
            Product.countDocuments(query),
        ]);

        // Map stockQuantity to stock for frontend compatibility
        const mappedProducts = products.map((product) => ({
            ...product.toObject(),
            stock: product.stockQuantity,
        }));

        const totalPages = Math.ceil(totalProducts / limit);

        return successResponse(
            res,
            {
                products: mappedProducts,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalProducts,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            },
            'Products retrieved successfully',
        );
    }),

    getProductById: asyncHandler(async (req, res) => {
        const product = await Product.findById(req.params.id).populate('category', 'name');

        if (!product) {
            return errorResponse(res, 'Product not found', 404);
        }

        // Map stockQuantity to stock for frontend compatibility
        const mappedProduct = {
            ...product.toObject(),
            stock: product.stockQuantity,
        };

        return successResponse(res, { product: mappedProduct }, 'Product retrieved successfully');
    }),

    createProduct: asyncHandler(async (req, res) => {
        // Parse JSON fields
        if (req.body.attributes && typeof req.body.attributes === 'string') {
            req.body.attributes = JSON.parse(req.body.attributes);
        }
        if (req.body.variants && typeof req.body.variants === 'string') {
            req.body.variants = JSON.parse(req.body.variants);
        }

        // Generate slug if not provided
        if (!req.body.slug && req.body.name) {
            req.body.slug = req.body.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
        }

        // Handle images
        let images = [];

        // Add existing images if provided
        if (req.body.existingImages && typeof req.body.existingImages === 'string') {
            const existingImages = JSON.parse(req.body.existingImages);
            images = [...existingImages];
        }

        // Add new uploaded images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map((file) => `/public/images/${file.filename}`);
            images = [...images, ...newImages];
        }

        req.body.images = images;

        // Handle variant images and transform variant data
        if (req.body.variants) {
            let variants;
            if (typeof req.body.variants === 'string') {
                variants = JSON.parse(req.body.variants);
            } else {
                variants = req.body.variants;
            }

            // Process variant images and transform data structure
            const processedVariants = variants.map((variant, index) => {
                const variantImages = [...(variant.images || [])];

                // Check for new variant images
                const variantImageField = `variantImages_${index}`;
                if (req.files) {
                    const variantFiles = req.files.filter((file) => file.fieldname === variantImageField);
                    if (variantFiles.length > 0) {
                        const newVariantImages = variantFiles.map((file) => `/public/images/${file.filename}`);
                        variantImages.push(...newVariantImages);
                    }
                }

                // Transform variant data to match schema
                return {
                    name: variant.name,
                    value: variant.name, // Use name as value for now
                    price: parseFloat(variant.price) || 0,
                    stockQuantity: parseInt(variant.stock) || 0, // Transform 'stock' to 'stockQuantity'
                    sku: variant.sku,
                    images: variantImages,
                    attributes: variant.attributes || {},
                    isActive: variant.isActive !== false, // Default to true
                };
            });

            req.body.variants = processedVariants;
        }

        const product = new Product(req.body);
        await product.save();
        await product.populate('category', 'name');
        return successResponse(res, { product }, 'Product created successfully');
    }),

    updateProduct: asyncHandler(async (req, res) => {
        try {
            console.log('🔧 updateProduct called with:', {
                productId: req.params.id,
                bodyKeys: Object.keys(req.body),
                hasFiles: !!req.files,
                filesCount: req.files ? req.files.length : 0,
                fileDetails: req.files ? req.files.map((f) => ({ fieldname: f.fieldname, filename: f.filename })) : [],
            });

            // Parse JSON fields
            if (req.body.attributes && typeof req.body.attributes === 'string') {
                try {
                    req.body.attributes = JSON.parse(req.body.attributes);
                    console.log('✅ Parsed attributes:', req.body.attributes);
                } catch (error) {
                    console.error('❌ Error parsing attributes:', error);
                    return errorResponse(res, 'Invalid attributes format', 400);
                }
            }
            if (req.body.variants && typeof req.body.variants === 'string') {
                try {
                    req.body.variants = JSON.parse(req.body.variants);
                    console.log('✅ Parsed variants:', req.body.variants);
                } catch (error) {
                    console.error('❌ Error parsing variants:', error);
                    return errorResponse(res, 'Invalid variants format', 400);
                }
            }

            // Generate slug if not provided but name is changed
            if (!req.body.slug && req.body.name) {
                req.body.slug = req.body.name
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim();
            }

            // Handle images
            let images = [];

            // Add existing images if provided
            if (req.body.existingImages && typeof req.body.existingImages === 'string') {
                const existingImages = JSON.parse(req.body.existingImages);
                images = [...existingImages];
            }

            // Add new uploaded images
            if (req.files && req.files.length > 0) {
                const newImages = req.files.map((file) => `/public/images/${file.filename}`);
                images = [...images, ...newImages];
            }

            // Only update images if we have new data
            if (images.length > 0 || req.body.existingImages) {
                req.body.images = images;
            }

            // Handle variant images and transform variant data
            if (req.body.variants) {
                let variants;
                if (typeof req.body.variants === 'string') {
                    variants = JSON.parse(req.body.variants);
                } else {
                    variants = req.body.variants;
                }

                // Process variant images and transform data structure
                const processedVariants = variants.map((variant, index) => {
                    const variantImages = [...(variant.images || [])];

                    // Check for new variant images
                    const variantImageField = `variantImages_${index}`;
                    if (req.files) {
                        const variantFiles = req.files.filter((file) => file.fieldname === variantImageField);
                        if (variantFiles.length > 0) {
                            const newVariantImages = variantFiles.map((file) => `/public/images/${file.filename}`);
                            variantImages.push(...newVariantImages);
                        }
                    }

                    // Transform variant data to match schema
                    return {
                        name: variant.name,
                        value: variant.name, // Use name as value for now
                        price: parseFloat(variant.price) || 0,
                        stockQuantity: parseInt(variant.stock) || 0, // Transform 'stock' to 'stockQuantity'
                        sku: variant.sku,
                        images: variantImages,
                        attributes: variant.attributes || {},
                        isActive: variant.isActive !== false, // Default to true
                    };
                });

                req.body.variants = processedVariants;
                console.log('✅ Processed variants:', processedVariants);
            }

            console.log('🔄 Updating product with data:', {
                productId: req.params.id,
                updateFields: Object.keys(req.body),
                variantsCount: req.body.variants ? req.body.variants.length : 0,
            });

            const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            }).populate('category', 'name');

            if (!product) {
                console.log('❌ Product not found:', req.params.id);
                return errorResponse(res, 'Product not found', 404);
            }

            console.log('✅ Product updated successfully:', product._id);
            return successResponse(res, { product }, 'Product updated successfully');
        } catch (error) {
            console.error('❌ Error in updateProduct:', {
                error: error.message,
                stack: error.stack,
                productId: req.params.id,
                body: req.body,
            });
            return errorResponse(res, `Failed to update product: ${error.message}`, 500);
        }
    }),

    deleteProduct: asyncHandler(async (req, res) => {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return errorResponse(res, 'Product not found', 404);
        }

        await Product.findByIdAndDelete(req.params.id);
        return successResponse(res, {}, 'Product deleted successfully');
    }),

    bulkDeleteProducts: asyncHandler(async (req, res) => {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return errorResponse(res, 'Invalid product IDs', 400);
        }

        const result = await Product.deleteMany({ _id: { $in: ids } });
        return successResponse(res, { deletedCount: result.deletedCount }, 'Products deleted successfully');
    }),

    bulkUpdateProducts: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'Products updated successfully');
    }),
    toggleProductFeatured: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'Product featured status updated successfully');
    }),
    toggleProductPublish: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'Product publish status updated successfully');
    }),
    // ===========================================
    // PARENT CATEGORIES MANAGEMENT
    // ===========================================
    getAllParentCategoriesAdmin: asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';

        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [parentCategories, totalParentCategories] = await Promise.all([
            ParentCategory.find(query).sort(sortOptions).skip(skip).limit(limit),
            ParentCategory.countDocuments(query),
        ]);

        const totalPages = Math.ceil(totalParentCategories / limit);

        return successResponse(
            res,
            {
                parentCategories,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalParentCategories,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            },
            'Parent categories retrieved successfully',
        );
    }),

    getParentCategoryById: asyncHandler(async (req, res) => {
        const parentCategory = await ParentCategory.findById(req.params.id);

        if (!parentCategory) {
            return errorResponse(res, 'Parent category not found', 404);
        }

        return successResponse(res, { parentCategory }, 'Parent category retrieved successfully');
    }),

    createParentCategory: asyncHandler(async (req, res) => {
        const parentCategory = new ParentCategory(req.body);
        await parentCategory.save();
        return successResponse(res, { parentCategory }, 'Parent category created successfully');
    }),

    updateParentCategory: asyncHandler(async (req, res) => {
        const parentCategory = await ParentCategory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!parentCategory) {
            return errorResponse(res, 'Parent category not found', 404);
        }

        return successResponse(res, { parentCategory }, 'Parent category updated successfully');
    }),

    deleteParentCategory: asyncHandler(async (req, res) => {
        const parentCategory = await ParentCategory.findById(req.params.id);

        if (!parentCategory) {
            return errorResponse(res, 'Parent category not found', 404);
        }

        // Check if there are categories under this parent category
        const categoriesCount = await Category.countDocuments({ parentCategory: req.params.id });
        if (categoriesCount > 0) {
            return errorResponse(res, 'Cannot delete parent category with existing categories', 400);
        }

        await ParentCategory.findByIdAndDelete(req.params.id);
        return successResponse(res, {}, 'Parent category deleted successfully');
    }),

    bulkDeleteParentCategories: asyncHandler(async (req, res) => {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return errorResponse(res, 'Invalid parent category IDs', 400);
        }

        // Check if any parent categories have categories
        const categoriesCount = await Category.countDocuments({ parentCategory: { $in: ids } });
        if (categoriesCount > 0) {
            return errorResponse(res, 'Cannot delete parent categories with existing categories', 400);
        }

        const result = await ParentCategory.deleteMany({ _id: { $in: ids } });
        return successResponse(res, { deletedCount: result.deletedCount }, 'Parent categories deleted successfully');
    }),

    // ===========================================
    // CATEGORIES MANAGEMENT
    // ===========================================
    getAllCategoriesAdmin: asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';

        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [categories, totalCategories] = await Promise.all([
            Category.find(query).populate('parentCategory', 'name').sort(sortOptions).skip(skip).limit(limit),
            Category.countDocuments(query),
        ]);

        const totalPages = Math.ceil(totalCategories / limit);

        return successResponse(
            res,
            {
                categories,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCategories,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            },
            'Categories retrieved successfully',
        );
    }),

    getCategoryById: asyncHandler(async (req, res) => {
        const category = await Category.findById(req.params.id).populate('parentCategory', 'name');

        if (!category) {
            return errorResponse(res, 'Category not found', 404);
        }

        return successResponse(res, { category }, 'Category retrieved successfully');
    }),

    createCategory: asyncHandler(async (req, res) => {
        const category = new Category(req.body);
        await category.save();
        await category.populate('parentCategory', 'name');
        return successResponse(res, { category }, 'Category created successfully');
    }),

    updateCategory: asyncHandler(async (req, res) => {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('parentCategory', 'name');

        if (!category) {
            return errorResponse(res, 'Category not found', 404);
        }

        return successResponse(res, { category }, 'Category updated successfully');
    }),

    deleteCategory: asyncHandler(async (req, res) => {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return errorResponse(res, 'Category not found', 404);
        }

        // Check if there are products in this category
        const productsCount = await Product.countDocuments({ category: req.params.id });
        if (productsCount > 0) {
            return errorResponse(res, 'Cannot delete category with existing products', 400);
        }

        await Category.findByIdAndDelete(req.params.id);
        return successResponse(res, {}, 'Category deleted successfully');
    }),

    bulkDeleteCategories: asyncHandler(async (req, res) => {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return errorResponse(res, 'Invalid category IDs', 400);
        }

        // Check if any categories have products
        const productsCount = await Product.countDocuments({ category: { $in: ids } });
        if (productsCount > 0) {
            return errorResponse(res, 'Cannot delete categories with existing products', 400);
        }

        const result = await Category.deleteMany({ _id: { $in: ids } });
        return successResponse(res, { deletedCount: result.deletedCount }, 'Categories deleted successfully');
    }),
    getSystemSettings: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'System settings retrieved successfully');
    }),
    updateSystemSettings: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'System settings updated successfully');
    }),

    // ===========================================
    // COUPONS MANAGEMENT
    // ===========================================
    getAllCouponsAdmin: asyncHandler(async (req, res) => {
        const { error, value } = couponQuerySchema.validate(req.query);
        if (error) {
            return errorResponse(res, error.details[0].message, 400);
        }

        const { page, limit, sort, order, isActive, discountType, search } = value;

        // Build filter object
        const filters = {};
        if (isActive !== undefined) filters.isActive = isActive;
        if (discountType) filters.discountType = discountType;
        if (search) {
            filters.$or = [
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const result = await couponService.getAllCoupons(page, limit, filters);

        if (!result.success) {
            return errorResponse(res, result.error, 500);
        }

        return successResponse(
            res,
            {
                coupons: result.coupons,
                pagination: {
                    currentPage: result.pagination.page,
                    totalPages: result.pagination.pages,
                    totalCoupons: result.pagination.total,
                    hasNext: result.pagination.page < result.pagination.pages,
                    hasPrev: result.pagination.page > 1,
                },
            },
            'Coupons retrieved successfully',
        );
    }),

    getCouponById: asyncHandler(async (req, res) => {
        const couponId = req.params.id;
        const result = await couponService.getCouponById(couponId);

        if (!result.success) {
            return errorResponse(res, result.error, result.error.includes('not found') ? 404 : 500);
        }

        return successResponse(res, result.coupon, 'Coupon retrieved successfully');
    }),

    createCoupon: asyncHandler(async (req, res) => {
        console.log('🎫 Creating coupon with data:', JSON.stringify(req.body, null, 2));

        const { error, value } = validateCreateCoupon(req.body);
        if (error) {
            console.error('🚫 Coupon validation error:', error.details[0].message);
            console.error('🚫 Full validation error:', JSON.stringify(error.details, null, 2));
            console.error('🚫 Validated value:', JSON.stringify(value, null, 2));
            return errorResponse(res, error.details[0].message, 400);
        }

        const result = await couponService.createCoupon(req.body, req.user._id);

        if (!result.success) {
            console.error('🚫 Coupon service error:', result.error);
            return errorResponse(res, result.error, 400);
        }

        return successResponse(res, result.coupon, result.message, 201);
    }),

    updateCoupon: asyncHandler(async (req, res) => {
        const { error } = validateUpdateCoupon(req.body);
        if (error) {
            return errorResponse(res, error.details[0].message, 400);
        }

        const couponId = req.params.id;
        const result = await couponService.updateCoupon(couponId, req.body);

        if (!result.success) {
            return errorResponse(res, result.error, result.error.includes('not found') ? 404 : 400);
        }

        return successResponse(res, result.coupon, result.message);
    }),

    deleteCoupon: asyncHandler(async (req, res) => {
        const couponId = req.params.id;
        const result = await couponService.deleteCoupon(couponId);

        if (!result.success) {
            return errorResponse(res, result.error, result.error.includes('not found') ? 404 : 500);
        }

        return successResponse(res, {}, result.message);
    }),

    bulkDeleteCoupons: asyncHandler(async (req, res) => {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return errorResponse(res, 'Invalid coupon IDs', 400);
        }

        try {
            const result = await Coupon.deleteMany({ _id: { $in: ids } });
            return successResponse(res, { deletedCount: result.deletedCount }, 'Coupons deleted successfully');
        } catch (error) {
            console.error('Bulk delete coupons error:', error);
            return errorResponse(res, 'Failed to delete coupons', 500);
        }
    }),

    toggleCouponStatus: asyncHandler(async (req, res) => {
        const couponId = req.params.id;
        const { isActive } = req.body;

        try {
            const coupon = await Coupon.findById(couponId);
            if (!coupon) {
                return errorResponse(res, 'Coupon not found', 404);
            }

            coupon.isActive = isActive;
            await coupon.save();

            return successResponse(res, { isActive: coupon.isActive }, 'Coupon status updated successfully');
        } catch (error) {
            console.error('Toggle coupon status error:', error);
            return errorResponse(res, 'Failed to update coupon status', 500);
        }
    }),

    // ===========================================
    // SLUG VALIDATION ENDPOINTS
    // ===========================================

    // Check if category slug exists
    checkCategorySlugExists: asyncHandler(async (req, res) => {
        const { slug } = req.params;
        const { id } = req.query; // Optional: exclude current category when editing

        const query = { slug };
        if (id) {
            query._id = { $ne: id };
        }

        const existingCategory = await Category.findOne(query);

        successResponse(res, { exists: !!existingCategory }, 'Slug check completed');
    }),

    // Check if parent category slug exists
    checkParentCategorySlugExists: asyncHandler(async (req, res) => {
        const { slug } = req.params;
        const { id } = req.query; // Optional: exclude current parent category when editing

        const query = { slug };
        if (id) {
            query._id = { $ne: id };
        }

        const existingParentCategory = await ParentCategory.findOne(query);

        successResponse(res, { exists: !!existingParentCategory }, 'Slug check completed');
    }),

    // Check if product slug exists
    checkProductSlugExists: asyncHandler(async (req, res) => {
        const { slug } = req.params;
        const { id } = req.query; // Optional: exclude current product when editing

        const query = { slug };
        if (id) {
            query._id = { $ne: id };
        }

        const existingProduct = await Product.findOne(query);

        successResponse(res, { exists: !!existingProduct }, 'Slug check completed');
    }),
};
