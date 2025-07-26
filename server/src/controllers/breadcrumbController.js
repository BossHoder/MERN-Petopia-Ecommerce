import Product from '../models/Product.js';
import Category from '../models/Category.js';
import ParentCategory from '../models/parentCategory.js';
import { successResponse, errorResponse } from '../helpers/responseHelper.js';
import { generateBreadcrumb } from '../helpers/stringHelper.js';

/**
 * Breadcrumb Controller
 * Provides hierarchical navigation data for frontend breadcrumb components
 */
class BreadcrumbController {
    /**
     * Get breadcrumb data for a specific product
     * @route GET /api/breadcrumb/product/:id
     * @access Public
     */
    async getProductBreadcrumb(req, res) {
        try {
            const { id } = req.params;

            // Find product with populated category and parent category
            const product = await Product.findById(id)
                .populate({
                    path: 'category',
                    populate: {
                        path: 'parentCategory',
                        model: 'ParentCategory',
                    },
                })
                .lean();

            if (!product) {
                return errorResponse(res, 'Product not found', 404);
            }

            const breadcrumbItems = [];

            // Add home
            breadcrumbItems.push({
                name: 'Home',
                slug: '',
                path: '/',
                current: false,
            });

            // Add products
            breadcrumbItems.push({
                name: 'Products',
                slug: 'products',
                path: '/products',
                current: false,
            });

            // Add parent category if available
            if (product.category && product.category.parentCategory) {
                const parentCategory = product.category.parentCategory;
                breadcrumbItems.push({
                    name: parentCategory.name,
                    slug: parentCategory.slug,
                    path: `/category/${parentCategory.slug}`,
                    current: false,
                });

                // Add category
                breadcrumbItems.push({
                    name: product.category.name,
                    slug: product.category.slug,
                    path: `/category/${parentCategory.slug}/${product.category.slug}`,
                    current: false,
                });
            }

            // Add product (current page)
            breadcrumbItems.push({
                name: product.name,
                slug: product.slug,
                path: `/product/${product._id}`,
                current: true,
            });

            return successResponse(res, {
                breadcrumb: breadcrumbItems,
                product: {
                    id: product._id,
                    name: product.name,
                    slug: product.slug,
                },
            });
        } catch (error) {
            console.error('Error in getProductBreadcrumb:', error);
            return errorResponse(res, 'Failed to generate product breadcrumb', 500);
        }
    }

    /**
     * Get breadcrumb data for a specific category
     * @route GET /api/breadcrumb/category/:slug
     * @access Public
     */
    async getCategoryBreadcrumb(req, res) {
        try {
            const { slug } = req.params;
            const { parent } = req.query; // Optional parent slug for subcategories

            const breadcrumbItems = [];

            // Add home
            breadcrumbItems.push({
                name: 'Home',
                slug: '',
                path: '/',
                current: false,
            });

            if (parent) {
                // This is a subcategory page
                const parentCategory = await ParentCategory.findOne({ slug: parent }).lean();
                const category = await Category.findOne({ slug }).populate('parentCategory').lean();

                if (!parentCategory || !category) {
                    return errorResponse(res, 'Category not found', 404);
                }

                // Verify that the category belongs to the parent
                if (String(category.parentCategory._id) !== String(parentCategory._id)) {
                    return errorResponse(res, 'Invalid category hierarchy', 400);
                }

                // Add parent category
                breadcrumbItems.push({
                    name: parentCategory.name,
                    slug: parentCategory.slug,
                    path: `/category/${parentCategory.slug}`,
                    current: false,
                });

                // Add current category
                breadcrumbItems.push({
                    name: category.name,
                    slug: category.slug,
                    path: `/category/${parent}/${category.slug}`,
                    current: true,
                });

                return successResponse(res, {
                    breadcrumb: breadcrumbItems,
                    category: {
                        id: category._id,
                        name: category.name,
                        slug: category.slug,
                        parentCategory: {
                            id: parentCategory._id,
                            name: parentCategory.name,
                            slug: parentCategory.slug,
                        },
                    },
                });
            } else {
                // This is a parent category page
                const parentCategory = await ParentCategory.findOne({ slug }).lean();

                if (!parentCategory) {
                    return errorResponse(res, 'Category not found', 404);
                }

                // Add current parent category
                breadcrumbItems.push({
                    name: parentCategory.name,
                    slug: parentCategory.slug,
                    path: `/category/${parentCategory.slug}`,
                    current: true,
                });

                return successResponse(res, {
                    breadcrumb: breadcrumbItems,
                    parentCategory: {
                        id: parentCategory._id,
                        name: parentCategory.name,
                        slug: parentCategory.slug,
                    },
                });
            }
        } catch (error) {
            console.error('Error in getCategoryBreadcrumb:', error);
            return errorResponse(res, 'Failed to generate category breadcrumb', 500);
        }
    }

    /**
     * Get breadcrumb data for products by category
     * @route GET /api/breadcrumb/products/category/:slug
     * @access Public
     */
    async getProductsCategoryBreadcrumb(req, res) {
        try {
            const { slug } = req.params;

            // Try to find as category first, then as parent category
            let category = await Category.findOne({ slug }).populate('parentCategory').lean();
            let parentCategory = null;

            if (!category) {
                // Try as parent category
                parentCategory = await ParentCategory.findOne({ slug }).lean();
                if (!parentCategory) {
                    return errorResponse(res, 'Category not found', 404);
                }
            }

            const breadcrumbItems = [];

            // Add home
            breadcrumbItems.push({
                name: 'Home',
                slug: '',
                path: '/',
                current: false,
            });

            // Add products
            breadcrumbItems.push({
                name: 'Products',
                slug: 'products',
                path: '/products',
                current: false,
            });

            if (category) {
                // Category-specific products
                if (category.parentCategory) {
                    breadcrumbItems.push({
                        name: category.parentCategory.name,
                        slug: category.parentCategory.slug,
                        path: `/category/${category.parentCategory.slug}`,
                        current: false,
                    });
                }

                breadcrumbItems.push({
                    name: category.name,
                    slug: category.slug,
                    path: `/category/${category.parentCategory?.slug}/${category.slug}`,
                    current: true,
                });
            } else if (parentCategory) {
                // Parent category products
                breadcrumbItems.push({
                    name: parentCategory.name,
                    slug: parentCategory.slug,
                    path: `/category/${parentCategory.slug}`,
                    current: true,
                });
            }

            return successResponse(res, {
                breadcrumb: breadcrumbItems,
                category: category || null,
                parentCategory: parentCategory || category?.parentCategory || null,
            });
        } catch (error) {
            console.error('Error in getProductsCategoryBreadcrumb:', error);
            return errorResponse(res, 'Failed to generate products category breadcrumb', 500);
        }
    }

    /**
     * Generate custom breadcrumb for any path
     * @route POST /api/breadcrumb/custom
     * @access Public
     */
    async generateCustomBreadcrumb(req, res) {
        try {
            const { path, items } = req.body;

            if (!path && !items) {
                return errorResponse(res, 'Path or items required', 400);
            }

            let breadcrumbItems = [];

            if (items && Array.isArray(items)) {
                // Use provided items
                breadcrumbItems = items;
            } else if (path) {
                // Generate from path
                const segments = path.split('/').filter(Boolean);

                // Always start with home
                breadcrumbItems.push({
                    name: 'Home',
                    slug: '',
                    path: '/',
                    current: false,
                });

                // Add segments
                segments.forEach((segment, index) => {
                    const isLast = index === segments.length - 1;
                    const segmentPath = '/' + segments.slice(0, index + 1).join('/');

                    breadcrumbItems.push({
                        name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
                        slug: segment,
                        path: segmentPath,
                        current: isLast,
                    });
                });
            }

            return successResponse(res, {
                breadcrumb: breadcrumbItems,
                path: path || null,
            });
        } catch (error) {
            console.error('Error in generateCustomBreadcrumb:', error);
            return errorResponse(res, 'Failed to generate custom breadcrumb', 500);
        }
    }
}

export default new BreadcrumbController();
