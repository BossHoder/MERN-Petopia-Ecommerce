import Order from '../models/Order.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
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
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return validationErrorResponse(res, ERROR_MESSAGES.NO_ORDER_ITEMS);
    }

    const order = new Order({
        user: req.user.id,
        orderItems: orderItems.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            image: item.product.images && item.product.images.length > 0 ? item.product.images[0] : '/placeholder.jpg',
            price: item.price,
            product: item.product._id, // Sửa ở đây
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
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();

        const updatedOrder = await order.save();

        return successResponse(res, updatedOrder);
    } else {
        return notFoundResponse(res, ERROR_MESSAGES.ORDER_NOT_FOUND);
    }
});

export { createOrder, getMyOrders, getOrderById, updateOrderToPaid, updateOrderToDelivered };
