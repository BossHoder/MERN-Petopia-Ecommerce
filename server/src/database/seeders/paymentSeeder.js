import PaymentMethod from '../../models/paymentMethod.js';
import samplePaymentMethods from '../../data/paymentMethods.js';
const seedPaymentMethods = async () => {
    try {
        console.log('Seeding payment methods...');

        // Clear existing data
        await PaymentMethod.deleteMany({});

        // Insert sample data
        await PaymentMethod.insertMany(samplePaymentMethods);

        console.log('Payment methods seeded successfully!');
    } catch (error) {
        console.error('Error seeding payment methods:', error);
        throw error;
    }
};

export default seedPaymentMethods;
