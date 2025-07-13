import Order from '../../models/Order.js';
import sampleOrders from '../../data/Orders.js';
const seedOrders = async () => {
    try {
        console.log('Seeding orders...');

        // Clear existing data
        await Order.deleteMany({});

        // Insert sample data
        await Order.insertMany(sampleOrders);

        console.log('Orders seeded successfully!');
    } catch (error) {
        console.error('Error seeding orders:', error);
        throw error;
    }
};

export default seedOrders;
