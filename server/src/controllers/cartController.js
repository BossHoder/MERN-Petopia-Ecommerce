import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/asyncHandler.js'; // Giả sử bạn có một middleware xử lý lỗi async

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price image');

    if (!cart) {
        return res.status(200).json({
            message: 'Cart is empty',
            data: { items: [], total: 0 },
        });
    }

    res.status(200).json({
        success: true,
        data: cart,
    });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addItemToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = await Cart.create({
            user: userId,
            items: [{ product: productId, quantity, price: product.price }],
        });
    } else {
        const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity, price: product.price });
        }
        await cart.save();
    }

    // Populate product details for the response
    await cart.populate('items.product', 'name price image');

    res.status(201).json({
        success: true,
        data: cart,
    });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
const removeItemFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    await cart.populate('items.product', 'name price image');

    res.status(200).json({
        success: true,
        data: cart,
    });
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
        res.status(404);
        throw new Error('Cart not found');
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        await cart.populate('items.product', 'name price image');
        res.status(200).json({
            success: true,
            data: cart,
        });
    } else {
        res.status(404);
        throw new Error('Item not found in cart');
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
        res.status(200).json({
            success: true,
            data: cart,
        });
    } else {
        res.status(200).json({
            success: true,
            data: { items: [], total: 0 },
        });
    }
});

export { getCart, addItemToCart, removeItemFromCart, updateItemQuantity, clearCart };
