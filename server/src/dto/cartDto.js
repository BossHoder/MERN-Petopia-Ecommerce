/**
 * Cart Data Transfer Objects
 */

export const cartItemDto = (item, productDetails = null) => {
    return {
        productId: item.productId,
        quantity: item.quantity,
        addedAt: item.addedAt,
        // Include product details if populated
        ...(productDetails && {
            product: {
                name: productDetails.name,
                price: productDetails.price,
                salePrice: productDetails.salePrice,
                finalPrice: productDetails.salePrice || productDetails.price,
                image: productDetails.images ? productDetails.images[0] : null,
                inStock: productDetails.stockQuantity > 0,
                maxQuantity: productDetails.stockQuantity
            }
        })
    };
};

export const cartDto = (cart, populatedProducts = []) => {
    const itemsWithProducts = cart.items.map(item => {
        const productDetails = populatedProducts.find(p => p.sku === item.productId);
        return cartItemDto(item, productDetails);
    });

    // Calculate totals
    const subtotal = itemsWithProducts.reduce((total, item) => {
        if (item.product) {
            return total + (item.product.finalPrice * item.quantity);
        }
        return total;
    }, 0);

    const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);

    return {
        id: cart._id,
        username: cart.username,
        items: itemsWithProducts,
        totalItems,
        totalUniqueItems: cart.items.length,
        subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
        updatedAt: cart.updatedAt
    };
};
