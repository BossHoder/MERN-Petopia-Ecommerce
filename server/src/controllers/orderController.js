import Order from '../models/Order.js';
import Product from '../models/Product.js';
import asyncHandler from '../middleware/asyncHandler.js';
import emailService from '../services/emailService.js';
import stockService from '../services/stockService.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';
import {
    successResponse,
    errorResponse,
    notFoundResponse,
    validationErrorResponse,
    createdResponse,
} from '../helpers/responseHelper.js';
import {
    calculateDeliveryRange,
    calculateEstimatedDeliveryDate,
    calculateAutomaticTransitionTimes,
} from '../utils/deliveryUtils.js';
import orderSchedulerService from '../services/orderSchedulerService.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (supports both authenticated and guest users)
const createOrder = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        couponDiscount,
        appliedCoupon,
        guestInfo,
    } = req.body;

    console.log('🛒 Create Order Debug:', {
        hasUser: !!req.user,
        userId: req.user?._id,
        userEmail: req.user?.email,
        hasGuestInfo: !!guestInfo,
        guestEmail: guestInfo?.email,
        orderItemsCount: orderItems?.length || 0,
        hasAppliedCoupon: !!appliedCoupon,
        couponCode: appliedCoupon?.code,
        couponDiscount: couponDiscount || 0,
    });

    if (!orderItems || orderItems.length === 0) {
        return validationErrorResponse(res, ERROR_MESSAGES.NO_ORDER_ITEMS);
    }

    // Determine if this is a guest order
    const isGuestOrder = !req.user;

    // Validate and process coupon if applied
    let validatedCoupon = null;
    if (appliedCoupon && appliedCoupon.code) {
        try {
            const { validateCouponForOrder } = await import('../helpers/couponHelper.js');
            const userId = isGuestOrder ? null : req.user._id;

            const couponValidation = await validateCouponForOrder(appliedCoupon.code, userId, itemsPrice, orderItems);

            if (!couponValidation.isValid) {
                return validationErrorResponse(res, couponValidation.message);
            }

            // Get the full coupon document to get the ID
            const Coupon = (await import('../models/Coupon.js')).default;
            const couponDoc = await Coupon.findOne({ code: appliedCoupon.code.toUpperCase() });

            validatedCoupon = {
                code: appliedCoupon.code,
                discountType: appliedCoupon.discountType,
                discountValue: appliedCoupon.discountValue,
                discountAmount: couponValidation.discountAmount,
                couponId: couponDoc._id,
            };

            console.log('✅ Coupon validated:', validatedCoupon);
        } catch (error) {
            console.error('❌ Coupon validation error:', error);
            return validationErrorResponse(res, 'Invalid coupon code');
        }
    }

    // Step 1: Validate stock availability
    console.log('📦 Validating stock availability...');
    const itemsForValidation = orderItems.map((item) => ({
        product: item.product?._id || item.productId,
        productId: item.product?._id || item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
    }));

    const stockValidation = await stockService.validateStockAvailability(itemsForValidation);

    if (!stockValidation.success) {
        console.log('❌ Stock validation failed:', stockValidation.errors);
        return validationErrorResponse(res, 'Stock validation failed', {
            errors: stockValidation.errors,
            details: 'One or more items in your order are not available in the requested quantity',
        });
    }

    console.log('✅ Stock validation passed');

    // Validate shipping address for both authenticated and guest users
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.phoneNumber) {
        return validationErrorResponse(res, 'Shipping address and phone number are required');
    }

    // Step 2: Reserve stock before creating order
    console.log('🔒 Reserving stock for order...');
    const stockReservation = await stockService.reserveStock(itemsForValidation);

    if (!stockReservation.success) {
        console.log('❌ Stock reservation failed:', stockReservation.error);
        return errorResponse(res, 'Failed to reserve stock for order', 400, {
            error: stockReservation.error,
            details: 'Stock reservation failed. Please try again.',
        });
    }

    console.log('✅ Stock reserved successfully');

    // Calculate delivery estimates
    const orderDate = new Date();
    const deliveryRange = calculateDeliveryRange(orderDate);
    const estimatedDeliveryDate = calculateEstimatedDeliveryDate(orderDate);
    const transitionTimes = calculateAutomaticTransitionTimes(orderDate);

    // Step 3: Create order with enhanced order items including variant information
    const enhancedOrderItems = await Promise.all(
        orderItems.map(async (item) => {
            const product = await Product.findById(item.product?._id || item.productId);
            let variantName = null;

            // Legacy variant support
            if (item.variantId && product) {
                const variant = product.variants.find((v) => v.sku === item.variantId);
                if (variant) {
                    variantName = `${variant.name}: ${variant.value}`;
                }
            }

            const orderItem = {
                name: item.product?.name || product?.name || 'Unknown Product',
                quantity: item.quantity,
                image:
                    item.product?.images && item.product.images.length > 0
                        ? item.product.images[0]
                        : product?.images && product.images.length > 0
                        ? product.images[0]
                        : '/placeholder.jpg',
                price: item.price,
                product: item.product?._id || item.productId,
                variantId: item.variantId || null,
                variantName: variantName,
            };

            // Add selectedVariants if provided from cart
            if (item.selectedVariants) {
                orderItem.selectedVariants = item.selectedVariants;
            }

            return orderItem;
        }),
    );

    const order = new Order({
        user: isGuestOrder ? null : req.user._id,
        isGuestOrder,
        guestInfo: isGuestOrder ? guestInfo : null,
        orderItems: enhancedOrderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        // Add coupon information if applied
        ...(validatedCoupon && {
            appliedCoupon: {
                code: validatedCoupon.code,
                discountType: validatedCoupon.discountType,
                discountValue: validatedCoupon.discountValue,
                discountAmount: validatedCoupon.discountAmount,
                couponId: validatedCoupon.couponId,
                appliedAt: new Date(),
            },
            couponDiscount: validatedCoupon.discountAmount,
        }),
        // Add delivery estimates
        estimatedDeliveryDate,
        estimatedDeliveryRange: deliveryRange,
        // Set up automatic transitions
        automaticTransitions: {
            pendingToProcessing: {
                scheduledAt: transitionTimes.pendingToProcessing,
                isAutomatic: true,
            },
            processingToDelivering: {
                scheduledAt: transitionTimes.processingToDelivering,
                isAutomatic: true,
            },
        },
        // Initialize status history
        statusHistory: [
            {
                status: 'pending',
                timestamp: orderDate,
                comment: 'Order created',
                changedBy: isGuestOrder ? 'guest' : req.user._id.toString(),
                isAutomatic: false,
            },
        ],
    });

    console.log('📦 Order Creation Data:', {
        userId: order.user,
        isGuestOrder: order.isGuestOrder,
        hasGuestInfo: !!order.guestInfo,
        orderItemsCount: order.orderItems.length,
        totalPrice: order.totalPrice,
    });

    try {
        const createdOrder = await order.save();

        // Track coupon usage if coupon was applied
        if (validatedCoupon) {
            try {
                const Coupon = (await import('../models/Coupon.js')).default;
                await Coupon.findByIdAndUpdate(validatedCoupon.couponId, {
                    $inc: { usedCount: 1 },
                    $push: {
                        usageHistory: {
                            userId: isGuestOrder ? null : req.user._id,
                            orderId: createdOrder._id,
                            discountAmount: validatedCoupon.discountAmount,
                            usedAt: new Date(),
                        },
                    },
                });
                console.log('✅ Coupon usage tracked:', validatedCoupon.code);
            } catch (couponError) {
                console.error('❌ Failed to track coupon usage:', couponError);
                // Don't fail the order creation if coupon tracking fails
            }
        }

        console.log('✅ Order created successfully:', {
            orderId: createdOrder._id,
            orderNumber: createdOrder.orderNumber,
            userId: createdOrder.user,
            isGuestOrder: createdOrder.isGuestOrder,
            totalPrice: createdOrder.totalPrice,
            couponApplied: !!validatedCoupon,
            couponCode: validatedCoupon?.code,
            couponDiscount: validatedCoupon?.discountAmount || 0,
            estimatedDelivery: createdOrder.estimatedDeliveryDate,
            deliveryRange: `${createdOrder.estimatedDeliveryRange.start.toDateString()} - ${createdOrder.estimatedDeliveryRange.end.toDateString()}`,
            automaticTransitions: {
                pendingToProcessing: createdOrder.automaticTransitions.pendingToProcessing.scheduledAt,
                processingToDelivering: createdOrder.automaticTransitions.processingToDelivering.scheduledAt,
            },
        });

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
        // If order creation fails, restore the reserved stock
        console.error('❌ Error saving order:', error);
        console.log('🔄 Restoring reserved stock due to order creation failure...');

        try {
            const restoreResult = await stockService.restoreStock(itemsForValidation);
            if (restoreResult.success) {
                console.log('✅ Stock restored successfully after order creation failure');
            } else {
                console.error('❌ Failed to restore stock after order creation failure:', restoreResult.error);
            }
        } catch (restoreError) {
            console.error('❌ Critical error: Failed to restore stock after order creation failure:', restoreError);
        }

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
        // Admin can view any order
        if (req.user.role === 'ADMIN') {
            return successResponse(res, order);
        }

        // Handle guest orders (where user is null)
        if (order.isGuestOrder || !order.user) {
            // For guest orders, only admin can view (guests can't authenticate to access this endpoint)
            return errorResponse(res, ERROR_MESSAGES.FORBIDDEN, 403);
        } else {
            // For user orders, ensure only the user who placed the order can view it
            if (order.user._id.toString() !== req.user.id) {
                return errorResponse(res, ERROR_MESSAGES.FORBIDDEN, 403);
            }
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
