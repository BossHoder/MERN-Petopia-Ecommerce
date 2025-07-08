// ===========================================
// ORDER HELPER FUNCTIONS
// ===========================================
// This file contains utility functions for order operations

import Order from '../models/Order.js';
import User from '../models/User.js';

// Generate unique order number
export const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};

// Calculate order pricing
export const calculateOrderPricing = (items, shippingCost = 0, couponDiscount = 0) => {
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal >= 200000 ? 0 : shippingCost; // Free shipping over 200k VND
    const discount = couponDiscount;
    const total = subtotal + shipping - discount;

    return {
        subtotal,
        shipping,
        discount,
        total
    };
};

// Create order from cart
export const createOrderFromCart = async (cart, orderData) => {
    try {
        const {
            username,
            shippingAddress,
            paymentMethod,
            appliedCoupon
        } = orderData;

        // Calculate pricing
        const pricing = calculateOrderPricing(
            cart.items,
            20000, // Default shipping cost
            appliedCoupon?.discount || 0
        );

        // Create order
        const order = new Order({
            orderNumber: generateOrderNumber(),
            username,
            items: cart.items.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                productName: item.productName,
                image: item.productImage,
                price: item.price,
                quantity: item.quantity
            })),
            shippingAddress,
            paymentMethod,
            appliedCoupon,
            pricing,
            status: 'pending',
            statusHistory: [{
                status: 'pending',
                comment: 'Order created',
                timestamp: new Date()
            }]
        });

        await order.save();
        return {
            success: true,
            order
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Update order status
export const updateOrderStatus = async (orderId, newStatus, comment = '', changedBy = null) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Validate status transition
        const isValidTransition = order.canTransitionTo(newStatus);
        if (!isValidTransition) {
            throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
        }

        // Update status
        order.status = newStatus;
        order.statusHistory.push({
            status: newStatus,
            comment,
            changedBy,
            timestamp: new Date()
        });

        // Update special fields based on status
        if (newStatus === 'delivered') {
            order.isDelivered = true;
            order.actualDelivery = new Date();
        } else if (newStatus === 'paid') {
            order.isPaid = true;
            order.paidAt = new Date();
        }

        await order.save();

        return {
            success: true,
            order
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Cancel order
export const cancelOrder = async (orderId, reason = '', cancelledBy = null) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        if (!order.canBeCancelled) {
            throw new Error('Order cannot be cancelled at this stage');
        }

        order.status = 'cancelled';
        order.cancellationReason = reason;
        order.statusHistory.push({
            status: 'cancelled',
            comment: `Order cancelled. Reason: ${reason}`,
            changedBy: cancelledBy,
            timestamp: new Date()
        });

        await order.save();

        return {
            success: true,
            order
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Process refund
export const processRefund = async (orderId, refundData) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        if (!order.canBeRefunded) {
            throw new Error('Order cannot be refunded');
        }

        const {
            amount,
            reason,
            method = 'original_payment',
            processedBy
        } = refundData;

        order.refundInfo = {
            amount,
            reason,
            method,
            processedBy,
            processedAt: new Date()
        };

        order.status = 'refunded';
        order.statusHistory.push({
            status: 'refunded',
            comment: `Refund processed: ${amount} VND. Reason: ${reason}`,
            changedBy: processedBy,
            timestamp: new Date()
        });

        await order.save();

        return {
            success: true,
            order
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Add tracking information
export const addTrackingInfo = async (orderId, trackingData) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        const {
            shippingCompany,
            trackingNumber,
            estimatedDelivery
        } = trackingData;

        order.shippingCompany = shippingCompany;
        order.trackingNumber = trackingNumber;
        order.estimatedDelivery = estimatedDelivery;

        // Update status to shipped if not already
        if (order.status === 'confirmed' || order.status === 'processing') {
            order.status = 'shipped';
            order.statusHistory.push({
                status: 'shipped',
                comment: `Order shipped via ${shippingCompany}. Tracking: ${trackingNumber}`,
                timestamp: new Date()
            });
        }

        await order.save();

        return {
            success: true,
            order
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Get order statistics
export const getOrderStats = async (userId = null, dateRange = {}) => {
    try {
        const { startDate, endDate } = dateRange;
        
        const matchQuery = {
            ...(userId && { username: userId }),
            ...(startDate && endDate && {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            })
        };

        const stats = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$pricing.total' },
                    averageOrderValue: { $avg: '$pricing.total' },
                    pendingOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    confirmedOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
                    },
                    shippedOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
                    },
                    deliveredOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
                    },
                    cancelledOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                    }
                }
            }
        ]);

        return {
            success: true,
            stats: stats[0] || {
                totalOrders: 0,
                totalRevenue: 0,
                averageOrderValue: 0,
                pendingOrders: 0,
                confirmedOrders: 0,
                shippedOrders: 0,
                deliveredOrders: 0,
                cancelledOrders: 0
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Get user's order history
export const getUserOrderHistory = async (userId, options = {}) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = options;

        const query = { username: userId };
        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('username', 'name email');

        const total = await Order.countDocuments(query);

        return {
            success: true,
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Check if order can be cancelled by user
export const canUserCancelOrder = (order) => {
    const cancellableStatuses = ['pending', 'confirmed'];
    return cancellableStatuses.includes(order.status);
};

// Check if order can be refunded
export const canOrderBeRefunded = (order) => {
    const refundableStatuses = ['delivered'];
    const daysSinceDelivery = (new Date() - order.actualDelivery) / (1000 * 60 * 60 * 24);
    return refundableStatuses.includes(order.status) && daysSinceDelivery <= 7; // 7 days return policy
};

// Add internal notes (admin only)
export const addInternalNote = async (orderId, note, addedBy) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        order.internalNotes.push({
            note,
            addedBy,
            addedAt: new Date()
        });

        await order.save();

        return {
            success: true,
            order
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Validate order data
export const validateOrderData = (orderData) => {
    const errors = [];

    if (!orderData.username) {
        errors.push('User ID is required');
    }

    if (!orderData.items || orderData.items.length === 0) {
        errors.push('Order must have at least one item');
    }

    if (!orderData.shippingAddress) {
        errors.push('Shipping address is required');
    } else {
        const requiredFields = ['fullName', 'phoneNumber', 'address', 'city', 'district'];
        for (const field of requiredFields) {
            if (!orderData.shippingAddress[field]) {
                errors.push(`Shipping address ${field} is required`);
            }
        }
    }

    if (!orderData.paymentMethod) {
        errors.push('Payment method is required');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
