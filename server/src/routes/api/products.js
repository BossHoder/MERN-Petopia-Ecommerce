import { Router } from 'express';
import ProductController from '../../controllers/productController.js';
import requireJwtAuth from '../../middleware/requireJwtAuth.js';
import requireAdmin from '../../middleware/requireAdmin.js';
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import ParentCategory from '../../models/parentCategory.js';
import asyncHandler from '../../middleware/asyncHandler.js';

const router = Router();

// ===========================================
// PUBLIC ROUTES
// ===========================================
router.get('/', ProductController.getAllProducts);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/brands', ProductController.getBrands);

// Search suggest API - MUST be before /:id route
router.get(
    '/suggest',
    asyncHandler(async (req, res) => {
        const { keyword } = req.query;
        if (!keyword || keyword.length < 2) {
            return res.json({ data: { suggestions: [] } });
        }
        // Suggest sản phẩm
        const products = await Product.find({
            name: { $regex: keyword, $options: 'i' },
            isPublished: true,
        })
            .limit(5)
            .select('name slug')
            .lean();
        // Suggest category
        const categories = await Category.find({
            name: { $regex: keyword, $options: 'i' },
            isPublished: true,
        })
            .limit(5)
            .select('name slug parentCategory')
            .lean();
        // Suggest parentCategory
        const parentCategories = await ParentCategory.find({
            name: { $regex: keyword, $options: 'i' },
            isPublished: true,
        })
            .limit(5)
            .select('name slug')
            .lean();
        // Gộp kết quả
        const suggestions = [
            ...parentCategories.map((pc) => ({
                id: pc._id,
                label: pc.name,
                slug: pc.slug,
                type: 'parentCategory',
            })),
            ...categories.map((cat) => ({
                id: cat._id,
                label: cat.name,
                slug: cat.slug,
                parentCategory: cat.parentCategory,
                type: 'category',
            })),
            ...products.map((p) => ({
                id: p._id,
                label: p.name,
                slug: p.slug,
                type: 'product',
            })),
        ];
        res.json({ data: { suggestions } });
    }),
);

// These routes must come AFTER /suggest to avoid conflicts
router.get('/category/:categorySlug', ProductController.getProductsByCategory);
router.get('/:id', ProductController.getProductById);
router.post('/:id/reviews', requireJwtAuth, ProductController.createProductReview);

// ===========================================
// ADMIN ROUTES
// ===========================================
router.post('/', requireJwtAuth, requireAdmin, ProductController.createProduct);
router.put('/:id', requireJwtAuth, requireAdmin, ProductController.updateProduct);
router.delete('/:id', requireJwtAuth, requireAdmin, ProductController.deleteProduct);

export default router;
