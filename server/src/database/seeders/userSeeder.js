import User from '../../models/User.js';
import sampleUsers, { hashSamplePasswords } from '../../data/Users.js';

const seedUsers = async () => {
    try {
        console.log('Seeding users...');
        
        // Clear existing data
        await User.deleteMany({});
        
        // Hash passwords before inserting
        const hashedUsers = await hashSamplePasswords(sampleUsers);
        
        // Insert sample data
        await User.insertMany(hashedUsers);
        
        console.log('Users seeded successfully!');
    } catch (error) {
        console.error('Error seeding users:', error);
        throw error;
    }
};

export default seedUsers;