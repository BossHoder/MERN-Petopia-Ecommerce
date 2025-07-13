// ===========================================
// PRODUCT SERVICE CLASS
// ===========================================
// This service handles all product-related business logic

import Product from '../models/Product.js';
import * as productHelper from '../helpers/productHelper.js';
import { productDto, productCardDto, productSearchDto } from '../dto/productDto.js';

class ProductService {
    // Create new product
    async createProduct(productData) {
        try {
            // Validate product data
            const validation = productHelper.validateProductData(productData);
            if (!validation.isValid) {
                return {
                    success: false,
                    errors: validation.errors,
                };
            }

            // Generate slug and SKU if not provided
            if (!productData.slug) {
                productData.slug = productHelper.generateSlug(productData.name);
            }

            if (!productData.sku) {
                productData.sku = await productHelper.generateSKU();
            }

            const product = new Product(productData);
            await product.save();

            return {
                success: true,
                product: productDto(product),
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get product by ID or slug
    async getProduct(identifier, incrementView = false) {
        try {
            const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
            const product = isObjectId
                ? await Product.findById(identifier).populate('category', 'name parentCategory')
                : await Product.findOne({ slug: identifier }).populate('category', 'name parentCategory');

            if (!product) {
                return {
                    success: false,
                    error: 'Product not found',
                };
            }

            // Increment view count if requested
            if (incrementView) {
                await productHelper.incrementViewCount(product._id);
                product.viewCount += 1;
            }

            return {
                success: true,
                product: productDto(product),
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Update product
    async updateProduct(productId, updateData) {
        try {
            // If name is being updated, regenerate slug
            if (updateData.name) {
                updateData.slug = productHelper.generateSlug(updateData.name);
            }

            const product = await Product.findByIdAndUpdate(productId, updateData, {
                new: true,
                runValidators: true,
            }).populate('category', 'name parentCategory');

            if (!product) {
                return {
                    success: false,
                    error: 'Product not found',
                };
            }

            return {
                success: true,
                product: productDto(product),
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Delete product
    async deleteProduct(productId) {
        try {
            const product = await Product.findByIdAndDelete(productId);
            if (!product) {
                return {
                    success: false,
                    error: 'Product not found',
                };
            }

            return {
                success: true,
                message: 'Product deleted successfully',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get all products with filtering and pagination
    async getProducts(filters = {}, options = {}) {
        try {
            const {
                page = 1,
                limit = 12,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                includeUnpublished = false,
            } = options;

            const { category, brand, minPrice, maxPrice, tags, isFeatured, inStock = true } = filters;

            // Build query
            const query = {
                ...(includeUnpublished ? {} : { isPublished: true }),
                ...(inStock && { stockQuantity: { $gt: 0 } }),
                ...(category && { category }),
                ...(brand && { brand }),
                ...(tags && { tags: { $in: tags } }),
                ...(isFeatured !== undefined && { isFeatured }),
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

            const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            const products = await Product.find(query)
                .populate('category', 'name parentCategory')
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(limit);

            const total = await Product.countDocuments(query);

            return {
                success: true,
                products: products.map((product) => productCardDto(product)),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Search products
    async searchProducts(query, filters = {}, options = {}) {
        try {
            const result = await productHelper.searchProducts(query, filters, options);

            return {
                success: true,
                products: result.products.map((product) => productSearchDto(product)),
                pagination: result.pagination,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get featured products
    async getFeaturedProducts(limit = 8) {
        try {
            const products = await productHelper.getFeaturedProducts(limit);

            return {
                success: true,
                products: products.map((product) => productCardDto(product)),
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get best sellers
    async getBestSellers(limit = 8) {
        try {
            const products = await productHelper.getBestSellers(limit);

            return {
                success: true,
                products: products.map((product) => productCardDto(product)),
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get related products
    async getRelatedProducts(productId, limit = 4) {
        try {
            const product = await Product.findById(productId);
            if (!product) {
                return {
                    success: false,
                    error: 'Product not found',
                };
            }

            const products = await productHelper.getRelatedProducts(productId, product.category, limit);

            return {
                success: true,
                products: products.map((product) => productCardDto(product)),
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Update stock
    async updateStock(productId, variantId = null, quantity, operation = 'subtract') {
        try {
            const method = operation === 'add' ? productHelper.restockProduct : productHelper.updateStock;
            const result = await method(productId, variantId, Math.abs(quantity));

            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Bulk update products
    async bulkUpdateProducts(updates) {
        try {
            const results = [];

            for (const update of updates) {
                const result = await this.updateProduct(update.id, update.data);
                results.push(result);
            }

            const successful = results.filter((r) => r.success).length;
            const failed = results.filter((r) => !r.success).length;

            return {
                success: true,
                message: `Updated ${successful} products, ${failed} failed`,
                results,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get low stock products
    async getLowStockProducts() {
        try {
            const products = await Product.find({
                isPublished: true,
                $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
            }).populate('category', 'name');

            return {
                success: true,
                products: products.map((product) => productCardDto(product)),
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get product analytics
    async getProductAnalytics(productId) {
        try {
            const product = await Product.findById(productId);
            if (!product) {
                return {
                    success: false,
                    error: 'Product not found',
                };
            }

            // Get basic stats
            const analytics = {
                viewCount: product.viewCount,
                salesCount: product.salesCount,
                stockQuantity: product.stockQuantity,
                lowStock: productHelper.isLowStock(product),
                onSale: productHelper.isOnSale(product),
                discount: productHelper.calculateDiscount(product.price, product.salePrice),
                finalPrice: productHelper.getProductPrice(product),
                revenue: product.salesCount * productHelper.getProductPrice(product),
            };

            return {
                success: true,
                analytics,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
}

export default new ProductService();
