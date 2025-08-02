import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import ParentCategory from '../models/parentCategory.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';
import { productDto, productsDto, productCardDto } from '../dto/productDto.js';
import { createProductSchema, updateProductSchema, productQuerySchema } from '../validations/productValidation.js';
import { productHelper, responseHelper } from '../helpers/productHelper.js';
import {
    generateCombinationKey,
    findVariantCombination,
    getAvailableAttributeValues,
    calculateTotalStock,
    getEffectivePrice,
    isProductInStock,
} from '../utils/variantUtils.js';

class ProductController {
    async getAllProducts(req, res) {
        try {
            console.log('getAllProducts called with query:', req.query);

            const { error, value } = productQuerySchema.validate(req.query);
            if (error) {
                return responseHelper.validationError(res, error.details[0].message);
            }

            const {
                page = 1,
                limit = 12,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                category,
                parentCategory,
                parentCategoryId, // Keep for backward compatibility
                brand,
                minPrice,
                maxPrice,
                minRating,
                maxRating,
                inStock,
                isFeatured,
                search,
                isPublished = true,
            } = value;

            const filter = { isPublished };

            // Handle category filtering logic
            if (category && (parentCategory || parentCategoryId)) {
                // Nếu có cả category và parentCategory, ưu tiên category cụ thể
                // Category có thể là slug hoặc ID
                if (mongoose.Types.ObjectId.isValid(category)) {
                    filter.category = category; // ID
                } else {
                    // Tìm category bằng slug
                    const categoryDoc = await Category.findOne({ slug: category }).select('_id');
                    if (categoryDoc) {
                        filter.category = categoryDoc._id;
                    }
                }
            } else if (category) {
                // Chỉ có category (slug hoặc ID)
                if (mongoose.Types.ObjectId.isValid(category)) {
                    filter.category = category; // ID
                } else {
                    // Tìm category bằng slug
                    const categoryDoc = await Category.findOne({ slug: category }).select('_id');
                    if (categoryDoc) {
                        filter.category = categoryDoc._id;
                    }
                }
            } else if (parentCategory || parentCategoryId) {
                // Chỉ có parentCategory (slug hoặc ID), lấy tất cả category thuộc parentCategory
                let parentId = parentCategory || parentCategoryId;

                if (mongoose.Types.ObjectId.isValid(parentId)) {
                    // ParentCategory ID
                    const categories = await Category.find({ parentCategory: parentId }).select('_id');
                    filter.category = { $in: categories.map((c) => c._id) };
                } else {
                    // ParentCategory slug
                    const parentCategoryDoc = await ParentCategory.findOne({ slug: parentId }).select('_id');
                    if (parentCategoryDoc) {
                        const categories = await Category.find({ parentCategory: parentCategoryDoc._id }).select('_id');
                        filter.category = { $in: categories.map((c) => c._id) };
                    }
                }
            }
            if (brand) filter.brand = { $regex: brand, $options: 'i' };
            if (inStock !== undefined) filter.stockQuantity = inStock ? { $gt: 0 } : { $eq: 0 };
            if (isFeatured !== undefined) filter.isFeatured = isFeatured;

            //Price Range Filter
            if (minPrice || maxPrice) {
                filter.price = {};
                if (minPrice) filter.price.$gte = minPrice;
                if (maxPrice) filter.price.$lte = maxPrice;
            }

            // Rating Range Filter
            if (minRating || maxRating) {
                filter.ratings = {};
                if (minRating) filter.ratings.$gte = minRating;
                if (maxRating) filter.ratings.$lte = maxRating;
            }

            if (search) {
                // Tìm category và parentCategory match keyword
                const categories = await Category.find({ name: { $regex: search, $options: 'i' } }).select('_id');
                const parentCategories = await ParentCategory.find({ name: { $regex: search, $options: 'i' } }).select(
                    '_id',
                );
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { brand: { $regex: search, $options: 'i' } },
                    { tags: { $in: [new RegExp(search, 'i')] } },
                    { category: { $in: categories.map((c) => c._id) } },
                    { parentCategory: { $in: parentCategories.map((pc) => pc._id) } },
                ];
            }

            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            // Pagination
            const skip = (page - 1) * limit;
            // Execute query with population
            const [products, totalProducts] = await Promise.all([
                Product.find(filter)
                    .populate({
                        path: 'category',
                        select: 'name slug parentCategory',
                        populate: { path: 'parentCategory', select: 'name slug' },
                    })
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Product.countDocuments(filter),
            ]);
            // Calculate pagination metadata
            const totalPages = Math.ceil(totalProducts / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;
            return responseHelper.success(res, {
                products: productsDto(products),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalProducts,
                    limit,
                    hasNextPage,
                    hasPrevPage,
                },
                filters: {
                    category,
                    parentCategoryId,
                    brand,
                    minPrice,
                    maxPrice,
                    minRating,
                    maxRating,
                    inStock,
                    isFeatured,
                    search,
                },
            });
        } catch (error) {
            console.error('Error in getAllProducts:', error);
            return responseHelper.serverError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    // Get single product by ID or slug
    async getProductById(req, res, next) {
        try {
            const { id } = req.params;
            console.log('getProductById called with id:', id);

            // Find by ObjectId or slug
            const product = await Product.findOne({
                $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { slug: id }],
                isPublished: true,
            })
                .populate('category', 'name slug')
                .lean();

            if (!product) {
                return responseHelper.notFound(res, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
            }

            // Increment view count (fire and forget)
            Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } }).exec();

            // Get related products
            const relatedProducts = await Product.find({
                _id: { $ne: product._id },
                category: product.category,
                isPublished: true,
            })
                .populate('category', 'name slug')
                .limit(4)
                .lean();

            return responseHelper.success(res, {
                product: productDto(product),
                relatedProducts: productsDto(relatedProducts),
            });
        } catch (error) {
            console.error('Error in getProductById:', error);
            return responseHelper.serverError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    // Get product by slug specifically
    async getProductBySlug(req, res, next) {
        try {
            const { slug } = req.params;
            console.log('getProductBySlug called with slug:', slug);

            // Find by slug only
            const product = await Product.findOne({
                slug: slug,
                isPublished: true,
            })
                .populate({
                    path: 'category',
                    select: 'name slug parentCategory',
                    populate: { path: 'parentCategory', select: 'name slug' },
                })
                .lean();

            if (!product) {
                return responseHelper.notFound(res, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
            }

            // Get related products (same category, excluding current product)
            const relatedProducts = await Product.find({
                category: product.category._id,
                _id: { $ne: product._id },
                isPublished: true,
            })
                .populate({
                    path: 'category',
                    select: 'name slug parentCategory',
                    populate: { path: 'parentCategory', select: 'name slug' },
                })
                .limit(4)
                .lean();

            return responseHelper.success(res, {
                product: productDto(product),
                relatedProducts: productsDto(relatedProducts),
            });
        } catch (error) {
            console.error('Error in getProductBySlug:', error);
            return responseHelper.serverError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    // Create new product (Admin only)
    async createProduct(req, res, next) {
        try {
            console.log('🔧 createProduct called with:', {
                bodyKeys: Object.keys(req.body),
                hasFiles: !!req.files,
                filesCount: req.files ? Object.keys(req.files).length : 0,
            });

            // Parse JSON strings for variant data
            const requestData = { ...req.body };

            if (req.body.variantAttributes) {
                try {
                    requestData.variantAttributes = JSON.parse(req.body.variantAttributes);
                    console.log('📊 Enhanced variant attributes received:', requestData.variantAttributes);
                } catch (e) {
                    console.log('❌ Error parsing variantAttributes:', e.message);
                    return responseHelper.badRequest(res, 'Invalid variantAttributes format');
                }
            }

            if (req.body.variantCombinations) {
                try {
                    requestData.variantCombinations = JSON.parse(req.body.variantCombinations);
                    console.log('🔗 Enhanced variant combinations received:', requestData.variantCombinations);
                } catch (e) {
                    console.log('❌ Error parsing variantCombinations:', e.message);
                    return responseHelper.badRequest(res, 'Invalid variantCombinations format');
                }
            }

            if (req.body.variants) {
                try {
                    requestData.variants = JSON.parse(req.body.variants);
                    console.log('🔄 Legacy variants received:', requestData.variants);
                } catch (e) {
                    console.log('❌ Error parsing variants:', e.message);
                    return responseHelper.badRequest(res, 'Invalid variants format');
                }
            }

            // Parse other JSON fields
            if (req.body.attributes) {
                try {
                    requestData.attributes = JSON.parse(req.body.attributes);
                } catch (e) {
                    console.log('❌ Error parsing attributes:', e.message);
                }
            }

            if (req.body.existingImages) {
                try {
                    requestData.existingImages = JSON.parse(req.body.existingImages);
                } catch (e) {
                    console.log('❌ Error parsing existingImages:', e.message);
                }
            }

            // Validate request body with parsed data
            const { error, value } = createProductSchema.validate(requestData);
            if (error) {
                console.log('❌ Validation error:', error.details[0].message);
                return responseHelper.validationError(res, error.details[0].message);
            }

            // Generate slug if not provided
            if (!value.slug) {
                value.slug = productHelper.generateSlug(value.name);
            }

            // Check for duplicate SKU
            const existingSku = await Product.findOne({ sku: value.sku });
            if (existingSku) {
                return responseHelper.badRequest(res, ERROR_MESSAGES.SKU_EXISTS);
            }

            // Check for duplicate slug
            const existingSlug = await Product.findOne({ slug: value.slug });
            if (existingSlug) {
                return responseHelper.badRequest(res, ERROR_MESSAGES.SLUG_EXISTS);
            }

            // Create product
            const product = new Product(value);
            await product.save();
            // Cập nhật productCount cho category
            await Category.updateAllProductCounts();

            // Populate and return
            const populatedProduct = await Product.findById(product._id).populate('category', 'name slug').lean();

            return responseHelper.created(res, {
                message: 'Product created successfully',
                product: productDto(populatedProduct),
            });
        } catch (error) {
            console.error('Error in createProduct:', error);
            return responseHelper.serverError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    // Update product (Admin only)
    async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            console.log('🔧 updateProduct called with:', {
                productId: id,
                bodyKeys: Object.keys(req.body),
                hasFiles: !!req.files,
                filesCount: req.files ? Object.keys(req.files).length : 0,
                fileDetails: req.files ? Object.keys(req.files) : [],
            });

            // Parse JSON strings for variant data
            const requestData = { ...req.body };

            if (req.body.variantAttributes) {
                try {
                    requestData.variantAttributes = JSON.parse(req.body.variantAttributes);
                    console.log('📊 Enhanced variant attributes received:', requestData.variantAttributes);
                } catch (e) {
                    console.log('❌ Error parsing variantAttributes:', e.message);
                    return responseHelper.badRequest(res, 'Invalid variantAttributes format');
                }
            }

            if (req.body.variantCombinations) {
                try {
                    requestData.variantCombinations = JSON.parse(req.body.variantCombinations);
                    console.log('🔗 Enhanced variant combinations received:', requestData.variantCombinations);
                } catch (e) {
                    console.log('❌ Error parsing variantCombinations:', e.message);
                    return responseHelper.badRequest(res, 'Invalid variantCombinations format');
                }
            }

            if (req.body.variants) {
                try {
                    requestData.variants = JSON.parse(req.body.variants);
                    console.log('🔄 Legacy variants received:', requestData.variants);
                } catch (e) {
                    console.log('❌ Error parsing variants:', e.message);
                    return responseHelper.badRequest(res, 'Invalid variants format');
                }
            }

            // Parse other JSON fields
            if (req.body.attributes) {
                try {
                    requestData.attributes = JSON.parse(req.body.attributes);
                } catch (e) {
                    console.log('❌ Error parsing attributes:', e.message);
                }
            }

            if (req.body.existingImages) {
                try {
                    requestData.existingImages = JSON.parse(req.body.existingImages);
                } catch (e) {
                    console.log('❌ Error parsing existingImages:', e.message);
                }
            }

            // Validate request body with parsed data
            const { error, value } = updateProductSchema.validate(requestData);
            if (error) {
                console.log('❌ Validation error:', error.details[0].message);
                return responseHelper.validationError(res, error.details[0].message);
            }

            // Check if product exists
            const existingProduct = await Product.findById(id);
            if (!existingProduct) {
                return responseHelper.notFound(res, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
            }

            // Check for duplicate SKU (if updating SKU)
            if (value.sku && value.sku !== existingProduct.sku) {
                const existingSku = await Product.findOne({ sku: value.sku, _id: { $ne: id } });
                if (existingSku) {
                    return responseHelper.badRequest(res, ERROR_MESSAGES.SKU_EXISTS);
                }
            }

            // Check for duplicate slug (if updating slug)
            if (value.slug && value.slug !== existingProduct.slug) {
                const existingSlug = await Product.findOne({ slug: value.slug, _id: { $ne: id } });
                if (existingSlug) {
                    return responseHelper.badRequest(res, ERROR_MESSAGES.SLUG_EXISTS);
                }
            }

            // Update product
            const updatedProduct = await Product.findByIdAndUpdate(id, value, {
                new: true,
                runValidators: true,
            })
                .populate('category', 'name slug')
                .lean();

            // Debug what was actually saved
            console.log('✅ Product updated successfully:', {
                productId: updatedProduct._id,
                hasVariantAttributes: !!(
                    updatedProduct.variantAttributes && updatedProduct.variantAttributes.length > 0
                ),
                variantAttributesCount: updatedProduct.variantAttributes ? updatedProduct.variantAttributes.length : 0,
                hasVariantCombinations: !!(
                    updatedProduct.variantCombinations && updatedProduct.variantCombinations.length > 0
                ),
                variantCombinationsCount: updatedProduct.variantCombinations
                    ? updatedProduct.variantCombinations.length
                    : 0,
                hasLegacyVariants: !!(updatedProduct.variants && updatedProduct.variants.length > 0),
                legacyVariantsCount: updatedProduct.variants ? updatedProduct.variants.length : 0,
            });

            // Cập nhật productCount cho category
            await Category.updateAllProductCounts();

            return responseHelper.success(res, {
                message: 'Product updated successfully',
                product: productDto(updatedProduct),
            });
        } catch (error) {
            console.error('Error in updateProduct:', error);
            return responseHelper.serverError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete product (Admin only)
    async deleteProduct(req, res, next) {
        try {
            const { id } = req.params;
            console.log('deleteProduct called with id:', id);

            const product = await Product.findById(id);
            if (!product) {
                return responseHelper.notFound(res, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
            }

            await Product.findByIdAndDelete(id);
            // Cập nhật productCount cho category
            await Category.updateAllProductCounts();

            return responseHelper.success(res, {
                message: 'Product deleted successfully',
            });
        } catch (error) {
            console.error('Error in deleteProduct:', error);
            return responseHelper.serverError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    // Get featured products
    async getFeaturedProducts(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 8;

            const featuredProducts = await Product.find({
                isFeatured: true,
                isPublished: true,
                stockQuantity: { $gt: 0 },
            })
                .populate('category', 'name slug')
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();

            return responseHelper.success(res, {
                products: productsDto(featuredProducts),
            });
        } catch (error) {
            console.error('Error in getFeaturedProducts:', error);
            return responseHelper.serverError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    // Get products by category
    async getProductsByCategory(req, res, next) {
        try {
            const { categorySlug } = req.params;
            const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

            // Find category by slug first
            const category = await Category.findOne({ slug: categorySlug, isPublished: true });
            if (!category) {
                return responseHelper.notFound(res, ERROR_MESSAGES.CATEGORY_NOT_FOUND);
            }

            const filter = {
                category: category._id, // Use ObjectId instead of slug
                isPublished: true,
            };

            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const skip = (page - 1) * limit;

            const [products, totalProducts] = await Promise.all([
                Product.find(filter)
                    .populate('category', 'name slug')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Product.countDocuments(filter),
            ]);

            const totalPages = Math.ceil(totalProducts / limit);

            return responseHelper.success(res, {
                category: {
                    name: category.name,
                    slug: category.slug,
                    description: category.description,
                },
                products: productsDto(products),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalProducts,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
            });
        } catch (error) {
            console.error('Error in getProductsByCategory:', error);
            return responseHelper.serverError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    // Create a new review for a product
    async createProductReview(req, res, next) {
        const { rating, title, comment } = req.body;
        const { id: productId } = req.params;
        const userId = req.user.id;

        try {
            const product = await Product.findById(productId);
            if (!product) {
                return responseHelper.notFound(res, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
            }

            // Check if user has already reviewed this product
            const alreadyReviewed = await Review.findOne({ product: productId, user: userId });
            if (alreadyReviewed) {
                return responseHelper.badRequest(res, ERROR_MESSAGES.ALREADY_REVIEWED);
            }

            // Check if user has purchased this product
            const userOrders = await mongoose.model('Order').find({ user: userId });
            const hasPurchased = userOrders.some(
                (order) => order.orderItems.some((item) => item.product.toString() === productId) && order.isPaid,
            );

            const review = new Review({
                product: productId,
                user: userId,
                rating,
                title,
                comment,
                verifiedPurchase: hasPurchased,
            });

            await review.save();

            return responseHelper.created(res, {
                message: 'Review added successfully',
                review,
            });
        } catch (error) {
            console.error('Error in createProductReview:', error);
            return responseHelper.serverError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all unique brands
    async getBrands(req, res) {
        try {
            console.log('getBrands called');

            // First check if we have any products
            const productCount = await Product.countDocuments();
            console.log('Total products in database:', productCount);

            const brands = await Product.distinct('brand');
            console.log('Raw brands from database:', brands);

            const filteredBrands = brands.filter((brand) => brand && brand.trim() !== '');
            console.log('Filtered brands:', filteredBrands);

            return responseHelper.success(res, {
                brands: filteredBrands.sort(),
                totalProducts: productCount,
                message: 'Brands retrieved successfully',
            });
        } catch (error) {
            console.error('Error fetching brands:', error);
            return responseHelper.serverError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    // ===========================================
    // VARIANT COMBINATION METHODS
    // ===========================================

    // Get available variant options based on current selections
    async getVariantOptions(req, res) {
        try {
            const { id } = req.params;
            const { selections = {} } = req.query;

            // Parse selections if it's a string
            const currentSelections = typeof selections === 'string' ? JSON.parse(selections) : selections;

            const product = await Product.findOne({
                $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { slug: id }],
                isPublished: true,
            }).lean();

            if (!product) {
                return responseHelper.notFound(res, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
            }

            if (!product.variantAttributes || product.variantAttributes.length === 0) {
                return responseHelper.success(res, {
                    hasVariants: false,
                    availableOptions: {},
                });
            }

            // Get available options for each attribute
            const availableOptions = {};

            product.variantAttributes.forEach((attr) => {
                availableOptions[attr.name] = getAvailableAttributeValues(
                    product.variantAttributes,
                    product.variantCombinations,
                    currentSelections,
                    attr.name,
                );
            });

            return responseHelper.success(res, {
                hasVariants: true,
                variantAttributes: product.variantAttributes,
                availableOptions,
                currentSelections,
            });
        } catch (error) {
            console.error('Error in getVariantOptions:', error);
            return responseHelper.serverError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    // Get specific variant combination details
    async getVariantCombination(req, res) {
        try {
            const { id } = req.params;
            const { attributes } = req.body;

            if (!attributes || Object.keys(attributes).length === 0) {
                return responseHelper.badRequest(res, 'Attribute selections are required');
            }

            const product = await Product.findOne({
                $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { slug: id }],
                isPublished: true,
            }).lean();

            if (!product) {
                return responseHelper.notFound(res, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
            }

            const combination = findVariantCombination(product.variantCombinations, attributes);

            if (!combination) {
                return responseHelper.notFound(res, 'Variant combination not found');
            }

            const effectivePrice = getEffectivePrice(product, combination);
            const inStock = combination.isActive && combination.stockQuantity > 0;

            return responseHelper.success(res, {
                combination,
                effectivePrice,
                inStock,
                stockQuantity: combination.stockQuantity,
                isLowStock: combination.stockQuantity <= combination.lowStockThreshold,
            });
        } catch (error) {
            console.error('Error in getVariantCombination:', error);
            return responseHelper.serverError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    // Validate variant selections for add to cart
    async validateVariantSelections(req, res) {
        try {
            const { id } = req.params;
            const { attributes, quantity = 1 } = req.body;

            const product = await Product.findOne({
                $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { slug: id }],
                isPublished: true,
            }).lean();

            if (!product) {
                return responseHelper.notFound(res, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
            }

            // Check if product has variants
            if (product.variantAttributes && product.variantAttributes.length > 0) {
                // Validate all required attributes are selected
                const requiredAttributes = product.variantAttributes.filter((attr) => attr.isRequired);
                const missingAttributes = requiredAttributes.filter((attr) => !attributes[attr.name]);

                if (missingAttributes.length > 0) {
                    return responseHelper.badRequest(res, {
                        message: 'Missing required variant selections',
                        missingAttributes: missingAttributes.map((attr) => ({
                            name: attr.name,
                            displayName: attr.displayName,
                        })),
                    });
                }

                // Find the specific combination
                const combination = findVariantCombination(product.variantCombinations, attributes);

                if (!combination) {
                    return responseHelper.badRequest(res, 'Invalid variant combination');
                }

                if (!combination.isActive) {
                    return responseHelper.badRequest(res, 'This variant is not available');
                }

                if (combination.stockQuantity < quantity) {
                    return responseHelper.badRequest(res, {
                        message: 'Not enough stock available',
                        availableStock: combination.stockQuantity,
                        requestedQuantity: quantity,
                    });
                }

                return responseHelper.success(res, {
                    isValid: true,
                    combination,
                    effectivePrice: getEffectivePrice(product, combination),
                    availableStock: combination.stockQuantity,
                });
            } else {
                // Product without variants
                if (product.stockQuantity < quantity) {
                    return responseHelper.badRequest(res, {
                        message: 'Not enough stock available',
                        availableStock: product.stockQuantity,
                        requestedQuantity: quantity,
                    });
                }

                return responseHelper.success(res, {
                    isValid: true,
                    combination: null,
                    effectivePrice: product.salePrice || product.price,
                    availableStock: product.stockQuantity,
                });
            }
        } catch (error) {
            console.error('Error in validateVariantSelections:', error);
            return responseHelper.serverError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }
}

export default new ProductController();
