// ===========================================
// CART DATA TRANSFER OBJECTS
// ===========================================
// This file contains DTOs for transforming cart data

export const cartItemDto = (item, productDetails = null) => {
    return {
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        productImage: item.productImage,
        price: item.price,
        quantity: item.quantity,
        addedAt: item.addedAt,
        // Include selectedVariants if available
        ...(item.selectedVariants && { selectedVariants: item.selectedVariants }),
        // Include full product details if populated
        ...(productDetails && {
            product: {
                name: productDetails.name,
                slug: productDetails.slug,
                price: productDetails.price,
                salePrice: productDetails.salePrice,
                finalPrice: productDetails.salePrice || productDetails.price,
                images: productDetails.images,
                stockQuantity: productDetails.stockQuantity,
                inStock: productDetails.stockQuantity > 0,
                maxQuantity: productDetails.stockQuantity,
                variants: productDetails.variants,
                category: productDetails.category,
                brand: productDetails.brand,
            },
        }),
    };
};

export const cartDto = (cart, populatedProducts = []) => {
    const itemsWithProducts = cart.items.map((item) => {
        const productDetails = populatedProducts.find((p) => p._id.toString() === item.productId.toString());
        return cartItemDto(item, productDetails);
    });

    return {
        id: cart._id,
        username: cart.username,
        sessionId: cart.sessionId,
        items: itemsWithProducts,
        totals: cart.totals,
        appliedCoupon: cart.appliedCoupon,
        shippingAddress: cart.shippingAddress,
        totalItems: cart.totalItems,
        totalUniqueItems: cart.totalUniqueItems,
        isExpired: cart.isExpired,
        expiresAt: cart.expiresAt,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
    };
};

// Simplified cart for checkout
export const cartCheckoutDto = (cart) => {
    return {
        id: cart._id,
        items: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            productImage: item.productImage,
            price: item.price,
            quantity: item.quantity,
            // Include selectedVariants for checkout
            ...(item.selectedVariants && { selectedVariants: item.selectedVariants }),
        })),
        totals: cart.totals,
        appliedCoupon: cart.appliedCoupon,
        shippingAddress: cart.shippingAddress,
    };
};

// Cart summary for user dashboard
export const cartSummaryDto = (cart) => {
    return {
        totalItems: cart.totalItems,
        totalUniqueItems: cart.totalUniqueItems,
        subtotal: cart.totals.subtotal,
        total: cart.totals.total,
        hasItems: cart.totalItems > 0,
        updatedAt: cart.updatedAt,
    };
};

// Add to cart response
export const addToCartResponseDto = (success, message, cart = null) => {
    return {
        success,
        message,
        cart: cart ? cartSummaryDto(cart) : null,
    };
};
