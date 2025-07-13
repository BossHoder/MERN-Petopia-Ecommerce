import mongoose from 'mongoose';

// ===========================================
// PRODUCT VARIANT SCHEMA
// ===========================================
const variantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    value: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: 0,
    },
    sku: {
        type: String,
        required: true,
        trim: true,
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
            validate: {
                validator: async function (v) {
                    const Category = mongoose.model('Category');
                    const category = await Category.findById(v);
                    return !!category;
                },
                message: 'Category does not exist',
            },
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
        variants: [variantSchema],
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
                enum: ['dog', 'cat', 'bird', 'fish', 'other'],
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
// REVIEW SCHEMA (embedded in products)
// ===========================================
// Schema for customer reviews of products
const reviewsSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true },
);

productSchema.add({
    reviews: [reviewsSchema],
    numReviews: {
        type: Number,
        default: 0,
    },
});

// ===========================================
// OPTIMIZED INDEXES FOR SMALL SCALE (1000 users)
// ===========================================
// Keep only essential indexes to save storage
productSchema.index({ sku: 1 }, { unique: true }); // Required for uniqueness
productSchema.index({ category: 1, isPublished: 1 }); // Main product listing
productSchema.index({ name: 'text', description: 'text' }); // Search functionality

// REMOVED FOR SMALL SCALE (can add back when needed):
// productSchema.index({ category: 1 }); // Covered by compound index above
// productSchema.index({ brand: 1 }); // Not critical for 1000 users
// productSchema.index({ price: 1, salePrice: 1 }); // Price filtering not common
// productSchema.index({ stockQuantity: 1, isPublished: 1 }); // Stock check via app logic
// productSchema.index({ ratings: -1, numReviews: -1 }); // Sorting can be done in memory

// ===========================================
// VIRTUAL FIELDS (calculated fields)
// ===========================================
// Calculate average rating from all reviews
productSchema.virtual('averageRating').get(function () {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
});

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
// Auto-update ratings and review count when reviews change
productSchema.pre('save', function (next) {
    if (this.reviews && this.reviews.length > 0) {
        this.numReviews = this.reviews.length;
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.ratings = Math.round((sum / this.reviews.length) * 10) / 10;
    }
    next();
});

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
