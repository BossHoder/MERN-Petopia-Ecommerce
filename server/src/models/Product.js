import mongoose from 'mongoose';

// ===========================================
// VARIANT ATTRIBUTE SCHEMA (e.g., Color, Size)
// ===========================================
const variantAttributeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        // e.g., "Color", "Size", "Material"
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
        // e.g., "Màu sắc", "Kích cỡ"
    },
    values: [
        {
            value: {
                type: String,
                required: true,
                trim: true,
                // e.g., "Red", "Blue", "S", "M", "L"
            },
            displayName: {
                type: String,
                required: true,
                trim: true,
                // e.g., "Đỏ", "Xanh", "Nhỏ", "Vừa", "Lớn"
            },
            colorCode: {
                type: String,
                trim: true,
                // For color attributes, hex color code
            },
            isActive: {
                type: Boolean,
                default: true,
            },
        },
    ],
    isRequired: {
        type: Boolean,
        default: true,
        // Whether user must select this attribute
    },
    sortOrder: {
        type: Number,
        default: 0,
        // Display order in UI
    },
});

// ===========================================
// VARIANT COMBINATION SCHEMA
// ===========================================
const variantCombinationSchema = new mongoose.Schema({
    // Combination identifier (e.g., "color:red,size:l")
    combinationKey: {
        type: String,
        required: true,
        trim: true,
    },
    // Array of attribute-value pairs
    attributes: [
        {
            attributeName: {
                type: String,
                required: true,
                trim: true,
            },
            attributeValue: {
                type: String,
                required: true,
                trim: true,
            },
        },
    ],
    // Unique SKU for this combination
    sku: {
        type: String,
        required: true,
        trim: true,
    },
    // Price for this combination (can override base price)
    price: {
        type: Number,
        min: 0,
        // If not set, uses product base price
    },
    // Sale price for this combination
    salePrice: {
        type: Number,
        min: 0,
        validate: {
            validator: function (v) {
                if (!v) return true;
                const effectivePrice = this.price || this.parent().price;
                return v < effectivePrice;
            },
            message: 'Sale price must be less than regular price',
        },
    },
    // Stock quantity for this specific combination
    stockQuantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    // Low stock threshold for this combination
    lowStockThreshold: {
        type: Number,
        default: 5,
        min: 0,
    },
    // Images specific to this combination
    images: [
        {
            type: String,
            validate: {
                validator: function (v) {
                    const isUrl = /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)$/i.test(v);
                    const isLocalPath = /^\/.*\.(?:png|jpg|jpeg|gif|webp)$/i.test(v);
                    return isUrl || isLocalPath;
                },
                message: (props) => `${props.value} is not a valid image URL or path!`,
            },
        },
    ],
    // Whether this combination is active/available
    isActive: {
        type: Boolean,
        default: true,
    },
    // Weight for this combination (if different from base)
    weight: {
        type: Number,
        min: 0,
    },
    // Dimensions for this combination (if different from base)
    dimensions: {
        length: { type: Number, min: 0 },
        width: { type: Number, min: 0 },
        height: { type: Number, min: 0 },
    },
});

// ===========================================
// MAIN PRODUCT SCHEMA
// ===========================================
// This schema defines products in the pet store
const productSchema = new mongoose.Schema(
    {
        // Product name (displayed to customers)
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        shortDescription: {
            type: String,
            trim: true,
            maxlength: 160,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        salePrice: {
            type: Number,
            required: false,
            min: 0,
            validate: {
                validator: function (v) {
                    return !v || v < this.price;
                },
                message: 'Sale price must be less than regular price',
            },
        },
        // Stock Keeping Unit (unique product code)
        sku: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
            // Check if category actually exists
            // validate: {
            //     validator: async function (v) {
            //         const Category = mongoose.model('Category');
            //         const category = await Category.findById(v);
            //         return !!category;
            //     },
            //     message: 'Category does not exist',
            // },
        },
        stockQuantity: {
            type: Number,
            required: true,
            min: 0,
        },
        lowStockThreshold: {
            type: Number,
            default: 10,
            min: 0,
        },
        // New variant system
        variantAttributes: [variantAttributeSchema],
        variantCombinations: [variantCombinationSchema],

        // Legacy variants (for backward compatibility during migration)
        variants: [
            {
                name: String,
                value: String,
                price: Number,
                stockQuantity: Number,
                sku: String,
                images: [String],
                isActive: { type: Boolean, default: true },
            },
        ],
        images: [
            {
                type: String,
                required: true,
                // Validate image URL or path format
                validate: {
                    validator: function (v) {
                        const isUrl = /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)$/i.test(v);
                        const isLocalPath = /^\/.*\.(?:png|jpg|jpeg|gif|webp)$/i.test(v);
                        return isUrl || isLocalPath;
                    },
                    message: (props) => `${props.value} is not a valid image URL or path!`,
                },
            },
        ],
        brand: {
            type: String,
            required: true,
            trim: true,
        },
        petSpecifics: {
            type: String,
            required: false,
            trim: true,
        },
        attributes: {
            weight: {
                type: Number,
                min: 0,
            },
            dimensions: {
                length: { type: Number, min: 0 },
                width: { type: Number, min: 0 },
                height: { type: Number, min: 0 },
            },
            color: String,
            material: String,
            ageGroup: {
                type: String,
                enum: ['puppy', 'adult', 'senior', 'all'],
            },
            petType: {
                type: String,
                enum: ['dog', 'cat', 'bird', 'fish', 'dog and cat', 'other', 'dog and cat'],
            },
        },
        // SEO fields
        metaTitle: {
            type: String,
            trim: true,
            maxlength: 60,
        },
        metaDescription: {
            type: String,
            trim: true,
            maxlength: 160,
        },
        tags: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],
        isPublished: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        ratings: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
            min: 0,
        },
        viewCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        salesCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true },
);

// ===========================================
// REVIEW SCHEMA (embedded in products) - REMOVED FOR SEPARATE REVIEW MODEL
// ===========================================

// ===========================================
// PRODUCT SCHEMA METHODS
// ===========================================

// Generate combination key from attributes
productSchema.methods.generateCombinationKey = function (attributeSelections) {
    const sortedKeys = Object.keys(attributeSelections).sort();
    return sortedKeys.map((key) => `${key}:${attributeSelections[key].toLowerCase()}`).join(',');
};

// Find variant combination by attributes
productSchema.methods.findVariantCombination = function (attributeSelections) {
    const combinationKey = this.generateCombinationKey(attributeSelections);
    return this.variantCombinations.find((combo) => combo.combinationKey === combinationKey);
};

// Get effective price for a combination
productSchema.methods.getEffectivePrice = function (combination) {
    if (!combination) return this.salePrice || this.price;
    return combination.salePrice || combination.price || this.salePrice || this.price;
};

// Get total stock across all combinations
productSchema.methods.getTotalVariantStock = function () {
    if (!this.variantCombinations || this.variantCombinations.length === 0) {
        return this.stockQuantity;
    }
    return this.variantCombinations.reduce((total, combo) => {
        return total + (combo.isActive ? combo.stockQuantity : 0);
    }, 0);
};

// Check if product has variants
productSchema.methods.hasVariants = function () {
    return this.variantAttributes && this.variantAttributes.length > 0;
};

// Get available combinations (in stock and active)
productSchema.methods.getAvailableCombinations = function () {
    return this.variantCombinations.filter((combo) => combo.isActive && combo.stockQuantity > 0);
};

// ===========================================
// OPTIMIZED INDEXES FOR SMALL SCALE (1000 users)
// ===========================================
// Keep only essential indexes to save storage
productSchema.index({ sku: 1 }, { unique: true }); // Required for uniqueness
productSchema.index({ category: 1, isPublished: 1 }); // Main product listing
productSchema.index({ name: 'text', description: 'text' }); // Search functionality
productSchema.index({ 'variantCombinations.sku': 1 }); // For variant SKU lookups
productSchema.index({ 'variantCombinations.combinationKey': 1 }); // For combination lookups

// ===========================================
// VIRTUAL FIELDS (calculated fields)
// ===========================================
// REMOVED - This should be based on the separate Review model
// productSchema.virtual('averageRating').get(function () {
//     if (this.reviews.length === 0) return 0;
//     const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
//     return Math.round((sum / this.reviews.length) * 10) / 10;
// });

// Get final price (sale price if available, otherwise regular price)
productSchema.virtual('discountedPrice').get(function () {
    return this.salePrice && this.salePrice < this.price ? this.salePrice : this.price;
});

// Check if product is currently on sale
productSchema.virtual('isOnSale').get(function () {
    return this.salePrice && this.salePrice < this.price;
});

// ===========================================
// MIDDLEWARE (runs before saving)
// ===========================================
// REMOVED - This logic is now in the Review model post-save hook
// productSchema.pre('save', function (next) {
//     if (this.reviews && this.reviews.length > 0) {
//         this.numReviews = this.reviews.length;
//         const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
//         this.ratings = Math.round((sum / this.reviews.length) * 10) / 10;
//     }
//     next();
// });

// ===========================================
// STATIC METHODS (actions on Product model)
// ===========================================
// Find product by SKU
productSchema.statics.findBySku = function (sku) {
    return this.findOne({ sku: sku.toUpperCase() });
};

// Find products in a specific category
productSchema.statics.findByCategory = function (categorySlug, options = {}) {
    const { limit = 20, skip = 0, sort = { createdAt: -1 } } = options;
    return this.find({ category: categorySlug, isPublished: true }).limit(limit).skip(skip).sort(sort);
};

// Find products that are in stock
productSchema.statics.findInStock = function () {
    return this.find({ stockQuantity: { $gt: 0 }, isPublished: true });
};

// Find products that are on sale
productSchema.statics.findOnSale = function () {
    return this.find({
        salePrice: { $exists: true, $ne: null, $gt: 0 },
        isPublished: true,
    });
};

// Search products by text
productSchema.statics.search = function (query, options = {}) {
    const { limit = 20, skip = 0 } = options;
    return this.find(
        {
            $text: { $search: query },
            isPublished: true,
        },
        {
            score: { $meta: 'textScore' }, // For relevance scoring
        },
    )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .skip(skip);
};

// ===========================================
// INSTANCE METHODS (actions on individual product)
// ===========================================
// Reserve stock when customer orders (decrease stock)
productSchema.methods.checkAndReserveStock = function (quantity) {
    if (this.stockQuantity < quantity) {
        throw new Error(`Insufficient stock. Available: ${this.stockQuantity}, Requested: ${quantity}`);
    }
    this.stockQuantity -= quantity;
    return this.save();
};

// Restore stock when order is cancelled (increase stock)
productSchema.methods.restoreStock = function (quantity) {
    this.stockQuantity += quantity;
    return this.save();
};

// ===========================================
// CREATE AND EXPORT MODEL
// ===========================================
const Product = mongoose.model('Product', productSchema);

export default Product;
