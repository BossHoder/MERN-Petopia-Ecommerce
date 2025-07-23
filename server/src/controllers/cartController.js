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
    const { productId: productIdentifier, quantity } = req.body; // Rename for clarity
    const userId = req.user.id;

    // Validate quantity
    if (quantity <= 0) {
        res.status(400);
        throw new Error('Quantity must be a positive number.');
    }

    // Find product by ID or Slug
    const product = await Product.findOne({
        $or: [
            { _id: productIdentifier.match(/^[0-9a-fA-F]{24}$/) ? productIdentifier : null },
            { slug: productIdentifier },
        ],
    });

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.stockQuantity < quantity) {
        res.status(400);
        throw new Error('Not enough product in stock');
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        // If no cart, create a new one
        cart = await Cart.create({
            user: userId,
            items: [{ product: product._id, quantity, price: product.price }],
        });
    } else {
        // If cart exists, find the item using the product's actual ObjectId
        const itemIndex = cart.items.findIndex((item) => item.product.toString() === product._id.toString());

        if (itemIndex > -1) {
            // If item exists, update quantity
            const newQuantity = cart.items[itemIndex].quantity + quantity;
            if (product.stockQuantity < newQuantity) {
                res.status(400);
                throw new Error('Not enough product in stock for the updated quantity');
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
        select: 'name images price stockQuantity',
    });

    res.status(201).json({
        success: true,
        message: 'Product added to cart successfully.',
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
