// ===========================================
// CART HELPER FUNCTIONS
// ===========================================
// This file contains utility functions for cart operations

import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

// Get or create cart for user/session
export const getOrCreateCart = async (userId = null, sessionId = null) => {
    try {
        if (!userId && !sessionId) {
            throw new Error(ERROR_MESSAGES.CART_USER_OR_SESSION_REQUIRED);
        }

        const cart = await Cart.findByUserOrSession(userId, sessionId);
        return {
            success: true,
            cart,
        };
    } catch (error) {
        console.error('Error getting/creating cart:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

// Add item to cart with validation
export const addItemToCart = async (cartId, productId, quantity = 1, variantId = null) => {
    try {
        const cart = await Cart.findById(cartId);
        if (!cart) {
            throw new Error(ERROR_MESSAGES.CART_NOT_FOUND);
        }

        const product = await Product.findById(productId);
        if (!product) {
            throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }

        // Check if product is published and in stock
        if (!product.isPublished) {
            throw new Error(ERROR_MESSAGES.PRODUCT_NOT_AVAILABLE);
        }

        // Determine variant system and get stock/price
        let availableStock = product.stockQuantity;
        let price = product.salePrice || product.price;
        let variantInfo = null;

        if (variantId) {
            // Check new variant system first
            if (product.variantCombinations && product.variantCombinations.length > 0) {
                const combination = product.variantCombinations.find((combo) => combo.sku === variantId);
                if (combination) {
                    availableStock = combination.stockQuantity;
                    price = combination.salePrice || combination.price || product.salePrice || product.price;
                    variantInfo = {
                        type: 'combination',
                        sku: combination.sku,
                        attributes: combination.attributes,
                        combinationKey: combination.combinationKey,
                    };
                }
            } else if (product.variants && product.variants.length > 0) {
                // Legacy variant system
                const variant = product.variants.find((v) => v.sku === variantId);
                if (variant) {
                    availableStock = variant.stockQuantity;
                    price = variant.price;
                    variantInfo = {
                        type: 'legacy',
                        sku: variant.sku,
                        name: variant.name,
                        value: variant.value,
                    };
                }
            }

            if (!variantInfo) {
                throw new Error('Selected variant not found or not available');
            }
        }

        if (availableStock < quantity) {
            throw new Error(`Only ${availableStock} items available in stock`);
        }

        // Check if item already exists in cart
        const existingItem = cart.items.find(
            (item) => item.productId.toString() === productId.toString() && item.variantId === variantId,
        );

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > availableStock) {
                throw new Error(
                    `Cannot add ${quantity} items. Only ${availableStock - existingItem.quantity} more available`,
                );
            }
        }

        // Add item to cart with variant information
        await cart.addItem(productId, quantity, variantId, {
            name: product.name,
            image: product.images[0],
            price: price,
            variantInfo: variantInfo, // Include variant details for display
        });

        return {
            success: true,
            message: 'Item added to cart successfully',
            cart,
        };
    } catch (error) {
        console.error('Error adding item to cart:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

// Remove item from cart
export const removeItemFromCart = async (cartId, productId, variantId = null) => {
    try {
        const cart = await Cart.findById(cartId);
        if (!cart) {
            throw new Error(ERROR_MESSAGES.CART_NOT_FOUND);
        }

        await cart.removeItem(productId, variantId);

        return {
            success: true,
            message: 'Item removed from cart',
            cart,
        };
    } catch (error) {
        console.error('Error removing item from cart:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

// Update item quantity in cart
export const updateCartItemQuantity = async (cartId, productId, quantity, variantId = null) => {
    try {
        const cart = await Cart.findById(cartId);
        if (!cart) {
            throw new Error(ERROR_MESSAGES.CART_NOT_FOUND);
        }

        if (quantity <= 0) {
            return await removeItemFromCart(cartId, productId, variantId);
        }

        // Check stock availability
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }

        const availableStock = variantId
            ? product.variants.find((v) => v.sku === variantId)?.stockQuantity || 0
            : product.stockQuantity;

        if (quantity > availableStock) {
            throw new Error(`Only ${availableStock} items available in stock`);
        }

        await cart.updateQuantity(productId, quantity, variantId);

        return {
            success: true,
            message: 'Cart updated successfully',
            cart,
        };
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

// Apply coupon to cart
export const applyCouponToCart = async (cartId, couponCode) => {
    try {
        const cart = await Cart.findById(cartId);
        if (!cart) {
            throw new Error(ERROR_MESSAGES.CART_NOT_FOUND);
        }

        // Import coupon helper to validate coupon
        const { validateCouponForOrder } = await import('./couponHelper.js');

        const validation = await validateCouponForOrder(couponCode, cart.username, cart.totals.subtotal, cart.items);

        if (!validation.isValid) {
            throw new Error(validation.message);
        }

        await cart.applyCoupon(validation.coupon.code, validation.discountAmount, validation.coupon.discountType);

        return {
            success: true,
            message: 'Coupon applied successfully',
            cart,
            discount: validation.discountAmount,
        };
    } catch (error) {
        console.error('Error applying coupon to cart:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

// Remove coupon from cart
export const removeCouponFromCart = async (cartId) => {
    try {
        const cart = await Cart.findById(cartId);
        if (!cart) {
            throw new Error(ERROR_MESSAGES.CART_NOT_FOUND);
        }

        cart.appliedCoupon = null;
        await cart.save();

        return {
            success: true,
            message: 'Coupon removed from cart',
            cart,
        };
    } catch (error) {
        console.error('Error removing coupon from cart:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

// Merge guest cart with user cart
export const mergeGuestCartWithUserCart = async (sessionId, userId) => {
    try {
        const mergedCart = await Cart.mergeGuestCart(sessionId, userId);

        if (!mergedCart) {
            return {
                success: true,
                message: 'No guest cart to merge',
                cart: null,
            };
        }

        return {
            success: true,
            message: 'Guest cart merged successfully',
            cart: mergedCart,
        };
    } catch (error) {
        console.error('Error merging guest cart:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

// Validate cart before checkout
export const validateCartForCheckout = async (cartId) => {
    try {
        const cart = await Cart.findById(cartId).populate('items.productId');
        if (!cart) {
            throw new Error(ERROR_MESSAGES.CART_NOT_FOUND);
        }

        if (cart.isEmpty()) {
            throw new Error(ERROR_MESSAGES.CART_EMPTY);
        }

        if (cart.isExpired) {
            throw new Error(ERROR_MESSAGES.CART_EXPIRED);
        }

        const validationErrors = [];

        // Check each item
        for (const item of cart.items) {
            const product = item.productId;

            if (!product) {
                validationErrors.push(`Product not found for item ${item.productName}`);
                continue;
            }

            if (!product.isPublished) {
                validationErrors.push(`${product.name} is no longer available`);
                continue;
            }

            const availableStock = item.variantId
                ? product.variants.find((v) => v.sku === item.variantId)?.stockQuantity || 0
                : product.stockQuantity;

            if (availableStock < item.quantity) {
                validationErrors.push(`Only ${availableStock} items available for ${product.name}`);
            }
        }

        if (validationErrors.length > 0) {
            return {
                success: false,
                errors: validationErrors,
            };
        }

        return {
            success: true,
            message: 'Cart is valid for checkout',
            cart,
        };
    } catch (error) {
        console.error('Error validating cart for checkout:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

// Get cart summary
export const getCartSummary = async (cartId) => {
    try {
        const cart = await Cart.findById(cartId).populate(
            'items.productId',
            'name images price salePrice stockQuantity',
        );
        if (!cart) {
            throw new Error(ERROR_MESSAGES.CART_NOT_FOUND);
        }

        return {
            success: true,
            summary: {
                totalItems: cart.totalItems,
                totalUniqueItems: cart.totalUniqueItems,
                subtotal: cart.totals.subtotal,
                shipping: cart.totals.shipping,
                discount: cart.totals.discount,
                total: cart.totals.total,
                appliedCoupon: cart.appliedCoupon,
                hasItems: !cart.isEmpty(),
                isExpired: cart.isExpired,
            },
        };
    } catch (error) {
        console.error('Error getting cart summary:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

// Clear expired carts (to be run as a cron job)
export const clearExpiredCarts = async () => {
    try {
        const result = await Cart.cleanupExpired();
        return {
            success: true,
            deletedCount: result.deletedCount,
        };
    } catch (error) {
        console.error('Error clearing expired carts:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};
