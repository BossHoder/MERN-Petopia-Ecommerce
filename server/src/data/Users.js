import bcrypt from 'bcryptjs';
import '../config/database.js';

// Sample user data for pet store
const sampleUsers = [
    {
        provider: 'local',
        username: 'admin',
        email: 'admin@petopia.com',
        password: 'admin123', // Will be hashed
        name: 'Admin User',
        role: 'ADMIN',
        bio: 'System Administrator for Petopia Store',
        avatar: 'avatar1.jpg',
        timestamp: true
    },
    {
        provider: 'local',
        username: 'john_doe',
        email: 'john.doe@email.com',
        password: 'password123',
        name: 'John Doe',
        role: 'USER',
        bio: 'Dog lover and frequent customer',
        avatar: 'avatar2.jpg',
        timestamp: true
    },
    {
        provider: 'local',
        username: 'jane_smith',
        email: 'jane.smith@email.com',
        password: 'password123',
        name: 'Jane Smith',
        role: 'USER',
        bio: 'Cat enthusiast and pet care expert',
        avatar: 'avatar3.jpg',
        timestamp: true
    },
    {
        provider: 'local',
        username: 'pet_lover99',
        email: 'petlover@email.com',
        password: 'password123',
        name: 'Pet Lover',
        role: 'USER',
        bio: 'Owns multiple pets including dogs, cats, and birds',
        avatar: 'avatar4.jpg',
        timestamp: true
    },
    {
        provider: 'google',
        username: 'google_user',
        email: 'googleuser@gmail.com',
        name: 'Google User',
        role: 'USER',
        bio: 'Signed up via Google OAuth',
        avatar: 'https://lh3.googleusercontent.com/a/default-user',
        googleId: 'google123456789',
        timestamp: true
    },
    {
        provider: 'facebook',
        username: 'fb_user',
        email: 'fbuser@facebook.com',
        name: 'Facebook User',
        role: 'USER',
        bio: 'Signed up via Facebook',
        avatar: 'https://graph.facebook.com/12345/picture',
        facebookId: 'facebook123456789',
        timestamp: true
    }
];

export const hashSamplePasswords = async (users) => {
    const hashedUsers = await Promise.all(users.map(async (user) => {
        if (user.provider === 'local' && user.password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(user.password, saltRounds);
            return { ...user, password: hashedPassword };
        }
        return user;
    }));
    return hashedUsers;
};

export default sampleUsers;