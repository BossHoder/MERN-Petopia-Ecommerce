import Product from '../models/Product.js';
import { productDto, productsDto, productCardDto } from '../dto/productDto.js';
import { createProductSchema, updateProductSchema, productQuerySchema } from '../validations/productValidation.js';
import { productHelper, responseHelper } from '../helpers/productHelper.js';

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
                sort: sortBy = 'createdAt',
                order: sortOrder = 'desc',
                category,
                brand,
                minPrice,
                maxPrice,
                inStock,
                isFeatured,
                search,
                isPublished = true,
            } = value;

            const filter = { isPublished };
            if (category) filter.category = category;
            if (brand) filter.brand = { $regex: brand, $options: 'i' };
            if (inStock !== undefined) filter.stockQuantity = inStock ? { $gt: 0 } : { $eq: 0 };
            if (isFeatured !== undefined) filter.isFeatured = isFeatured;

            //Price Range Filter
            if (minPrice || maxPrice) {
                filter.price = {};
                if (minPrice) filter.price.$gte = minPrice;
                if (maxPrice) filter.price.$lte = maxPrice;
            }

            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { brand: { $regex: search, $options: 'i' } },
                    { tags: { $in: [new RegExp(search, 'i')] } },
                ];
            }

            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            // Pagination
            const skip = (page - 1) * limit;
            // Execute query with population
            const [products, totalProducts] = await Promise.all([
                Product.find(filter)
                    .populate('category', 'name slug')
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
                    brand,
                    minPrice,
                    maxPrice,
                    inStock,
                    isFeatured,
                    search,
                },
            });
        } catch (error) {
            console.error('Error in getAllProducts:', error);
            return responseHelper.serverError(res, 'Failed to fetch products');
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
                .populate('reviews.user', 'name avatar')
                .lean();

            if (!product) {
                return responseHelper.notFound(res, 'Product not found');
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
            return responseHelper.serverError(res, 'Failed to fetch product');
        }
    }

    // Create new product (Admin only)
    async createProduct(req, res, next) {
        try {
            console.log('createProduct called with:', req.body);

            // Validate request body
            const { error, value } = createProductSchema.validate(req.body);
            if (error) {
                return responseHelper.validationError(res, error.details[0].message);
            }

            // Generate slug if not provided
            if (!value.slug) {
                value.slug = productHelper.generateSlug(value.name);
            }

            // Check for duplicate SKU
            const existingSku = await Product.findOne({ sku: value.sku });
            if (existingSku) {
                return responseHelper.badRequest(res, 'SKU already exists');
            }

            // Check for duplicate slug
            const existingSlug = await Product.findOne({ slug: value.slug });
            if (existingSlug) {
                return responseHelper.badRequest(res, 'Slug already exists');
            }

            // Create product
            const product = new Product(value);
            await product.save();

            // Populate and return
            const populatedProduct = await Product.findById(product._id).populate('category', 'name slug').lean();

            return responseHelper.created(res, {
                message: 'Product created successfully',
                product: productDto(populatedProduct),
            });
        } catch (error) {
            console.error('Error in createProduct:', error);
            return responseHelper.serverError(res, 'Failed to create product');
        }
    }

    // Update product (Admin only)
    async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            console.log('updateProduct called with id:', id, 'body:', req.body);

            // Validate request body
            const { error, value } = updateProductSchema.validate(req.body);
            if (error) {
                return responseHelper.validationError(res, error.details[0].message);
            }

            // Check if product exists
            const existingProduct = await Product.findById(id);
            if (!existingProduct) {
                return responseHelper.notFound(res, 'Product not found');
            }

            // Check for duplicate SKU (if updating SKU)
            if (value.sku && value.sku !== existingProduct.sku) {
                const existingSku = await Product.findOne({ sku: value.sku, _id: { $ne: id } });
                if (existingSku) {
                    return responseHelper.badRequest(res, 'SKU already exists');
                }
            }

            // Check for duplicate slug (if updating slug)
            if (value.slug && value.slug !== existingProduct.slug) {
                const existingSlug = await Product.findOne({ slug: value.slug, _id: { $ne: id } });
                if (existingSlug) {
                    return responseHelper.badRequest(res, 'Slug already exists');
                }
            }

            // Update product
            const updatedProduct = await Product.findByIdAndUpdate(id, value, {
                new: true,
                runValidators: true,
            })
                .populate('category', 'name slug')
                .lean();

            return responseHelper.success(res, {
                message: 'Product updated successfully',
                product: productDto(updatedProduct),
            });
        } catch (error) {
            console.error('Error in updateProduct:', error);
            return responseHelper.serverError(res, 'Failed to update product');
        }
    }

    // Delete product (Admin only)
    async deleteProduct(req, res, next) {
        try {
            const { id } = req.params;
            console.log('deleteProduct called with id:', id);

            const product = await Product.findById(id);
            if (!product) {
                return responseHelper.notFound(res, 'Product not found');
            }

            await Product.findByIdAndDelete(id);

            return responseHelper.success(res, {
                message: 'Product deleted successfully',
            });
        } catch (error) {
            console.error('Error in deleteProduct:', error);
            return responseHelper.serverError(res, 'Failed to delete product');
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
            return responseHelper.serverError(res, 'Failed to fetch featured products');
        }
    }

    // Get products by category
    async getProductsByCategory(req, res, next) {
        try {
            const { categorySlug } = req.params;
            const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

            const filter = {
                category: categorySlug,
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
            return responseHelper.serverError(res, 'Failed to fetch products by category');
        }
    }
}

export default new ProductController();
