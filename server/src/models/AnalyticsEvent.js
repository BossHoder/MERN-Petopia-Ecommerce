import mongoose from 'mongoose';

/**
 * Analytics Event Schema
 * Stores all user interactions and business events
 */
const analyticsEventSchema = new mongoose.Schema(
    {
        eventType: {
            type: String,
            required: true,
            enum: [
                'product_viewed',
                'product_added_to_cart',
                'order_completed',
                'search_performed',
                'user_registered',
                'user_login',
                'category_viewed',
                'checkout_started',
                'payment_completed',
                'coupon_used',
            ],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        sessionId: {
            type: String,
            required: true,
        },
        eventData: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        metadata: {
            userAgent: String,
            ipAddress: String,
            referer: String,
            deviceInfo: {
                isMobile: Boolean,
                browser: String,
                os: String,
            },
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        collection: 'analyticsevents',
    },
);

// Indexes for better query performance
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ userId: 1, timestamp: -1 });
analyticsEventSchema.index({ sessionId: 1, timestamp: -1 });
analyticsEventSchema.index({ timestamp: -1 });

// Static methods for analytics queries
analyticsEventSchema.statics.getEventCountByType = async function (eventType, dateRange = {}) {
    const query = { eventType };

    if (dateRange.start && dateRange.end) {
        query.timestamp = {
            $gte: new Date(dateRange.start),
            $lte: new Date(dateRange.end),
        };
    }

    return await this.countDocuments(query);
};

analyticsEventSchema.statics.getTopProducts = async function (limit = 10, dateRange = {}) {
    const matchQuery = { eventType: 'product_viewed' };

    if (dateRange.start && dateRange.end) {
        matchQuery.timestamp = {
            $gte: new Date(dateRange.start),
            $lte: new Date(dateRange.end),
        };
    }

    return await this.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: '$eventData.productId',
                viewCount: { $sum: 1 },
                productName: { $first: '$eventData.name' },
                productPrice: { $first: '$eventData.price' },
            },
        },
        { $sort: { viewCount: -1 } },
        { $limit: limit },
    ]);
};

analyticsEventSchema.statics.getConversionFunnel = async function (dateRange = {}) {
    const matchQuery = {};

    if (dateRange.start && dateRange.end) {
        matchQuery.timestamp = {
            $gte: new Date(dateRange.start),
            $lte: new Date(dateRange.end),
        };
    }

    const funnelSteps = ['product_viewed', 'product_added_to_cart', 'checkout_started', 'order_completed'];

    const results = await Promise.all(
        funnelSteps.map((step) => this.countDocuments({ ...matchQuery, eventType: step })),
    );

    return funnelSteps.reduce((funnel, step, index) => {
        funnel[step] = {
            count: results[index],
            conversionRate: index > 0 ? ((results[index] / results[0]) * 100).toFixed(2) : 100,
        };
        return funnel;
    }, {});
};

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
export default AnalyticsEvent;
