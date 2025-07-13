// ===========================================
// ORDER SERVICE CLASS
// ===========================================
// This service handles all order-related business logic

import Order from '../models/Order.js';
import * as orderHelper from '../helpers/orderHelper.js';
import { orderDto, ordersDto, orderListDto, adminOrderDto, customerOrderDto } from '../dto/orderDto.js';
import userService from './userService.js';
import productService from './productService.js';

class OrderService {
    // Create new order
    async createOrder(orderData) {
        try {
            // Validate order data
            const validation = orderHelper.validateOrderData(orderData);
            if (!validation.isValid) {
                return {
                    success: false,
                    errors: validation.errors,
                };
            }

            // Create order
            const result = await orderHelper.createOrderFromCart(orderData.cart, orderData);

            if (result.success) {
                // Update user order statistics
                await userService.updateOrderStats(orderData.username, result.order.pricing.total);

                // Update product sales counts
                for (const item of result.order.items) {
                    await productService.updateStock(item.productId, item.variantId, item.quantity, 'subtract');
                }

                return {
                    success: true,
                    order: orderDto(result.order),
                };
            }

            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get order by ID
    async getOrder(orderId, isAdmin = false) {
        try {
            const order = await Order.findById(orderId)
                .populate('username', 'name email')
                .populate('items.productId', 'name images');

            if (!order) {
                return {
                    success: false,
                    error: 'Order not found',
                };
            }

            // Return appropriate DTO based on context
            const orderResponse = isAdmin ? adminOrderDto(order) : customerOrderDto(order);

            return {
                success: true,
                order: orderResponse,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get order by order number
    async getOrderByNumber(orderNumber, isAdmin = false) {
        try {
            const order = await Order.findOne({ orderNumber })
                .populate('username', 'name email')
                .populate('items.productId', 'name images');

            if (!order) {
                return {
                    success: false,
                    error: 'Order not found',
                };
            }

            const orderResponse = isAdmin ? adminOrderDto(order) : customerOrderDto(order);

            return {
                success: true,
                order: orderResponse,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get all orders with filtering and pagination
    async getOrders(filters = {}, options = {}) {
        try {
            const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', isAdmin = false } = options;

            const { status, userId, startDate, endDate, paymentMethod } = filters;

            // Build query
            const query = {
                ...(status && { status }),
                ...(userId && { username: userId }),
                ...(paymentMethod && { paymentMethod }),
                ...(startDate &&
                    endDate && {
                        createdAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate),
                        },
                    }),
            };

            const orders = await Order.find(query)
                .populate('username', 'name email')
                .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
                .skip((page - 1) * limit)
                .limit(limit);

            const total = await Order.countDocuments(query);

            const orderResponse = isAdmin
                ? orders.map((order) => adminOrderDto(order))
                : orders.map((order) => orderListDto(order));

            return {
                success: true,
                orders: orderResponse,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get user's order history
    async getUserOrders(userId, options = {}) {
        try {
            const result = await orderHelper.getUserOrderHistory(userId, options);

            if (result.success) {
                return {
                    success: true,
                    orders: result.orders.map((order) => customerOrderDto(order)),
                    pagination: result.pagination,
                };
            }

            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Update order status
    async updateOrderStatus(orderId, newStatus, comment = '', changedBy = null) {
        try {
            const result = await orderHelper.updateOrderStatus(orderId, newStatus, comment, changedBy);

            if (result.success) {
                return {
                    success: true,
                    order: orderDto(result.order),
                };
            }

            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Cancel order
    async cancelOrder(orderId, reason = '', cancelledBy = null) {
        try {
            const result = await orderHelper.cancelOrder(orderId, reason, cancelledBy);

            if (result.success) {
                // Restock products
                for (const item of result.order.items) {
                    await productService.updateStock(item.productId, item.variantId, item.quantity, 'add');
                }

                return {
                    success: true,
                    order: orderDto(result.order),
                };
            }

            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Process refund
    async processRefund(orderId, refundData) {
        try {
            const result = await orderHelper.processRefund(orderId, refundData);

            if (result.success) {
                return {
                    success: true,
                    order: orderDto(result.order),
                };
            }

            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Add tracking information
    async addTrackingInfo(orderId, trackingData) {
        try {
            const result = await orderHelper.addTrackingInfo(orderId, trackingData);

            if (result.success) {
                return {
                    success: true,
                    order: orderDto(result.order),
                };
            }

            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Add internal notes (admin only)
    async addInternalNote(orderId, note, addedBy) {
        try {
            const result = await orderHelper.addInternalNote(orderId, note, addedBy);

            if (result.success) {
                return {
                    success: true,
                    order: adminOrderDto(result.order),
                };
            }

            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get order statistics
    async getOrderStats(userId = null, dateRange = {}) {
        try {
            const result = await orderHelper.getOrderStats(userId, dateRange);
            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Search orders
    async searchOrders(query, options = {}) {
        try {
            const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', isAdmin = false } = options;

            const searchQuery = {
                $or: [
                    { orderNumber: { $regex: query, $options: 'i' } },
                    { 'shippingAddress.fullName': { $regex: query, $options: 'i' } },
                    { 'shippingAddress.phoneNumber': { $regex: query, $options: 'i' } },
                    { trackingNumber: { $regex: query, $options: 'i' } },
                ],
            };

            const orders = await Order.find(searchQuery)
                .populate('username', 'name email')
                .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
                .skip((page - 1) * limit)
                .limit(limit);

            const total = await Order.countDocuments(searchQuery);

            const orderResponse = isAdmin
                ? orders.map((order) => adminOrderDto(order))
                : orders.map((order) => orderListDto(order));

            return {
                success: true,
                orders: orderResponse,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get orders by status
    async getOrdersByStatus(status, options = {}) {
        try {
            const filters = { status };
            return await this.getOrders(filters, options);
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get recent orders
    async getRecentOrders(limit = 10, isAdmin = false) {
        try {
            const orders = await Order.find({}).populate('username', 'name email').sort({ createdAt: -1 }).limit(limit);

            const orderResponse = isAdmin
                ? orders.map((order) => adminOrderDto(order))
                : orders.map((order) => orderListDto(order));

            return {
                success: true,
                orders: orderResponse,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Bulk update orders (admin only)
    async bulkUpdateOrders(updates) {
        try {
            const results = [];

            for (const update of updates) {
                const result = await this.updateOrderStatus(
                    update.orderId,
                    update.status,
                    update.comment,
                    update.changedBy,
                );
                results.push(result);
            }

            const successful = results.filter((r) => r.success).length;
            const failed = results.filter((r) => !r.success).length;

            return {
                success: true,
                message: `Updated ${successful} orders, ${failed} failed`,
                results,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get order analytics
    async getOrderAnalytics(dateRange = {}) {
        try {
            const stats = await this.getOrderStats(null, dateRange);

            if (!stats.success) {
                return stats;
            }

            // Get additional analytics
            const { startDate, endDate } = dateRange;
            const matchQuery = {
                ...(startDate &&
                    endDate && {
                        createdAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate),
                        },
                    }),
            };

            const analytics = await Order.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        dailyOrders: { $sum: 1 },
                        dailyRevenue: { $sum: '$pricing.total' },
                    },
                },
                { $sort: { _id: 1 } },
            ]);

            return {
                success: true,
                stats: stats.stats,
                dailyAnalytics: analytics,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
}

export default new OrderService();
