import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

/**
 * Stock Management Service
 * Handles all stock-related operations with atomic transactions
 */
class StockService {
    /**
     * Validate stock availability for order items
     * @param {Array} orderItems - Array of order items with product, variantId, quantity
     * @returns {Object} - { success: boolean, errors?: Array, stockInfo?: Array }
     */
    async validateStockAvailability(orderItems) {
        try {
            const errors = [];
            const stockInfo = [];

            for (const item of orderItems) {
                const product = await Product.findById(item.product || item.productId);
                
                if (!product) {
                    errors.push(`Product not found: ${item.product || item.productId}`);
                    continue;
                }

                if (!product.isPublished) {
                    errors.push(`Product "${product.name}" is not available for purchase`);
                    continue;
                }

                let availableStock = 0;
                let stockLocation = 'main';

                // Check variant stock if variantId is provided
                if (item.variantId) {
                    const variant = product.variants.find(v => v.sku === item.variantId);
                    if (!variant) {
                        errors.push(`Variant not found for product "${product.name}"`);
                        continue;
                    }
                    availableStock = variant.stockQuantity;
                    stockLocation = 'variant';
                } else {
                    availableStock = product.stockQuantity;
                }

                // Check if sufficient stock is available
                if (availableStock < item.quantity) {
                    errors.push(
                        `Insufficient stock for "${product.name}"${item.variantId ? ` (${item.variantId})` : ''}. ` +
                        `Available: ${availableStock}, Requested: ${item.quantity}`
                    );
                } else {
                    stockInfo.push({
                        productId: product._id,
                        productName: product.name,
                        variantId: item.variantId || null,
                        quantity: item.quantity,
                        availableStock,
                        stockLocation
                    });
                }
            }

            return {
                success: errors.length === 0,
                errors: errors.length > 0 ? errors : undefined,
                stockInfo: errors.length === 0 ? stockInfo : undefined
            };
        } catch (error) {
            return {
                success: false,
                errors: [`Stock validation failed: ${error.message}`]
            };
        }
    }

    /**
     * Reserve stock for order items (decrease stock)
     * Uses atomic transactions to prevent race conditions
     * @param {Array} orderItems - Array of order items
     * @returns {Object} - { success: boolean, error?: string }
     */
    async reserveStock(orderItems) {
        const session = await mongoose.startSession();
        
        try {
            await session.withTransaction(async () => {
                for (const item of orderItems) {
                    const product = await Product.findById(item.product || item.productId).session(session);
                    
                    if (!product) {
                        throw new Error(`Product not found: ${item.product || item.productId}`);
                    }

                    if (item.variantId) {
                        // Handle variant stock
                        const variant = product.variants.find(v => v.sku === item.variantId);
                        if (!variant) {
                            throw new Error(`Variant not found: ${item.variantId}`);
                        }
                        
                        if (variant.stockQuantity < item.quantity) {
                            throw new Error(
                                `Insufficient stock for "${product.name}" (${item.variantId}). ` +
                                `Available: ${variant.stockQuantity}, Requested: ${item.quantity}`
                            );
                        }
                        
                        variant.stockQuantity -= item.quantity;
                    } else {
                        // Handle main product stock
                        if (product.stockQuantity < item.quantity) {
                            throw new Error(
                                `Insufficient stock for "${product.name}". ` +
                                `Available: ${product.stockQuantity}, Requested: ${item.quantity}`
                            );
                        }
                        
                        product.stockQuantity -= item.quantity;
                    }

                    // Update sales count
                    product.salesCount = (product.salesCount || 0) + item.quantity;
                    
                    await product.save({ session });
                }
            });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        } finally {
            await session.endSession();
        }
    }

    /**
     * Restore stock for order items (increase stock)
     * Used when orders are cancelled or refunded
     * @param {Array} orderItems - Array of order items
     * @returns {Object} - { success: boolean, error?: string }
     */
    async restoreStock(orderItems) {
        const session = await mongoose.startSession();
        
        try {
            await session.withTransaction(async () => {
                for (const item of orderItems) {
                    const product = await Product.findById(item.product || item.productId).session(session);
                    
                    if (!product) {
                        // Log warning but don't fail the transaction for deleted products
                        console.warn(`Product not found during stock restoration: ${item.product || item.productId}`);
                        continue;
                    }

                    if (item.variantId) {
                        // Handle variant stock restoration
                        const variant = product.variants.find(v => v.sku === item.variantId);
                        if (variant) {
                            variant.stockQuantity += item.quantity;
                        } else {
                            console.warn(`Variant not found during stock restoration: ${item.variantId}`);
                        }
                    } else {
                        // Handle main product stock restoration
                        product.stockQuantity += item.quantity;
                    }

                    // Update sales count (decrease)
                    product.salesCount = Math.max(0, (product.salesCount || 0) - item.quantity);
                    
                    await product.save({ session });
                }
            });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        } finally {
            await session.endSession();
        }
    }

    /**
     * Get stock information for a product
     * @param {String} productId - Product ID
     * @param {String} variantId - Optional variant ID
     * @returns {Object} - Stock information
     */
    async getStockInfo(productId, variantId = null) {
        try {
            const product = await Product.findById(productId);
            
            if (!product) {
                return {
                    success: false,
                    error: ERROR_MESSAGES.PRODUCT_NOT_FOUND
                };
            }

            if (variantId) {
                const variant = product.variants.find(v => v.sku === variantId);
                if (!variant) {
                    return {
                        success: false,
                        error: ERROR_MESSAGES.VARIANT_NOT_FOUND
                    };
                }

                return {
                    success: true,
                    data: {
                        productId: product._id,
                        productName: product.name,
                        variantId: variant.sku,
                        variantName: `${variant.name}: ${variant.value}`,
                        stockQuantity: variant.stockQuantity,
                        lowStockThreshold: product.lowStockThreshold,
                        isLowStock: variant.stockQuantity <= product.lowStockThreshold,
                        isOutOfStock: variant.stockQuantity === 0
                    }
                };
            }

            return {
                success: true,
                data: {
                    productId: product._id,
                    productName: product.name,
                    stockQuantity: product.stockQuantity,
                    lowStockThreshold: product.lowStockThreshold,
                    isLowStock: product.stockQuantity <= product.lowStockThreshold,
                    isOutOfStock: product.stockQuantity === 0
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Check if products are low in stock
     * @param {Number} threshold - Optional custom threshold
     * @returns {Array} - Array of low stock products
     */
    async getLowStockProducts(threshold = null) {
        try {
            const products = await Product.find({ isPublished: true });
            const lowStockItems = [];

            for (const product of products) {
                const stockThreshold = threshold || product.lowStockThreshold;
                
                // Check main product stock
                if (product.stockQuantity <= stockThreshold) {
                    lowStockItems.push({
                        productId: product._id,
                        productName: product.name,
                        sku: product.sku,
                        stockQuantity: product.stockQuantity,
                        threshold: stockThreshold,
                        type: 'main'
                    });
                }

                // Check variant stock
                for (const variant of product.variants) {
                    if (variant.stockQuantity <= stockThreshold) {
                        lowStockItems.push({
                            productId: product._id,
                            productName: product.name,
                            sku: product.sku,
                            variantId: variant.sku,
                            variantName: `${variant.name}: ${variant.value}`,
                            stockQuantity: variant.stockQuantity,
                            threshold: stockThreshold,
                            type: 'variant'
                        });
                    }
                }
            }

            return {
                success: true,
                data: lowStockItems
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default new StockService();
