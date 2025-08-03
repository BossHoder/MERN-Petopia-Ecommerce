import mongoose from 'mongoose';

/**
 * A/B Test Schema
 * Manages A/B testing experiments
 */
const abTestSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        testType: {
            type: String,
            required: true,
            enum: ['ui', 'pricing', 'content', 'feature', 'layout'],
        },
        variants: [
            {
                name: {
                    type: String,
                    required: true,
                },
                description: String,
                config: {
                    type: mongoose.Schema.Types.Mixed,
                    required: true,
                },
                trafficPercentage: {
                    type: Number,
                    default: 50,
                    min: 0,
                    max: 100,
                },
            },
        ],
        targetAudience: {
            userSegments: [String],
            deviceTypes: [String],
            locations: [String],
        },
        goals: [
            {
                metric: {
                    type: String,
                    required: true,
                    enum: ['conversion_rate', 'revenue', 'click_through_rate', 'engagement', 'custom'],
                },
                target: Number,
                description: String,
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        results: {
            totalParticipants: {
                type: Number,
                default: 0,
            },
            variantResults: [
                {
                    variantName: String,
                    participants: Number,
                    conversions: Number,
                    revenue: Number,
                    conversionRate: Number,
                },
            ],
            winner: {
                variantName: String,
                confidence: Number,
                pValue: Number,
            },
        },
    },
    {
        timestamps: true,
        collection: 'abtests',
    },
);

// Indexes
abTestSchema.index({ isActive: 1, startDate: -1 });
abTestSchema.index({ testType: 1, isActive: 1 });
abTestSchema.index({ createdBy: 1 });

// Static methods
abTestSchema.statics.getActiveTests = function () {
    return this.find({
        isActive: true,
        $or: [
            { endDate: { $exists: false } },
            { endDate: { $gt: new Date() } },
        ],
    });
};

abTestSchema.statics.getTestResults = function (testId) {
    return this.findById(testId).populate('createdBy', 'name email');
};

// Instance methods
abTestSchema.methods.calculateResults = async function () {
    // This would integrate with your analytics data
    // For now, we'll return a placeholder
    return {
        totalParticipants: this.results.totalParticipants,
        variantResults: this.results.variantResults,
        winner: this.results.winner,
    };
};

abTestSchema.methods.isEligible = function (userData) {
    if (!this.isActive) return false;
    
    if (this.endDate && new Date() > this.endDate) return false;
    
    // Check target audience criteria
    if (this.targetAudience.userSegments.length > 0) {
        // Add logic to check user segments
    }
    
    return true;
};

const ABTest = mongoose.model('ABTest', abTestSchema);
export default ABTest;