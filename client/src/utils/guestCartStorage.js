/**
 * Guest Cart Storage Utilities
 * Manages guest cart data in browser localStorage with 14-day expiration
 */

const GUEST_CART_KEY = 'petopia_guest_cart';
const GUEST_CART_EXPIRY_DAYS = 14;

/**
 * Generate a unique guest session ID
 */
export const generateGuestSessionId = () => {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get guest session ID from localStorage or create new one
 */
export const getGuestSessionId = () => {
    let sessionId = localStorage.getItem('petopia_guest_session_id');
    if (!sessionId) {
        sessionId = generateGuestSessionId();
        localStorage.setItem('petopia_guest_session_id', sessionId);
    }
    return sessionId;
};

/**
 * Check if guest cart data has expired
 */
const isExpired = (timestamp) => {
    const now = new Date().getTime();
    const expiryTime = timestamp + GUEST_CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    return now > expiryTime;
};

/**
 * Get guest cart from localStorage
 */
export const getGuestCart = () => {
    try {
        const cartData = localStorage.getItem(GUEST_CART_KEY);
        if (!cartData) {
            return {
                items: [],
                total: 0,
                sessionId: getGuestSessionId(),
                createdAt: new Date().getTime(),
                updatedAt: new Date().getTime(),
            };
        }

        const parsedCart = JSON.parse(cartData);

        // Check if cart has expired
        if (isExpired(parsedCart.createdAt)) {
            clearGuestCart();
            return {
                items: [],
                total: 0,
                sessionId: getGuestSessionId(),
                createdAt: new Date().getTime(),
                updatedAt: new Date().getTime(),
            };
        }

        return parsedCart;
    } catch (error) {
        console.error('Error getting guest cart:', error);
        return {
            items: [],
            total: 0,
            sessionId: getGuestSessionId(),
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
        };
    }
};

/**
 * Save guest cart to localStorage
 */
export const saveGuestCart = (cartData) => {
    try {
        const cartToSave = {
            ...cartData,
            sessionId: getGuestSessionId(),
            updatedAt: new Date().getTime(),
        };

        // Calculate total
        cartToSave.total = cartToSave.items.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0,
        );

        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartToSave));
        return cartToSave;
    } catch (error) {
        console.error('Error saving guest cart:', error);
        return cartData;
    }
};

/**
 * Add item to guest cart
 */
export const addItemToGuestCart = (
    product,
    quantity = 1,
    variantId = null,
    selectedVariants = null,
) => {
    const cart = getGuestCart();

    // Find existing item considering both product ID and variant ID
    const existingItemIndex = cart.items.findIndex((item) => {
        const productMatch = item.product._id === product._id;
        const variantMatch = selectedVariants
            ? item.selectedVariants?.variantId === selectedVariants.variantId
            : (item.variantId || null) === (variantId || null);
        return productMatch && variantMatch;
    });

    if (existingItemIndex > -1) {
        // Update existing item quantity
        cart.items[existingItemIndex].quantity += quantity;
    } else {
        // Add new item
        const cartItem = {
            product: {
                _id: product._id,
                name: product.name,
                image: product.image || product.images?.[0] || '/images/placeholder.jpg',
                price: product.price,
                slug: product.slug,
                inStock: product.inStock,
                stockQuantity: product.stockQuantity,
            },
            quantity,
            price: product.price,
        };

        // Add variant information if provided
        if (selectedVariants) {
            cartItem.selectedVariants = selectedVariants;
            // Use variant price if available
            if (selectedVariants.price) {
                cartItem.price = selectedVariants.price;
            }
        } else if (variantId && product.variant) {
            // Legacy variant support
            cartItem.variantId = variantId;
            cartItem.variant = {
                id: product.variant.id,
                name: product.variant.name,
                value: product.variant.value,
                displayName: product.variant.displayName,
            };
            // Use variant price if available
            if (product.variant.price) {
                cartItem.price = product.variant.price;
            }
        }

        cart.items.push(cartItem);
    }

    return saveGuestCart(cart);
};

/**
 * Remove item from guest cart
 */
export const removeItemFromGuestCart = (productId, variantId = null) => {
    const cart = getGuestCart();
    cart.items = cart.items.filter((item) => {
        const productMatch = item.product._id === productId;
        if (!productMatch) return true;

        // Check variant match
        if (variantId) {
            // Remove by variantId (could be selectedVariants.variantId or legacy variantId)
            return !(
                item.selectedVariants?.variantId === variantId || item.variantId === variantId
            );
        } else {
            // Remove items without variants
            return item.selectedVariants?.variantId != null || item.variantId != null;
        }
    });
    return saveGuestCart(cart);
};

/**
 * Update item quantity in guest cart
 */
export const updateGuestCartItemQuantity = (productId, quantity, variantId = null) => {
    const cart = getGuestCart();
    const itemIndex = cart.items.findIndex((item) => {
        const productMatch = item.product._id === productId;
        const variantMatch = variantId
            ? item.selectedVariants?.variantId === variantId || item.variantId === variantId
            : !item.selectedVariants?.variantId && !item.variantId;
        return productMatch && variantMatch;
    });

    if (itemIndex > -1) {
        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }
    }

    return saveGuestCart(cart);
};

/**
 * Clear guest cart
 */
export const clearGuestCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
    return {
        items: [],
        total: 0,
        sessionId: getGuestSessionId(),
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
    };
};

/**
 * Get guest cart item count
 */
export const getGuestCartItemCount = () => {
    const cart = getGuestCart();
    return cart.items.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Migrate guest cart to authenticated user cart
 * This function returns the guest cart data for server-side migration
 */
export const getGuestCartForMigration = () => {
    const cart = getGuestCart();
    if (cart.items.length === 0) {
        return null;
    }

    return {
        items: cart.items.map((item) => ({
            productId: item.product._id,
            quantity: item.quantity,
            price: item.price,
            ...(item.selectedVariants && { selectedVariants: item.selectedVariants }),
            // Legacy support
            ...(item.variantId && !item.selectedVariants && { variantId: item.variantId }),
        })),
    };
};

/**
 * Clear guest cart after successful migration
 */
export const clearGuestCartAfterMigration = () => {
    clearGuestCart();
    localStorage.removeItem('petopia_guest_session_id');
};
