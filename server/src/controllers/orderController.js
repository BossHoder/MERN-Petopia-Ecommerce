import Order from '../models/Order.js';
import asyncHandler from '../middleware/asyncHandler.js';
import emailService from '../services/emailService.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';
import {
    successResponse,
    errorResponse,
    notFoundResponse,
    validationErrorResponse,
    createdResponse,
} from '../helpers/responseHelper.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (supports both authenticated and guest users)
const createOrder = asyncHandler(async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice, guestInfo } =
        req.body;

    if (!orderItems || orderItems.length === 0) {
        return validationErrorResponse(res, ERROR_MESSAGES.NO_ORDER_ITEMS);
    }

    // Validate shipping address for both authenticated and guest users
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.phoneNumber) {
        return validationErrorResponse(res, 'Shipping address and phone number are required');
    }

    const isGuestOrder = !req.user;

    const order = new Order({
        user: isGuestOrder ? null : req.user.id,
        isGuestOrder,
        guestInfo: isGuestOrder ? guestInfo : null,
        orderItems: orderItems.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            image: item.product.images && item.product.images.length > 0 ? item.product.images[0] : '/placeholder.jpg',
            price: item.price,
            product: item.product._id,
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    });

    try {
        const createdOrder = await order.save();

        // Send order confirmation email (don't block order creation if email fails)
        try {
            const customerEmail = isGuestOrder ? guestInfo.email : req.user.email;
            const customerName = isGuestOrder ? guestInfo.fullName : req.user.name || req.user.username;

            if (customerEmail) {
                await emailService.sendOrderConfirmationEmail(createdOrder, customerEmail, customerName);
                console.log('✅ Order confirmation email sent successfully to:', customerEmail);
            }
        } catch (emailError) {
            console.error('⚠️ Failed to send order confirmation email:', emailError);
            // Continue with order creation success even if email fails
        }

        return createdResponse(res, createdOrder);
    } catch (error) {
        // Log the full validation error to the backend console
        console.error('Error saving order:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 400, error.message);
    }
});

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user.id });
    return successResponse(res, orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        // Ensure only the user who placed the order or an admin can view it
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'ADMIN') {
            return errorResponse(res, ERROR_MESSAGES.FORBIDDEN, 403);
        }
        return successResponse(res, order);
    } else {
        return notFoundResponse(res, ERROR_MESSAGES.ORDER_NOT_FOUND);
    }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            // Data from payment gateway
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.payer.email_address,
        };

        const updatedOrder = await order.save();

        return successResponse(res, updatedOrder);
    } else {
        return notFoundResponse(res, ERROR_MESSAGES.ORDER_NOT_FOUND);
    }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user');

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();

        const updatedOrder = await order.save();

        // Send shipping notification email (don't block order update if email fails)
        try {
            const customerEmail = order.isGuestOrder ? order.guestInfo.email : order.user?.email;
            const customerName = order.isGuestOrder
                ? order.guestInfo.fullName
                : order.user?.name || order.user?.username;

            if (customerEmail) {
                // Optional: Include tracking information from request body
                const trackingInfo = {
                    trackingNumber: req.body.trackingNumber || null,
                    trackingUrl: req.body.trackingUrl || null,
                };

                await emailService.sendShippingNotificationEmail(
                    updatedOrder,
                    customerEmail,
                    customerName,
                    trackingInfo,
                );
                console.log('✅ Shipping notification email sent successfully to:', customerEmail);
            }
        } catch (emailError) {
            console.error('⚠️ Failed to send shipping notification email:', emailError);
            // Continue with order update success even if email fails
        }

        return successResponse(res, updatedOrder);
    } else {
        return notFoundResponse(res, ERROR_MESSAGES.ORDER_NOT_FOUND);
    }
});

export { createOrder, getMyOrders, getOrderById, updateOrderToPaid, updateOrderToDelivered };
