// ===========================================
// REVIEW DTOs
// ===========================================

// Full review DTO (for review detail page)
export const reviewDto = (review) => {
    return {
        id: review._id,
        product: review.product,
        user: {
            id: review.user._id,
            name: review.user.name,
            username: review.user.username,
            avatar: review.user.avatar,
        },
        title: review.title,
        comment: review.comment,
        rating: review.rating,
        status: review.status,
        helpfulVotes: review.helpfulVotes,
        verifiedPurchase: review.verifiedPurchase,
        images: review.images,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
    };
};

// Public review DTO (for product page - hide sensitive info)
export const publicReviewDto = (review) => {
    return {
        id: review._id,
        user: {
            name: review.user.name,
            username: review.user.username,
            avatar: review.user.avatar,
        },
        title: review.title,
        comment: review.comment,
        rating: review.rating,
        helpfulVotes: review.helpfulVotes,
        verifiedPurchase: review.verifiedPurchase,
        images: review.images,
        createdAt: review.createdAt,
    };
};

// Admin review DTO (for admin panel - includes moderation fields)
export const adminReviewDto = (review) => {
    return {
        id: review._id,
        product: {
            id: review.product._id,
            name: review.product.name,
            sku: review.product.sku,
        },
        user: {
            id: review.user._id,
            name: review.user.name,
            username: review.user.username,
            email: review.user.email,
        },
        title: review.title,
        comment: review.comment,
        rating: review.rating,
        status: review.status,
        helpfulVotes: review.helpfulVotes,
        verifiedPurchase: review.verifiedPurchase,
        order: review.order,
        images: review.images,
        moderationNotes: review.moderationNotes,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
    };
};

// Summary review DTO (for product cards - minimal info)
export const reviewSummaryDto = (review) => {
    return {
        id: review._id,
        user: {
            name: review.user.name,
        },
        rating: review.rating,
        comment: review.comment.substring(0, 100) + (review.comment.length > 100 ? '...' : ''),
        verifiedPurchase: review.verifiedPurchase,
        createdAt: review.createdAt,
    };
};
