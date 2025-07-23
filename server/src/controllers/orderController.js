import Order from '../models/Order.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }

    const order = new Order({
        user: req.user.id,
        orderItems: orderItems.map((item) => ({
            ...item,
            product: item._id,
            _id: undefined, // Remove original _id from cart item
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    });

    const createdOrder = await order.save();

    res.status(201).json({
        success: true,
        data: createdOrder,
    });
});

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user.id });
    res.status(200).json({
        success: true,
        data: orders,
    });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        // Ensure only the user who placed the order or an admin can view it
        if (order.user.toString() !== req.user.id && req.user.role !== 'ADMIN') {
            res.status(403);
            throw new Error('Not authorized to view this order');
        }
        res.status(200).json({
            success: true,
            data: order,
        });
    } else {
        res.status(404);
        throw new Error('Order not found');
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

        res.status(200).json({
            success: true,
            data: updatedOrder,
        });
    } else {
        res.status(404);
        throw new Error('Order not found');
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

        res.status(200).json({
            success: true,
            data: updatedOrder,
        });
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

export { createOrder, getMyOrders, getOrderById, updateOrderToPaid, updateOrderToDelivered };
