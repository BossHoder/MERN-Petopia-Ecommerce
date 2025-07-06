/**
 * Database utility helpers
 */

/**
 * Build MongoDB aggregation pipeline for pagination
 * @param {Object} options - Pagination options
 * @returns {Array} - Aggregation pipeline
 */
export const buildPaginationPipeline = (options = {}) => {
    const {
        page = 1,
        limit = 20,
        sort = { createdAt: -1 },
        match = {}
    } = options;

    const skip = (page - 1) * limit;

    return [
        { $match: match },
        { $sort: sort },
        {
            $facet: {
                data: [
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [
                    { $count: 'count' }
                ]
            }
        },
        {
            $project: {
                data: 1,
                totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
                page: { $literal: page },
                limit: { $literal: limit },
                totalPages: {
                    $ceil: {
                        $divide: [
                            { $arrayElemAt: ['$totalCount.count', 0] },
                            limit
                        ]
                    }
                }
            }
        }
    ];
};

/**
 * Build search pipeline with text search
 * @param {string} searchTerm - Search term
 * @param {Array} fields - Fields to search in
 * @returns {Object} - Match condition
 */
export const buildSearchPipeline = (searchTerm, fields = ['name', 'description']) => {
    if (!searchTerm) return {};

    const searchRegex = new RegExp(searchTerm, 'i');

    return {
        $or: fields.map(field => ({
            [field]: { $regex: searchRegex }
        }))
    };
};

/**
 * Build filter pipeline for products
 * @param {Object} filters - Filter options
 * @returns {Object} - Match condition
 */
export const buildProductFilters = (filters = {}) => {
    const match = {};

    if (filters.category) {
        match.category = filters.category;
    }

    if (filters.brand) {
        match.brand = new RegExp(filters.brand, 'i');
    }

    if (filters.minPrice || filters.maxPrice) {
        match.price = {};
        if (filters.minPrice) match.price.$gte = parseFloat(filters.minPrice);
        if (filters.maxPrice) match.price.$lte = parseFloat(filters.maxPrice);
    }

    if (filters.inStock === true) {
        match.stockQuantity = { $gt: 0 };
    }

    if (filters.onSale === true) {
        match.salePrice = { $exists: true, $ne: null, $gt: 0 };
    }

    if (filters.isPublished !== undefined) {
        match.isPublished = filters.isPublished;
    }

    return match;
};

/**
 * Generate unique field value
 * @param {Object} Model - Mongoose model
 * @param {string} field - Field name
 * @param {string} baseValue - Base value
 * @param {number} counter - Counter for uniqueness
 * @returns {Promise<string>} - Unique value
 */
export const generateUniqueField = async (Model, field, baseValue, counter = 0) => {
    const value = counter === 0 ? baseValue : `${baseValue}-${counter}`;

    const existing = await Model.findOne({ [field]: value });

    if (existing) {
        return generateUniqueField(Model, field, baseValue, counter + 1);
    }

    return value;
};
