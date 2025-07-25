import Category from '../models/Category.js';
import ParentCategory from '../models/parentCategory.js';
import Product from '../models/Product.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';
import { responseHelper } from '../helpers/index.js';
import { categoryDto } from '../dto/categoryDto.js';

class CategoryController {
    // Get featured categories (4 categories for homepage)
    async getFeaturedCategories(req, res) {
        try {
            console.log('getFeaturedCategories called');

            // Get specific categories for homepage
            const featuredSlugs = [
                'dry-dog-food', // Đồ ăn khô cho chó
                'dry-cat-food', // Đồ ăn khô cho mèo
                'dog-crates-beds-houses', // Giường chó
                'cat-crates-beds-houses', // Lồng mèo
            ];

            const categories = await Category.find({
                slug: { $in: featuredSlugs },
                isPublished: true,
            })
                .populate('parentCategory', 'name')
                .sort({ sortOrder: 1 })
                .limit(4)
                .lean();

            // If we don't have enough, fill with any published categories
            if (categories.length < 4) {
                const additionalCategories = await Category.find({
                    slug: { $nin: featuredSlugs },
                    isPublished: true,
                })
                    .populate('parentCategory', 'name')
                    .sort({ sortOrder: 1 })
                    .limit(4 - categories.length)
                    .lean();

                categories.push(...additionalCategories);
            }

            return responseHelper.success(res, {
                categories: categories.map((category) => categoryDto(category)),
            });
        } catch (error) {
            console.error('Error in getFeaturedCategories:', error);
            return responseHelper.serverError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all parent categories
    async getParentCategories(req, res) {
        try {
            console.log('getParentCategories called');

            const parentCategories = await ParentCategory.find({
                isPublished: true,
            })
                .sort({ sortOrder: 1 })
                .lean();

            // Đếm tổng số sản phẩm cho mỗi parentCategory
            const categories = await Category.find({ isPublished: true }).select('parentCategory productCount').lean();
            const parentWithCount = parentCategories.map((parent) => {
                const total = categories
                    .filter((cat) => String(cat.parentCategory) === String(parent._id))
                    .reduce((sum, cat) => sum + (cat.productCount || 0), 0);
                return { ...parent, productCount: total };
            });

            return responseHelper.success(res, {
                parentCategories: parentWithCount,
            });
        } catch (error) {
            console.error('Error in getParentCategories:', error);
            return responseHelper.serverError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all categories
    async getAllCategories(req, res) {
        try {
            console.log('getAllCategories called');

            const categories = await Category.find({
                isPublished: true,
            })
                .populate('parentCategory', 'name')
                .sort({ sortOrder: 1 })
                .lean();

            return responseHelper.success(res, {
                categories: categories.map((category) => categoryDto(category)),
            });
        } catch (error) {
            console.error('Error in getAllCategories:', error);
            return responseHelper.serverError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all categories with productCount
    async getAllCategoriesWithCount(req, res) {
        try {
            const categories = await Category.find({ isPublished: true })
                .populate('parentCategory', 'name')
                .sort({ sortOrder: 1 })
                .lean();

            // Đếm số sản phẩm cho từng category
            const counts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
            console.log('AGGREGATE CATEGORY COUNTS:', counts);
            console.log(
                'CATEGORIES:',
                categories.map((c) => ({ _id: c._id, name: c.name })),
            );
            const countMap = {};
            counts.forEach((c) => {
                countMap[c._id?.toString()] = c.count;
            });

            const categoriesWithCount = categories.map((cat) => ({
                ...categoryDto(cat),
                _id: cat._id, // Đảm bảo luôn trả về _id
                productCount: countMap[cat._id.toString()] || 0,
            }));
            console.log(
                'CATEGORIES WITH COUNT:',
                categoriesWithCount.map((c) => ({ _id: c._id, name: c.name, productCount: c.productCount })),
            );

            return responseHelper.success(res, {
                categories: categoriesWithCount,
            });
        } catch (error) {
            console.error('Error in getAllCategoriesWithCount:', error);
            return responseHelper.serverError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all parent categories with productCount
    async getParentCategoriesWithCount(req, res) {
        try {
            const parentCategories = await ParentCategory.find({ isPublished: true }).sort({ sortOrder: 1 }).lean();

            // Đếm số sản phẩm cho từng parentCategory
            const counts = await Product.aggregate([{ $group: { _id: '$parentCategory', count: { $sum: 1 } } }]);
            console.log('AGGREGATE PARENT CATEGORY COUNTS:', counts);
            console.log(
                'PARENT CATEGORIES:',
                parentCategories.map((p) => ({ _id: p._id, name: p.name })),
            );
            const countMap = {};
            counts.forEach((c) => {
                countMap[c._id?.toString()] = c.count;
            });

            const parentWithCount = parentCategories.map((parent) => ({
                ...parent,
                productCount: countMap[parent._id.toString()] || 0,
            }));
            console.log(
                'PARENT CATEGORIES WITH COUNT:',
                parentWithCount.map((p) => ({ _id: p._id, name: p.name, productCount: p.productCount })),
            );

            return responseHelper.success(res, {
                parentCategories: parentWithCount,
            });
        } catch (error) {
            console.error('Error in getParentCategoriesWithCount:', error);
            return responseHelper.serverError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }
}

export default new CategoryController();
