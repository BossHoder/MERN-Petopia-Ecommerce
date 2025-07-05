import Cart from "../../models/Cart.js";
import sampleCarts from "../../data/Carts.js";
const seedCarts = async () => {
    try {
        console.log('Seeding carts...');

        // Clear existing data
        await Cart.deleteMany({});

        // Insert sample data
        await Cart.insertMany(sampleCarts);

        console.log('Carts seeded successfully!');
    } catch (error) {
        console.error('Error seeding carts:', error);
        throw error;
    }
};

export default seedCarts;