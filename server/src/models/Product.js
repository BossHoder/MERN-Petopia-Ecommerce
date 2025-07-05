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
                // Simple URL validation
                return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif))$/i.test(v);
            },
            message: props => `${props.value} is not a valid image URL!`
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

// Virtual for average rating calculation
productSchema.virtual('averageRating').get(function() {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
});

// Pre-save middleware to update ratings and numReviews
productSchema.pre('save', function(next) {
    if (this.reviews && this.reviews.length > 0) {
        this.numReviews = this.reviews.length;
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.ratings = Math.round((sum / this.reviews.length) * 10) / 10;
    }
    next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;