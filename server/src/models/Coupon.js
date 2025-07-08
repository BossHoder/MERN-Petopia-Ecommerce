import mongoose from 'mongoose';

// ===========================================
// COUPON SCHEMA
// ===========================================
// This schema defines discount coupons for the store
const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    discountType: {
        type: String,
        required: true,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: function(v) {
                if (this.discountType === 'percentage') {
                    return v <= 100;
                }
                return true;
            },
            message: 'Percentage discount cannot exceed 100%'
        }
    },
    usageLimit: {
        type: Number,
        default: null, // null means unlimited
        min: 1
    },
    usageCount: {
        type: Number,
        default: 0,
        min: 0
    },
    perUserLimit: {
        type: Number,
        default: 1,
        min: 1
    },
    // Minimum order value to apply coupon
    minOrderValue: {
        type: Number,
        default: 0,
        min: 0
    },
    // Maximum discount amount (for percentage coupons)
    maxDiscountAmount: {
        type: Number,
        min: 0
    },
    validFrom: {
        type: Date,
        required: true,
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
                return v > this.validFrom;
            },
            message: 'Valid until date must be after valid from date'
        }
    },
    // Applicable products/categories
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    applicableCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    // Exclude products/categories
    excludeProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    excludeCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    usedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        usedAt: {
            type: Date,
            default: Date.now
        },
        orderValue: {
            type: Number,
            required: true
        },
        discountAmount: {
            type: Number,
            required: true
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// ===========================================
// DATABASE INDEXES
// ===========================================
couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ isActive: 1 });

// ===========================================
// VIRTUAL FIELDS
// ===========================================
couponSchema.virtual('isValid').get(function() {
    const now = new Date();
    return this.isActive && 
           this.validFrom <= now && 
           this.validUntil >= now &&
           (this.usageLimit === null || this.usageCount < this.usageLimit);
});

couponSchema.virtual('isExpired').get(function() {
    return this.validUntil < new Date();
});

// ===========================================
// INSTANCE METHODS
// ===========================================
// Check if coupon can be used by a specific user
couponSchema.methods.canBeUsedBy = function(userId) {
    if (!this.isValid) return false;
    
    const userUsage = this.usedBy.filter(usage => 
        usage.user.toString() === userId.toString()
    );
    
    return userUsage.length < this.perUserLimit;
};

// Calculate discount amount for given order value
couponSchema.methods.calculateDiscount = function(orderValue) {
    if (orderValue < this.minOrderValue) return 0;
    
    let discount = 0;
    
    if (this.discountType === 'percentage') {
        discount = (orderValue * this.discountValue) / 100;
        if (this.maxDiscountAmount) {
            discount = Math.min(discount, this.maxDiscountAmount);
        }
    } else {
        discount = this.discountValue;
    }
    
    return Math.min(discount, orderValue);
};

// Apply coupon usage
couponSchema.methods.applyCoupon = function(userId, orderValue) {
    const discountAmount = this.calculateDiscount(orderValue);
    
    this.usedBy.push({
        user: userId,
        orderValue,
        discountAmount
    });
    
    this.usageCount += 1;
    return this.save();
};

// ===========================================
// STATIC METHODS
// ===========================================
// Find valid coupons for a specific user and order value
couponSchema.statics.findValidCoupons = function(userId, orderValue) {
    const now = new Date();
    
    return this.find({
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
        minOrderValue: { $lte: orderValue },
        $or: [
            { usageLimit: null },
            { $expr: { $lt: ['$usageCount', '$usageLimit'] } }
        ]
    }).then(coupons => {
        return coupons.filter(coupon => coupon.canBeUsedBy(userId));
    });
};

// ===========================================
// CREATE AND EXPORT MODEL
// ===========================================
const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
