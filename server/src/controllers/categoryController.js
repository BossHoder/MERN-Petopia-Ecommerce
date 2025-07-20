import Category from '../models/Category.js';
import ParentCategory from '../models/parentCategory.js';
import { responseHelper } from '../helpers/index.js';
import { categoryDto } from '../dto/categoryDto.js';

class CategoryController {
    // Get featured categories (4 categories for homepage)
    async getFeaturedCategories(req, res) {
        try {
            console.log('getFeaturedCategories called');

            // Get specific categories for homepage
            const featuredSlugs = [
                'dry-dog-food',        // Đồ ăn khô cho chó
                'dry-cat-food',        // Đồ ăn khô cho mèo  
                'dog-crates-beds-houses', // Giường chó
                'cat-crates-beds-houses'  // Lồng mèo
            ];

            const categories = await Category.find({
                slug: { $in: featuredSlugs },
                isPublished: true
            })
            .populate('parentCategory', 'name')
            .sort({ sortOrder: 1 })
            .limit(4)
            .lean();

            // If we don't have enough, fill with any published categories
            if (categories.length < 4) {
                const additionalCategories = await Category.find({
                    slug: { $nin: featuredSlugs },
                    isPublished: true
                })
                .populate('parentCategory', 'name')
                .sort({ sortOrder: 1 })
                .limit(4 - categories.length)
                .lean();
                
                categories.push(...additionalCategories);
            }

            return responseHelper.success(res, {
                categories: categories.map(category => categoryDto(category))
            });
        } catch (error) {
            console.error('Error in getFeaturedCategories:', error);
            return responseHelper.serverError(res, 'Failed to fetch featured categories');
        }
    }

    // Get all parent categories
    async getParentCategories(req, res) {
        try {
            console.log('getParentCategories called');

            const parentCategories = await ParentCategory.find({
                isPublished: true
            })
            .sort({ sortOrder: 1 })
            .lean();

            return responseHelper.success(res, {
                parentCategories
            });
        } catch (error) {
            console.error('Error in getParentCategories:', error);
            return responseHelper.serverError(res, 'Failed to fetch parent categories');
        }
    }

    // Get all categories
    async getAllCategories(req, res) {
        try {
            console.log('getAllCategories called');

            const categories = await Category.find({
                isPublished: true
            })
            .populate('parentCategory', 'name')
            .sort({ sortOrder: 1 })
            .lean();

            return responseHelper.success(res, {
                categories: categories.map(category => categoryDto(category))
            });
        } catch (error) {
            console.error('Error in getAllCategories:', error);
            return responseHelper.serverError(res, 'Failed to fetch categories');
        }
    }
}

export default new CategoryController();
