import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
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
            validator: function(v) {
                return !v || v < this.price;
            },
            message: 'Sale price must be less than regular price'
        }
    },
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
        validate: {
            validator: async function(v) {
                const Category = mongoose.model('Category');
                const category = await Category.findById(v);
                return !!category;
            },
            message: 'Category does not exist'
        }
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: 0,
    },
    images: [{
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                const isUrl = /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)$/i.test(v);
                const isLocalPath = /^\/.*\.(?:png|jpg|jpeg|gif|webp)$/i.test(v);
                return isUrl || isLocalPath;
            },
            message: props => `${props.value} is not a valid image URL or path!`
        }
    }],
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
    isPublished: {
        type: Boolean,
        default: true,
    },
    ratings: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },

}, { timestamps: true });

// Review schema for embedded reviews in products
const reviewsSchema = new mongoose.Schema({
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
}, { timestamps: true });

// Add reviews to productSchema
productSchema.add({
    reviews: [reviewsSchema],
    numReviews: {
        type: Number,
        default: 0,
    },
});

// Add indexes for better performance
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ name: 'text', description: 'text' });
// Compound indexes for common queries
productSchema.index({ category: 1, isPublished: 1 });
productSchema.index({ price: 1, salePrice: 1 });
productSchema.index({ stockQuantity: 1, isPublished: 1 });
productSchema.index({ ratings: -1, numReviews: -1 });

// Virtual for average rating calculation
productSchema.virtual('averageRating').get(function () {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
});

// Pre-save middleware to update ratings and numReviews
productSchema.pre('save', function (next) {
    if (this.reviews && this.reviews.length > 0) {
        this.numReviews = this.reviews.length;
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.ratings = Math.round((sum / this.reviews.length) * 10) / 10;
    }
    next();
});

// Static methods for better performance
productSchema.statics.findBySku = function(sku) {
    return this.findOne({ sku: sku.toUpperCase() });
};

productSchema.statics.findByCategory = function(categorySlug, options = {}) {
    const { limit = 20, skip = 0, sort = { createdAt: -1 } } = options;
    return this.find({ category: categorySlug, isPublished: true })
               .limit(limit)
               .skip(skip)
               .sort(sort);
};

productSchema.statics.findInStock = function() {
    return this.find({ stockQuantity: { $gt: 0 }, isPublished: true });
};

productSchema.statics.findOnSale = function() {
    return this.find({ 
        salePrice: { $exists: true, $ne: null, $gt: 0 },
        isPublished: true 
    });
};

productSchema.statics.search = function(query, options = {}) {
    const { limit = 20, skip = 0 } = options;
    return this.find({
        $text: { $search: query },
        isPublished: true
    }, {
        score: { $meta: "textScore" }
    })
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .skip(skip);
};

// Add method to calculate discounted price
productSchema.virtual('discountedPrice').get(function () {
    return this.salePrice && this.salePrice < this.price ? this.salePrice : this.price;
});

// Add method to check if product is on sale
productSchema.virtual('isOnSale').get(function () {
    return this.salePrice && this.salePrice < this.price;
});

// Add method to check and reserve stock
productSchema.methods.checkAndReserveStock = function(quantity) {
    if (this.stockQuantity < quantity) {
        throw new Error(`Insufficient stock. Available: ${this.stockQuantity}, Requested: ${quantity}`);
    }
    this.stockQuantity -= quantity;
    return this.save();
};

// Add method to restore stock (for cancelled orders)
productSchema.methods.restoreStock = function(quantity) {
    this.stockQuantity += quantity;
    return this.save();
};

const Product = mongoose.model('Product', productSchema);

export default Product;