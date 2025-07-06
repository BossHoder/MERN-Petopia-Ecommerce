/**
 * Product Data Transfer Objects
 * Transform database Product model to client-friendly format
 */

export const productDto = (product) => {
    return {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        finalPrice: product.salePrice || product.price, // Computed field
        discount: product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0,
        sku: product.sku,
        category: product.category,
        stockQuantity: product.stockQuantity,
        inStock: product.stockQuantity > 0,
        images: product.images,
        brand: product.brand,
        petSpecifics: product.petSpecifics,
        isPublished: product.isPublished,
        ratings: product.ratings,
        numReviews: product.numReviews,
        reviews: product.reviews,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
    };
};

export const productsDto = (products) => {
    return products.map(product => productDto(product));
};

// Simplified DTO for product cards/listings
export const productCardDto = (product) => {
    return {
        id: product._id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        finalPrice: product.salePrice || product.price,
        discount: product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0,
        sku: product.sku,
        category: product.category,
        images: product.images ? [product.images[0]] : [], // Only first image
        brand: product.brand,
        inStock: product.stockQuantity > 0,
        ratings: product.ratings,
        numReviews: product.numReviews
    };
};

export const productsCardDto = (products) => {
    return products.map(product => productCardDto(product));
};

// DTO for search results
export const productSearchDto = (product) => {
    return {
        id: product._id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        sku: product.sku,
        category: product.category,
        image: product.images ? product.images[0] : null,
        inStock: product.stockQuantity > 0,
        ratings: product.ratings
    };
};
