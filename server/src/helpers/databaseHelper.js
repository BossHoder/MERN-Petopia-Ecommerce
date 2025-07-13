/**
 * Database utility helpers
 */

/**
 * Build MongoDB aggregation pipeline for pagination
 * @param {Object} options - Pagination options
 * @returns {Array} - Aggregation pipeline
 */
export const buildPaginationPipeline = (options = {}) => {
    const { page = 1, limit = 20, sort = { createdAt: -1 }, match = {} } = options;

    const skip = (page - 1) * limit;

    return [
        { $match: match },
        { $sort: sort },
        {
            $facet: {
                data: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: 'count' }],
            },
        },
        {
            $project: {
                data: 1,
                totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
                page: { $literal: page },
                limit: { $literal: limit },
                totalPages: {
                    $ceil: {
                        $divide: [{ $arrayElemAt: ['$totalCount.count', 0] }, limit],
                    },
                },
            },
        },
    ];
};

/**
 * Build search aggregation pipeline
 * @param {Object} options - Search options
 * @returns {Array} - Aggregation pipeline
 */
export const buildSearchPipeline = (options = {}) => {
    const {
        searchTerm,
        searchFields = ['name', 'description'],
        filters = {},
        page = 1,
        limit = 20,
        sort = { createdAt: -1 },
    } = options;

    const pipeline = [];

    // Text search stage
    if (searchTerm) {
        pipeline.push({
            $match: {
                $or: searchFields.map((field) => ({
                    [field]: { $regex: searchTerm, $options: 'i' },
                })),
            },
        });
    }

    // Filter stage
    if (Object.keys(filters).length > 0) {
        pipeline.push({ $match: filters });
    }

    // Add pagination using facet
    pipeline.push({
        $facet: {
            data: [{ $sort: sort }, { $skip: (page - 1) * limit }, { $limit: limit }],
            totalCount: [{ $count: 'count' }],
        },
    });

    // Project final result
    pipeline.push({
        $project: {
            data: 1,
            totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
            page: { $literal: page },
            limit: { $literal: limit },
            totalPages: {
                $ceil: {
                    $divide: [{ $arrayElemAt: ['$totalCount.count', 0] }, limit],
                },
            },
        },
    });

    return pipeline;
};

/**
 * Build analytics aggregation pipeline
 * @param {Object} options - Analytics options
 * @returns {Array} - Aggregation pipeline
 */
export const buildAnalyticsPipeline = (options = {}) => {
    const {
        dateRange,
        groupBy = 'day',
        metrics = ['count', 'sum'],
        field = 'createdAt',
        valueField = 'total',
    } = options;

    const pipeline = [];

    // Date range filter
    if (dateRange && dateRange.start && dateRange.end) {
        pipeline.push({
            $match: {
                [field]: {
                    $gte: new Date(dateRange.start),
                    $lte: new Date(dateRange.end),
                },
            },
        });
    }

    // Group by time period
    const dateFormats = {
        day: '%Y-%m-%d',
        month: '%Y-%m',
        year: '%Y',
    };

    const groupStage = {
        $group: {
            _id: { $dateToString: { format: dateFormats[groupBy], date: `$${field}` } },
        },
    };

    // Add metrics
    if (metrics.includes('count')) {
        groupStage.$group.count = { $sum: 1 };
    }
    if (metrics.includes('sum') && valueField) {
        groupStage.$group.sum = { $sum: `$${valueField}` };
    }
    if (metrics.includes('avg') && valueField) {
        groupStage.$group.avg = { $avg: `$${valueField}` };
    }

    pipeline.push(groupStage);

    // Sort by date
    pipeline.push({ $sort: { _id: 1 } });

    return pipeline;
};

/**
 * Build price range aggregation
 * @param {Object} options - Price range options
 * @returns {Array} - Aggregation pipeline
 */
export const buildPriceRangeAggregation = (options = {}) => {
    const {
        priceField = 'price',
        ranges = [
            { min: 0, max: 100000 },
            { min: 100000, max: 500000 },
            { min: 500000, max: 1000000 },
            { min: 1000000, max: Number.MAX_SAFE_INTEGER },
        ],
    } = options;

    return [
        {
            $bucket: {
                groupBy: `$${priceField}`,
                boundaries: ranges.map((r) => r.min).concat([Number.MAX_SAFE_INTEGER]),
                default: 'other',
                output: {
                    count: { $sum: 1 },
                    minPrice: { $min: `$${priceField}` },
                    maxPrice: { $max: `$${priceField}` },
                    avgPrice: { $avg: `$${priceField}` },
                },
            },
        },
    ];
};

/**
 * Build category aggregation
 * @param {Object} options - Category options
 * @returns {Array} - Aggregation pipeline
 */
export const buildCategoryAggregation = (options = {}) => {
    const { categoryField = 'category', includeSubcategories = false } = options;

    const pipeline = [
        {
            $group: {
                _id: `$${categoryField}`,
                count: { $sum: 1 },
                products: { $push: '$$ROOT' },
            },
        },
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'categoryInfo',
            },
        },
        {
            $unwind: '$categoryInfo',
        },
        {
            $project: {
                _id: 1,
                count: 1,
                name: '$categoryInfo.name',
                slug: '$categoryInfo.slug',
                products: { $slice: ['$products', 5] }, // Limit to 5 sample products
            },
        },
        {
            $sort: { count: -1 },
        },
    ];

    return pipeline;
};

/**
 * Build inventory aggregation
 * @param {Object} options - Inventory options
 * @returns {Array} - Aggregation pipeline
 */
export const buildInventoryAggregation = (options = {}) => {
    const { lowStockThreshold = 10, includeOutOfStock = true } = options;

    const pipeline = [
        {
            $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                totalStock: { $sum: '$stockQuantity' },
                lowStockProducts: {
                    $sum: {
                        $cond: [{ $lte: ['$stockQuantity', lowStockThreshold] }, 1, 0],
                    },
                },
                outOfStockProducts: {
                    $sum: {
                        $cond: [{ $eq: ['$stockQuantity', 0] }, 1, 0],
                    },
                },
                averageStock: { $avg: '$stockQuantity' },
                categories: { $addToSet: '$category' },
            },
        },
        {
            $project: {
                _id: 0,
                totalProducts: 1,
                totalStock: 1,
                lowStockProducts: 1,
                outOfStockProducts: 1,
                averageStock: { $round: ['$averageStock', 2] },
                inStockProducts: { $subtract: ['$totalProducts', '$outOfStockProducts'] },
                stockHealthPercentage: {
                    $round: [
                        {
                            $multiply: [
                                {
                                    $divide: [{ $subtract: ['$totalProducts', '$lowStockProducts'] }, '$totalProducts'],
                                },
                                100,
                            ],
                        },
                        2,
                    ],
                },
            },
        },
    ];

    return pipeline;
};

/**
 * Build user activity aggregation
 * @param {Object} options - User activity options
 * @returns {Array} - Aggregation pipeline
 */
export const buildUserActivityAggregation = (options = {}) => {
    const { dateRange, groupBy = 'day' } = options;

    const pipeline = [];

    // Date range filter
    if (dateRange && dateRange.start && dateRange.end) {
        pipeline.push({
            $match: {
                lastLogin: {
                    $gte: new Date(dateRange.start),
                    $lte: new Date(dateRange.end),
                },
            },
        });
    }

    // Group by time period
    const dateFormats = {
        day: '%Y-%m-%d',
        month: '%Y-%m',
        year: '%Y',
    };

    pipeline.push({
        $group: {
            _id: { $dateToString: { format: dateFormats[groupBy], date: '$lastLogin' } },
            activeUsers: { $sum: 1 },
            newUsers: {
                $sum: {
                    $cond: [
                        { $eq: [{ $dateToString: { format: dateFormats[groupBy], date: '$createdAt' } }, '$_id'] },
                        1,
                        0,
                    ],
                },
            },
        },
    });

    pipeline.push({ $sort: { _id: 1 } });

    return pipeline;
};

/**
 * Execute aggregation with error handling
 * @param {Object} Model - Mongoose model
 * @param {Array} pipeline - Aggregation pipeline
 * @returns {Promise<Object>} - Aggregation result
 */
export const executeAggregation = async (Model, pipeline) => {
    try {
        const result = await Model.aggregate(pipeline);
        return {
            success: true,
            data: result,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            data: null,
        };
    }
};

/**
 * Build text search query
 * @param {string} searchTerm - Search term
 * @param {Array} fields - Fields to search in
 * @returns {Object} - MongoDB query
 */
export const buildTextSearchQuery = (searchTerm, fields = ['name', 'description']) => {
    if (!searchTerm) return {};

    const searchRegex = new RegExp(searchTerm, 'i');
    return {
        $or: fields.map((field) => ({
            [field]: searchRegex,
        })),
    };
};

/**
 * Build date range query
 * @param {Object} dateRange - Date range options
 * @param {string} field - Date field name
 * @returns {Object} - MongoDB query
 */
export const buildDateRangeQuery = (dateRange, field = 'createdAt') => {
    if (!dateRange) return {};

    const query = {};
    if (dateRange.start) {
        query[field] = { $gte: new Date(dateRange.start) };
    }
    if (dateRange.end) {
        query[field] = { ...query[field], $lte: new Date(dateRange.end) };
    }

    return query;
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
