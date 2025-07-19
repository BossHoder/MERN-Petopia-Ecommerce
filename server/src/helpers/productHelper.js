// ===========================================
// PRODUCT HELPER FUNCTIONS
// ===========================================
// This file contains utility functions for product operations

import Product from '../models/Product.js';
import { successResponse, errorResponse } from './responseHelper.js';

// Generate unique slug from product name
export const generateSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Generate unique SKU
export const generateSKU = async (categoryCode = 'PET', brand = 'PETOPIA') => {
    const prefix = `${categoryCode}-${brand}`.toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
};

// Check if product is in stock
export const checkStock = (product, variantId = null, quantity = 1) => {
    if (variantId) {
        const variant = product.variants.find((v) => v.sku === variantId);
        return variant ? variant.stockQuantity >= quantity : false;
    }
    return product.stockQuantity >= quantity;
};

// Get product price (considering sale price)
export const getProductPrice = (product, variantId = null) => {
    if (variantId) {
        const variant = product.variants.find((v) => v.sku === variantId);
        return variant ? variant.price : product.price;
    }
    return product.salePrice || product.price;
};

// Check if product is on sale
export const isOnSale = (product) => {
    return product.salePrice && product.salePrice < product.price;
};

// Calculate discount percentage
export const calculateDiscount = (originalPrice, salePrice) => {
    if (!salePrice || salePrice >= originalPrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

// Check if product is low stock
export const isLowStock = (product, variantId = null) => {
    if (variantId) {
        const variant = product.variants.find((v) => v.sku === variantId);
        return variant ? variant.stockQuantity <= product.lowStockThreshold : false;
    }
    return product.stockQuantity <= product.lowStockThreshold;
};

// Update product stock after order
export const updateStock = async (productId, variantId = null, quantity) => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        if (variantId) {
            const variant = product.variants.find((v) => v.sku === variantId);
            if (!variant) {
                throw new Error('Variant not found');
            }
            variant.stockQuantity -= quantity;
        } else {
            product.stockQuantity -= quantity;
        }

        await product.save();
        return {
            success: true,
            product,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

// Restock product
export const restockProduct = async (productId, variantId = null, quantity) => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        if (variantId) {
            const variant = product.variants.find((v) => v.sku === variantId);
            if (!variant) {
                throw new Error('Variant not found');
            }
            variant.stockQuantity += quantity;
        } else {
            product.stockQuantity += quantity;
        }

        await product.save();
        return {
            success: true,
            product,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

// Increment view count
export const incrementViewCount = async (productId) => {
    try {
        const product = await Product.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } }, { new: true });
        return product;
    } catch (error) {
        console.error('Error incrementing view count:', error);
        return null;
    }
};

// Increment sales count
export const incrementSalesCount = async (productId, quantity = 1) => {
    try {
        const product = await Product.findByIdAndUpdate(productId, { $inc: { salesCount: quantity } }, { new: true });
        return product;
    } catch (error) {
        console.error('Error incrementing sales count:', error);
        return null;
    }
};

// Get related products (same category, exclude current product)
export const getRelatedProducts = async (productId, categoryId, limit = 4) => {
    try {
        const products = await Product.find({
            _id: { $ne: productId },
            category: categoryId,
            isPublished: true,
            stockQuantity: { $gt: 0 },
        })
            .limit(limit)
            .populate('category', 'name')
            .sort({ salesCount: -1, createdAt: -1 });

        return products;
    } catch (error) {
        console.error('Error getting related products:', error);
        return [];
    }
};

// Get featured products
export const getFeaturedProducts = async (limit = 8) => {
    try {
        const products = await Product.find({
            isFeatured: true,
            isPublished: true,
            stockQuantity: { $gt: 0 },
        })
            .limit(limit)
            .populate('category', 'name')
            .sort({ salesCount: -1, createdAt: -1 });

        return products;
    } catch (error) {
        console.error('Error getting featured products:', error);
        return [];
    }
};

// Get best sellers
export const getBestSellers = async (limit = 8) => {
    try {
        const products = await Product.find({
            isPublished: true,
            stockQuantity: { $gt: 0 },
        })
            .limit(limit)
            .populate('category', 'name')
            .sort({ salesCount: -1, viewCount: -1 });

        return products;
    } catch (error) {
        console.error('Error getting best sellers:', error);
        return [];
    }
};

// Product search with filters
export const searchProducts = async (query, filters = {}, options = {}) => {
    try {
        const { category, brand, minPrice, maxPrice, tags, inStock = true, sortBy = 'relevance' } = filters;

        const { page = 1, limit = 12 } = options;

        // Build search query
        const searchQuery = {
            isPublished: true,
            ...(inStock && { stockQuantity: { $gt: 0 } }),
            ...(category && { category }),
            ...(brand && { brand }),
            ...(tags && { tags: { $in: tags } }),
            ...((minPrice || maxPrice) && {
                $or: [
                    { salePrice: { ...(minPrice && { $gte: minPrice }), ...(maxPrice && { $lte: maxPrice }) } },
                    {
                        salePrice: { $exists: false },
                        price: { ...(minPrice && { $gte: minPrice }), ...(maxPrice && { $lte: maxPrice }) },
                    },
                ],
            }),
        };

        // Add text search if query provided
        if (query) {
            searchQuery.$text = { $search: query };
        }

        // Build sort options
        let sortOptions = {};
        switch (sortBy) {
            case 'price_low':
                sortOptions = { price: 1 };
                break;
            case 'price_high':
                sortOptions = { price: -1 };
                break;
            case 'newest':
                sortOptions = { createdAt: -1 };
                break;
            case 'popular':
                sortOptions = { salesCount: -1, viewCount: -1 };
                break;
            case 'rating':
                sortOptions = { ratings: -1 };
                break;
            default:
                sortOptions = query ? { score: { $meta: 'textScore' } } : { salesCount: -1 };
        }

        const products = await Product.find(searchQuery)
            .populate('category', 'name')
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Product.countDocuments(searchQuery);

        return {
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error('Error searching products:', error);
        return {
            products: [],
            pagination: { page: 1, limit: 12, total: 0, pages: 0 },
        };
    }
};

// Validate product data
export const validateProductData = (productData) => {
    const errors = [];

    if (!productData.name || productData.name.trim().length < 2) {
        errors.push('Product name must be at least 2 characters long');
    }

    if (!productData.price || productData.price <= 0) {
        errors.push('Product price must be greater than 0');
    }

    if (productData.salePrice && productData.salePrice >= productData.price) {
        errors.push('Sale price must be less than regular price');
    }

    if (!productData.category) {
        errors.push('Product category is required');
    }

    if (!productData.images || productData.images.length === 0) {
        errors.push('At least one product image is required');
    }

    if (productData.stockQuantity < 0) {
        errors.push('Stock quantity cannot be negative');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

export const productHelper = {
    // Generate URL-friendly slug from product name
    generateSlug: (name) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    },

    // Calculate discount percentage
    calculateDiscount: (originalPrice, salePrice) => {
        if (!salePrice || salePrice >= originalPrice) return 0;
        return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    },

    // Check if product is in stock
    isInStock: (stockQuantity) => {
        return stockQuantity > 0;
    },

    // Check if product is low stock
    isLowStock: (stockQuantity, threshold = 10) => {
        return stockQuantity <= threshold && stockQuantity > 0;
    },

    formatPrice: (price, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(price);
    },

    //auto generate SKU
    generateSku: (name, category) => {
        const nameCode = name
            .split(' ')
            .slice(0, 2)
            .map((word) => word.substring(0, 3).toUpperCase())
            .join('');

        const categoryCode = category.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().slice(-4);

        return `${categoryCode}-${nameCode}-${timestamp}`;
    },
};

// Response helpers wrapper for easier use
export const responseHelper = {
    success: (res, data, message = 'Success', statusCode = 200) => {
        return successResponse(res, data, message, statusCode);
    },

    created: (res, data, message = 'Created successfully') => {
        return successResponse(res, data, message, 201);
    },

    validationError: (res, message) => {
        return errorResponse(res, message, 400);
    },

    badRequest: (res, message) => {
        return errorResponse(res, message, 400);
    },

    notFound: (res, message) => {
        return errorResponse(res, message, 404);
    },

    serverError: (res, message) => {
        return errorResponse(res, message, 500);
    },
};
