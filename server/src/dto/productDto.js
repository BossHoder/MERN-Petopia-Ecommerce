/**
 * Product Data Transfer Objects
 * Transform database Product model to client-friendly format
 */

export const productDto = (product) => {
    return {
        id: product._id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        finalPrice: product.salePrice || product.price, // Computed field
        discount: product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0,
        sku: product.sku,
        category: product.category,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        inStock: product.stockQuantity > 0,
        lowStock: product.stockQuantity <= product.lowStockThreshold,
        images: product.images,
        brand: product.brand,
        petSpecifics: product.petSpecifics,
        variants: product.variants,
        attributes: product.attributes,
        tags: product.tags,
        isPublished: product.isPublished,
        isFeatured: product.isFeatured,
        ratings: product.ratings,
        numReviews: product.numReviews,
        reviews: product.reviews,
        viewCount: product.viewCount,
        salesCount: product.salesCount,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
    };
};

export const productsDto = (products) => {
    return products.map((product) => productDto(product));
};

// Simplified DTO for product cards/listings
export const productCardDto = (product) => {
    return {
        id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        salePrice: product.salePrice,
        finalPrice: product.salePrice || product.price,
        discount: product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0,
        sku: product.sku,
        category: product.category,
        images: product.images ? [product.images[0]] : [], // Only first image
        brand: product.brand,
        inStock: product.stockQuantity > 0,
        lowStock: product.stockQuantity <= product.lowStockThreshold,
        isFeatured: product.isFeatured,
        ratings: product.ratings,
        numReviews: product.numReviews,
        tags: product.tags,
        viewCount: product.viewCount,
        salesCount: product.salesCount,
    };
};

export const productsCardDto = (products) => {
    return products.map((product) => productCardDto(product));
};

// DTO for search results
export const productSearchDto = (product) => {
    return {
        id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        salePrice: product.salePrice,
        sku: product.sku,
        category: product.category,
        image: product.images ? product.images[0] : null,
        inStock: product.stockQuantity > 0,
        ratings: product.ratings,
        tags: product.tags,
        brand: product.brand,
    };
};
