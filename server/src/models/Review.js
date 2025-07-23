import mongoose from 'mongoose';

// ===========================================
// REVIEW SCHEMA
// ===========================================
// This schema defines product reviews from customers
const reviewSchema = new mongoose.Schema(
    {
        // Product being reviewed
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        // User who wrote the review
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // Review content
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        // Rating from 1 to 5 stars
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        // Review status for moderation
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'approved', // Auto-approve for now, can change to 'pending' if moderation needed
        },
        // Helpful votes from other users
        helpfulVotes: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Users who found this review helpful
        votedBy: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                vote: {
                    type: String,
                    enum: ['helpful', 'not-helpful'],
                },
                votedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        // Verified purchase flag
        verifiedPurchase: {
            type: Boolean,
            default: false,
        },
        // Order reference for verified purchases
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
        // Review images (optional)
        images: [
            {
                url: {
                    type: String,
                    trim: true,
                },
                caption: {
                    type: String,
                    trim: true,
                    maxlength: 200,
                },
            },
        ],
        // Admin notes for moderation
        moderationNotes: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        // Review visibility
        isVisible: {
            type: Boolean,
            default: true,
        },
        // Flagged by users
        flagged: {
            count: {
                type: Number,
                default: 0,
                min: 0,
            },
            reasons: [
                {
                    reason: {
                        type: String,
                        enum: ['spam', 'inappropriate', 'fake', 'offensive', 'other'],
                    },
                    flaggedBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User',
                    },
                    flaggedAt: {
                        type: Date,
                        default: Date.now,
                    },
                    description: {
                        type: String,
                        trim: true,
                        maxlength: 200,
                    },
                },
            ],
        },
    },
    {
        timestamps: true,
    },
);

// ===========================================
// OPTIMIZED INDEXES FOR SMALL SCALE (1000 users)
// ===========================================
// Essential indexes for performance
reviewSchema.index({ product: 1, status: 1 }); // Product reviews listing
reviewSchema.index({ user: 1 }); // User's reviews
reviewSchema.index({ product: 1, user: 1 }, { unique: true }); // One review per user per product
reviewSchema.index({ rating: -1, createdAt: -1 }); // Sorting by rating and date
reviewSchema.index({ status: 1, isVisible: 1 }); // Admin moderation

// REMOVED FOR SMALL SCALE (can add back when needed):
// reviewSchema.index({ verifiedPurchase: 1 }); // Filter verified purchases
// reviewSchema.index({ helpfulVotes: -1 }); // Sort by helpful votes

// ===========================================
// VIRTUAL FIELDS
// ===========================================
// Calculate helpful percentage
reviewSchema.virtual('helpfulPercentage').get(function () {
    if (this.votedBy.length === 0) return 0;
    const helpfulCount = this.votedBy.filter((vote) => vote.vote === 'helpful').length;
    return Math.round((helpfulCount / this.votedBy.length) * 100);
});

// Check if review is flagged heavily
reviewSchema.virtual('isHeavilyFlagged').get(function () {
    return this.flagged.count >= 3; // Threshold for heavy flagging
});

// ===========================================
// INSTANCE METHODS
// ===========================================
// Add helpful vote
reviewSchema.methods.addVote = function (userId, voteType) {
    // Remove existing vote from this user
    this.votedBy = this.votedBy.filter((vote) => vote.user.toString() !== userId.toString());

    // Add new vote
    this.votedBy.push({
        user: userId,
        vote: voteType,
    });

    // Update helpful votes count
    this.helpfulVotes = this.votedBy.filter((vote) => vote.vote === 'helpful').length;

    return this.save();
};

// Flag review
reviewSchema.methods.flagReview = function (userId, reason, description = '') {
    // Check if user already flagged this review
    const existingFlag = this.flagged.reasons.find((flag) => flag.flaggedBy.toString() === userId.toString());

    if (existingFlag) {
        throw new Error('You have already flagged this review');
    }

    this.flagged.reasons.push({
        reason,
        flaggedBy: userId,
        description,
    });

    this.flagged.count += 1;

    return this.save();
};

// Update review status (for moderation)
reviewSchema.methods.updateStatus = function (status, moderationNotes = '') {
    this.status = status;
    if (moderationNotes) {
        this.moderationNotes = moderationNotes;
    }

    // Auto-hide rejected reviews
    if (status === 'rejected') {
        this.isVisible = false;
    }

    return this.save();
};

// ===========================================
// STATIC METHODS
// ===========================================
// Get reviews for a product with pagination
reviewSchema.statics.getProductReviews = async function (productIdentifier, options = {}) {
    const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        rating = null,
        verifiedOnly = false,
    } = options;

    // Find the product by ID or slug to get its ObjectId
    const Product = mongoose.model('Product');
    const product = await Product.findOne({
        $or: [
            { _id: productIdentifier.match(/^[0-9a-fA-F]{24}$/) ? productIdentifier : null },
            { slug: productIdentifier },
        ],
    }).lean();

    // If product doesn't exist, return empty array
    if (!product) {
        return [];
    }

    const query = {
        product: product._id, // Use the ObjectId of the found product
        status: 'approved',
        isVisible: true,
    };

    if (rating) {
        query.rating = rating;
    }

    if (verifiedOnly) {
        query.verifiedPurchase = true;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    return this.find(query)
        .populate('user', 'name avatar')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);
};

// Get user's reviews
reviewSchema.statics.getUserReviews = function (userId, options = {}) {
    const { page = 1, limit = 10, status = 'approved' } = options;

    return this.find({ user: userId, status })
        .populate('product', 'name slug images')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
};

// Calculate product rating statistics
reviewSchema.statics.getProductRatingStats = function (productId) {
    return this.aggregate([
        {
            $match: {
                product: new mongoose.Types.ObjectId(productId),
                status: 'approved',
                isVisible: true,
            },
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
                ratingDistribution: {
                    $push: '$rating',
                },
            },
        },
        {
            $project: {
                _id: 0,
                averageRating: { $round: ['$averageRating', 1] },
                totalReviews: 1,
                ratingCounts: {
                    5: {
                        $size: {
                            $filter: {
                                input: '$ratingDistribution',
                                cond: { $eq: ['$$this', 5] },
                            },
                        },
                    },
                    4: {
                        $size: {
                            $filter: {
                                input: '$ratingDistribution',
                                cond: { $eq: ['$$this', 4] },
                            },
                        },
                    },
                    3: {
                        $size: {
                            $filter: {
                                input: '$ratingDistribution',
                                cond: { $eq: ['$$this', 3] },
                            },
                        },
                    },
                    2: {
                        $size: {
                            $filter: {
                                input: '$ratingDistribution',
                                cond: { $eq: ['$$this', 2] },
                            },
                        },
                    },
                    1: {
                        $size: {
                            $filter: {
                                input: '$ratingDistribution',
                                cond: { $eq: ['$$this', 1] },
                            },
                        },
                    },
                },
            },
        },
    ]);
};

// ===========================================
// MIDDLEWARE
// ===========================================
// Update product rating when review is saved
reviewSchema.post('save', async function () {
    if (this.status === 'approved' && this.isVisible) {
        const Product = mongoose.model('Product');
        const stats = await this.constructor.getProductRatingStats(this.product);

        if (stats.length > 0) {
            await Product.findByIdAndUpdate(this.product, {
                ratings: stats[0].averageRating,
                numReviews: stats[0].totalReviews,
            });
        }
    }
});

// Update product rating when review is removed
reviewSchema.post('findOneAndDelete', async function (doc) {
    if (doc && doc.status === 'approved' && doc.isVisible) {
        const Product = mongoose.model('Product');
        const stats = await doc.constructor.getProductRatingStats(doc.product);

        if (stats.length > 0) {
            await Product.findByIdAndUpdate(doc.product, {
                ratings: stats[0].averageRating,
                numReviews: stats[0].totalReviews,
            });
        } else {
            // No reviews left, reset ratings
            await Product.findByIdAndUpdate(doc.product, {
                ratings: 0,
                numReviews: 0,
            });
        }
    }
});

// ===========================================
// CREATE AND EXPORT MODEL
// ===========================================
const Review = mongoose.model('Review', reviewSchema);
export default Review;
