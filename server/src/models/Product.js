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
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        ref: 'Category',
        validate: {
            validator: async function(v) {
                const Category = mongoose.model('Category');
                const category = await Category.findOne({ slug: v });
                return !!category;
            },
            message: 'Category slug does not exist'
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

const Product = mongoose.model('Product', productSchema);

export default Product;