import Coupon from '../../models/Coupon.js';
import User from '../../models/User.js';
import sampleCoupons from '../../data/Coupons.js';

const seedCoupons = async () => {
    try {
        console.log('Seeding coupons...');

        // Clear existing coupons
        await Coupon.deleteMany({});

        // Get admin user to set as creator
        const adminUser = await User.findOne({ role: 'ADMIN' });
        if (!adminUser) {
            console.warn('⚠️ No admin user found. Skipping coupon seeding.');
            return [];
        }

        // Add createdBy field to all coupons
        const couponsToInsert = sampleCoupons.map((couponData) => ({
            ...couponData,
            createdBy: adminUser._id,
        }));

        // Insert coupons
        const insertedCoupons = await Coupon.insertMany(couponsToInsert);

        console.log(`✅ ${insertedCoupons.length} coupons seeded successfully!`);
        return insertedCoupons;
    } catch (error) {
        console.error('❌ Error seeding coupons:', error);
        throw error;
    }
};

export default seedCoupons;
