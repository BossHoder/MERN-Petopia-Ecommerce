import mongoose from 'mongoose';

// ===========================================
// MAIN PRODUCT SCHEMA
// ===========================================
// This schema defines products in the pet store
const productSchema = new mongoose.Schema({
    // Product name (displayed to customers)
    name: {
        type: String,
        required: true,
        trim: true,
    },
    // Product description
    description: {
        type: String,
        required: true,
        trim: true,
    },
    // Regular price
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    // Sale price (optional, must be lower than regular price)
    salePrice: {
        type: Number,
        required: false,
        min: 0,
        validate: {
            validator: function(v) {
                return !v || v < this.price;
            },
            message: 'Sale price must be less than regular price'
        }
    },
    // Stock Keeping Unit (unique product code)
    sku: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    // Which category this product belongs to
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        // Check if category actually exists
        validate: {
            validator: async function(v) {
                const Category = mongoose.model('Category');
                const category = await Category.findById(v);
                return !!category;
            },
            message: 'Category does not exist'
        }
    },
    // How many items are in stock
    stockQuantity: {
        type: Number,
        required: true,
        min: 0,
    },
    // Array of product images
    images: [{
        type: String,
        required: true,
        // Validate image URL or path format
        validate: {
            validator: function (v) {
                const isUrl = /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)$/i.test(v);
                const isLocalPath = /^\/.*\.(?:png|jpg|jpeg|gif|webp)$/i.test(v);
                return isUrl || isLocalPath;
            },
            message: props => `${props.value} is not a valid image URL or path!`
        }
    }],
    // Product brand
    brand: {
        type: String,
        required: true,
        trim: true,
    },
    // Pet-specific information (like "for dogs", "for cats")
    petSpecifics: {
        type: String,
        required: false,
        trim: true,
    },
    // Whether product is visible to customers
    isPublished: {
        type: Boolean,
        default: true,
    },
    // Average rating (0-5 stars)
    ratings: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
}, { timestamps: true });

// ===========================================
// REVIEW SCHEMA (embedded in products)
// ===========================================
// Schema for customer reviews of products
const reviewsSchema = new mongoose.Schema({
    // Reviewer's name
    name: {
        type: String,
        required: true,
        trim: true,
    },
    // Rating given (1-5 stars)
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    // Review comment
    comment: {
        type: String,
        required: true,
        trim: true,
    },
    // Who wrote this review
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

// Add reviews to main product schema
productSchema.add({
    reviews: [reviewsSchema],
    // Total number of reviews
    numReviews: {
        type: Number,
        default: 0,
    },
});

// ===========================================
// DATABASE INDEXES (for faster searches)
// ===========================================
productSchema.index({ category: 1 }); // Find by category quickly
productSchema.index({ brand: 1 }); // Find by brand quickly
productSchema.index({ sku: 1 }, { unique: true }); // Unique SKU lookup
productSchema.index({ name: 'text', description: 'text' }); // Text search
// Compound indexes for common query combinations
productSchema.index({ category: 1, isPublished: 1 });
productSchema.index({ price: 1, salePrice: 1 });
productSchema.index({ stockQuantity: 1, isPublished: 1 });
productSchema.index({ ratings: -1, numReviews: -1 });

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
productSchema.statics.findBySku = function(sku) {
    return this.findOne({ sku: sku.toUpperCase() });
};

// Find products in a specific category
productSchema.statics.findByCategory = function(categorySlug, options = {}) {
    const { limit = 20, skip = 0, sort = { createdAt: -1 } } = options;
    return this.find({ category: categorySlug, isPublished: true })
               .limit(limit)
               .skip(skip)
               .sort(sort);
};

// Find products that are in stock
productSchema.statics.findInStock = function() {
    return this.find({ stockQuantity: { $gt: 0 }, isPublished: true });
};

// Find products that are on sale
productSchema.statics.findOnSale = function() {
    return this.find({ 
        salePrice: { $exists: true, $ne: null, $gt: 0 },
        isPublished: true 
    });
};

// Search products by text
productSchema.statics.search = function(query, options = {}) {
    const { limit = 20, skip = 0 } = options;
    return this.find({
        $text: { $search: query },
        isPublished: true
    }, {
        score: { $meta: "textScore" } // For relevance scoring
    })
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .skip(skip);
};

// ===========================================
// INSTANCE METHODS (actions on individual product)
// ===========================================
// Reserve stock when customer orders (decrease stock)
productSchema.methods.checkAndReserveStock = function(quantity) {
    if (this.stockQuantity < quantity) {
        throw new Error(`Insufficient stock. Available: ${this.stockQuantity}, Requested: ${quantity}`);
    }
    this.stockQuantity -= quantity;
    return this.save();
};

// Restore stock when order is cancelled (increase stock)
productSchema.methods.restoreStock = function(quantity) {
    this.stockQuantity += quantity;
    return this.save();
};

// ===========================================
// CREATE AND EXPORT MODEL
// ===========================================
const Product = mongoose.model('Product', productSchema);

export default Product;