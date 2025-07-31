// ===========================================
// COUPONS SEED DATA
// ===========================================
// This file contains seed data for coupons/discount codes

const coupons = [
    {
        code: 'WELCOME10',
        description: '10% discount for new customers',
        discountType: 'percentage',
        discountValue: 10,
        usageLimit: 1000,
        usageCount: 0,
        perUserLimit: 1,
        minOrderValue: 100000,
        maxDiscountAmount: 50000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        applicableProducts: [],
        applicableCategories: [],
        excludeProducts: [],
        excludeCategories: [],
        isActive: true,
        usedBy: [],
        createdBy: '64c8e7f1a2b3c4d5e6f7a8b9', // Example admin ObjectId
    },
    {
        code: 'FREESHIP',
        description: 'Free shipping for orders over 200k',
        discountType: 'fixed',
        discountValue: 20000,
        usageLimit: null, // Unlimited
        usageCount: 0,
        perUserLimit: 3,
        minOrderValue: 200000,
        maxDiscountAmount: null,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        applicableProducts: [],
        applicableCategories: [],
        excludeProducts: [],
        excludeCategories: [],
        isActive: true,
        usedBy: [],
        createdBy: '64c8e7f1a2b3c4d5e6f7a8b9',
    },
    {
        code: 'DOGFOOD20',
        description: '20% discount on dog food products',
        discountType: 'percentage',
        discountValue: 20,
        usageLimit: 500,
        usageCount: 0,
        perUserLimit: 2,
        minOrderValue: 50000,
        maxDiscountAmount: 100000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        applicableProducts: [],
        applicableCategories: [], // Will be populated with dog food category ID
        excludeProducts: [],
        excludeCategories: [],
        isActive: true,
        usedBy: [],
        createdBy: '64c8e7f1a2b3c4d5e6f7a8b9',
    },
    {
        code: 'FLASH50',
        description: 'Flash sale - 50k off for orders over 300k',
        discountType: 'fixed',
        discountValue: 50000,
        usageLimit: 100,
        usageCount: 0,
        perUserLimit: 1,
        minOrderValue: 300000,
        maxDiscountAmount: null,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        applicableProducts: [],
        applicableCategories: [],
        excludeProducts: [],
        excludeCategories: [],
        isActive: true,
        usedBy: [],
        createdBy: '64c8e7f1a2b3c4d5e6f7a8b9',
    },
    {
        code: 'BIRTHDAY30',
        description: 'Birthday special - 30% off everything',
        discountType: 'percentage',
        discountValue: 30,
        usageLimit: 50,
        usageCount: 0,
        perUserLimit: 1,
        minOrderValue: 150000,
        maxDiscountAmount: 200000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        applicableProducts: [],
        applicableCategories: [],
        excludeProducts: [],
        excludeCategories: [],
        isActive: true,
        usedBy: [],
        createdBy: '64c8e7f1a2b3c4d5e6f7a8b9',
    },
];

export default coupons;
