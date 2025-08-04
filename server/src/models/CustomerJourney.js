import mongoose from 'mongoose';

/**
 * Customer Journey Schema
 * Tracks customer interactions and touchpoints
 */
const customerJourneySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        sessionId: {
            type: String,
            required: true,
            index: true,
        },
        startTime: {
            type: Date,
            default: Date.now,
        },
        lastActivity: {
            type: Date,
            default: Date.now,
        },
        touchpoints: [
            {
                eventType: {
                    type: String,
                    required: true,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                data: {
                    type: mongoose.Schema.Types.Mixed,
                },
                page: String,
                referrer: String,
                userAgent: String,
                ipAddress: String,
                deviceInfo: {
                    isMobile: Boolean,
                    browser: String,
                    os: String,
                    screenResolution: String,
                },
                sessionDuration: Number,
            },
        ],
        journeyStage: {
            type: String,
            enum: ['awareness', 'consideration', 'purchase', 'retention', 'advocacy'],
            default: 'awareness',
        },
        conversionPath: {
            type: String,
            enum: ['direct', 'organic_search', 'paid_search', 'social', 'email', 'referral', 'other'],
        },
        totalValue: {
            type: Number,
            default: 0,
        },
        isConverted: {
            type: Boolean,
            default: false,
        },
        conversionEvent: {
            eventType: String,
            timestamp: Date,
            value: Number,
        },
        metadata: {
            source: String,
            campaign: String,
            medium: String,
            term: String,
            content: String,
        },
    },
    {
        timestamps: true,
        collection: 'customerjourneys',
    },
);

// Indexes
customerJourneySchema.index({ userId: 1, startTime: -1 });
customerJourneySchema.index({ sessionId: 1 });
customerJourneySchema.index({ journeyStage: 1, isConverted: 1 });
customerJourneySchema.index({ lastActivity: -1 });

// Static methods
customerJourneySchema.statics.getUserJourneys = function (userId, limit = 10) {
    return this.find({ userId })
        .sort({ startTime: -1 })
        .limit(limit);
};

customerJourneySchema.statics.getConversionPaths = function (dateRange = {}) {
    const matchQuery = { isConverted: true };
    
    if (dateRange.start && dateRange.end) {
        matchQuery.startTime = {
            $gte: new Date(dateRange.start),
            $lte: new Date(dateRange.end),
        };
    }

    return this.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: '$conversionPath',
                count: { $sum: 1 },
                totalValue: { $sum: '$totalValue' },
                averageValue: { $avg: '$totalValue' },
            },
        },
        { $sort: { count: -1 } },
    ]);
};

customerJourneySchema.statics.getJourneyStages = function (dateRange = {}) {
    const matchQuery = {};
    
    if (dateRange.start && dateRange.end) {
        matchQuery.startTime = {
            $gte: new Date(dateRange.start),
            $lte: new Date(dateRange.end),
        };
    }

    return this.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: '$journeyStage',
                count: { $sum: 1 },
                conversions: {
                    $sum: { $cond: ['$isConverted', 1, 0] },
                },
            },
        },
        {
            $addFields: {
                conversionRate: {
                    $multiply: [
                        { $divide: ['$conversions', '$count'] },
                        100,
                    ],
                },
            },
        },
        { $sort: { count: -1 } },
    ]);
};

// Instance methods
customerJourneySchema.methods.addTouchpoint = function (touchpoint) {
    this.touchpoints.push(touchpoint);
    this.lastActivity = new Date();
    
    // Update journey stage based on events
    this.updateJourneyStage();
    
    return this.save();
};

customerJourneySchema.methods.updateJourneyStage = function () {
    const events = this.touchpoints.map(tp => tp.eventType);
    
    if (events.includes('order_completed')) {
        this.journeyStage = 'purchase';
    } else if (events.includes('product_added_to_cart') || events.includes('checkout_started')) {
        this.journeyStage = 'consideration';
    } else if (events.includes('product_viewed') || events.includes('search_performed')) {
        this.journeyStage = 'awareness';
    }
    
    // Check for retention/advocacy
    if (this.touchpoints.length > 10) {
        this.journeyStage = 'retention';
    }
};

customerJourneySchema.methods.markAsConverted = function (eventType, value = 0) {
    this.isConverted = true;
    this.totalValue = value;
    this.conversionEvent = {
        eventType,
        timestamp: new Date(),
        value,
    };
    this.journeyStage = 'purchase';
    
    return this.save();
};

customerJourneySchema.methods.getSessionDuration = function () {
    if (this.touchpoints.length === 0) return 0;
    
    const firstTouchpoint = this.touchpoints[0].timestamp;
    const lastTouchpoint = this.touchpoints[this.touchpoints.length - 1].timestamp;
    
    return Math.round((lastTouchpoint - firstTouchpoint) / 1000); // in seconds
};

customerJourneySchema.methods.getTouchpointCount = function (eventType = null) {
    if (eventType) {
        return this.touchpoints.filter(tp => tp.eventType === eventType).length;
    }
    return this.touchpoints.length;
};

const CustomerJourney = mongoose.model('CustomerJourney', customerJourneySchema);
export default CustomerJourney;