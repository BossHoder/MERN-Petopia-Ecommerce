import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import asyncHandler from '../middleware/asyncHandler.js'; // Giả sử bạn có một middleware xử lý lỗi async
import { ERROR_MESSAGES } from '../constants/errorMessages.js';
import {
    successResponse,
    errorResponse,
    notFoundResponse,
    validationErrorResponse,
} from '../helpers/responseHelper.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price image slug');

    if (!cart) {
        return successResponse(res, { items: [], total: 0 }, 'Cart is empty');
    }

    return successResponse(res, cart);
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addItemToCart = asyncHandler(async (req, res) => {
    console.log('🛒 Cart Controller - Request body:', req.body);
    const { productId: productIdentifier, quantity } = req.body; // Rename for clarity

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
        return validationErrorResponse(res, 'User authentication required');
    }

    const userId = req.user.id;

    // Validate quantity
    if (quantity <= 0) {
        return validationErrorResponse(res, ERROR_MESSAGES.QUANTITY_MUST_BE_POSITIVE);
    }

    // Validate productIdentifier
    if (!productIdentifier) {
        return validationErrorResponse(res, 'Product identifier is required');
    }

    // Find product by ID or Slug
    const product = await Product.findOne({
        $or: [
            {
                _id:
                    productIdentifier &&
                    typeof productIdentifier === 'string' &&
                    productIdentifier.match(/^[0-9a-fA-F]{24}$/)
                        ? productIdentifier
                        : null,
            },
            { slug: productIdentifier },
        ],
    });

    if (!product) {
        return notFoundResponse(res, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    if (product.stockQuantity < quantity) {
        return validationErrorResponse(res, ERROR_MESSAGES.NOT_ENOUGH_STOCK);
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        // If no cart, create a new one
        try {
            cart = await Cart.create({
                user: userId,
                items: [{ product: product._id, quantity, price: product.price }],
            });
        } catch (error) {
            // Handle duplicate key error
            if (error.code === 11000) {
                // Cart already exists, try to find it again
                cart = await Cart.findOne({ user: userId });
                if (cart) {
                    // Add item to existing cart
                    const itemIndex = cart.items.findIndex(
                        (item) => item.product.toString() === product._id.toString(),
                    );
                    if (itemIndex > -1) {
                        const newQuantity = cart.items[itemIndex].quantity + quantity;
                        if (product.stockQuantity < newQuantity) {
                            return validationErrorResponse(res, ERROR_MESSAGES.NOT_ENOUGH_STOCK);
                        }
                        cart.items[itemIndex].quantity = newQuantity;
                    } else {
                        cart.items.push({ product: product._id, quantity, price: product.price });
                    }
                    await cart.save();
                } else {
                    throw error; // Re-throw if cart still not found
                }
            } else {
                throw error; // Re-throw other errors
            }
        }
    } else {
        // If cart exists, find the item using the product's actual ObjectId
        const itemIndex = cart.items.findIndex((item) => item.product.toString() === product._id.toString());

        if (itemIndex > -1) {
            // If item exists, update quantity
            const newQuantity = cart.items[itemIndex].quantity + quantity;
            if (product.stockQuantity < newQuantity) {
                return validationErrorResponse(res, ERROR_MESSAGES.NOT_ENOUGH_STOCK);
            }
            cart.items[itemIndex].quantity = newQuantity;
        } else {
            // If item does not exist, add it
            cart.items.push({ product: product._id, quantity, price: product.price });
        }
        await cart.save();
    }

    // Always populate product details before sending the response
    await cart.populate({
        path: 'items.product',
        select: 'name images price stockQuantity slug',
    });

    return successResponse(res, cart, 'Product added to cart successfully.');
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
const removeItemFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        return notFoundResponse(res, ERROR_MESSAGES.CART_NOT_FOUND);
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    await cart.populate('items.product', 'name price image slug');

    return successResponse(res, cart);
});

// @desc    Update item quantity in cart
// @route   PUT /api/cart/items/:productId
// @access  Private
const updateItemQuantity = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (quantity <= 0) {
        return removeItemFromCart(req, res);
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        return notFoundResponse(res, ERROR_MESSAGES.CART_NOT_FOUND);
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        await cart.populate('items.product', 'name price image slug');
        return successResponse(res, cart);
    } else {
        return notFoundResponse(res, ERROR_MESSAGES.ITEM_NOT_FOUND_IN_CART);
    }
});

// @desc    Clear the entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId });

    if (cart) {
        cart.items = [];
        await cart.save();
        return successResponse(res, cart);
    } else {
        return successResponse(res, { items: [], total: 0 });
    }
});

// @desc    Migrate guest cart to authenticated user cart
// @route   POST /api/cart/migrate
// @access  Private
const migrateGuestCart = asyncHandler(async (req, res) => {
    const { items } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return successResponse(res, { message: 'No items to migrate' });
    }

    // Find or create user cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = new Cart({ user: userId, items: [] });
    }

    // Migrate each item from guest cart
    for (const guestItem of items) {
        const { productId, quantity, price } = guestItem;

        // Validate product exists
        const product = await Product.findById(productId);
        if (!product) {
            continue; // Skip invalid products
        }

        // Check if item already exists in user cart
        const existingItemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

        if (existingItemIndex > -1) {
            // Update existing item quantity
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            if (product.stockQuantity >= newQuantity) {
                cart.items[existingItemIndex].quantity = newQuantity;
            }
        } else {
            // Add new item if stock is available
            if (product.stockQuantity >= quantity) {
                cart.items.push({
                    product: productId,
                    quantity,
                    price: product.price, // Use current price
                });
            }
        }
    }

    await cart.save();
    await cart.populate('items.product', 'name price image slug');

    return successResponse(res, cart);
});

export { getCart, addItemToCart, removeItemFromCart, updateItemQuantity, clearCart, migrateGuestCart };
