import { getGuestCartItemCount } from './guestCartStorage';

/**
 * Get total cart item count for both authenticated and guest users
 */
export const getTotalCartItemCount = (cartItems, isAuthenticated) => {
    if (isAuthenticated) {
        // For authenticated users, use Redux cart state
        return cartItems ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;
    } else {
        // For guest users, use localStorage
        return getGuestCartItemCount();
    }
};

/**
 * Get cart total price for both authenticated and guest users
 */
export const getCartTotalPrice = (cartItems, isAuthenticated) => {
    if (isAuthenticated) {
        // For authenticated users, use Redux cart state
        return cartItems ? cartItems.reduce((total, item) => total + (item.price * item.quantity), 0) : 0;
    } else {
        // For guest users, calculate from localStorage
        const { getGuestCart } = require('./guestCartStorage');
        const guestCart = getGuestCart();
        return guestCart.total || 0;
    }
};
