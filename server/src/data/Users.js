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
        phoneNumber: '0123456789',
        addresses: [
            {
                type: 'home',
                fullName: 'Admin User',
                phoneNumber: '0123456789',
                address: '123 Admin Street',
                city: 'Ho Chi Minh City',
                district: 'District 1',
                ward: 'Ben Nghe Ward',
                isDefault: true,
            },
        ],
        preferences: {
            petTypes: ['dog', 'cat'],
            newsletter: true,
            notifications: {
                orders: true,
                promotions: true,
                newProducts: true,
            },
        },
        isActive: true,
        emailVerified: true,
        timestamp: true,
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
        phoneNumber: '0987654321',
        addresses: [
            {
                type: 'home',
                fullName: 'John Doe',
                phoneNumber: '0987654321',
                address: '456 Pet Lover Avenue',
                city: 'Ho Chi Minh City',
                district: 'District 3',
                ward: 'Ward 12',
                isDefault: true,
            },
        ],
        preferences: {
            petTypes: ['dog'],
            newsletter: true,
            notifications: {
                orders: true,
                promotions: false,
                newProducts: true,
            },
        },
        isActive: true,
        emailVerified: true,
        timestamp: true,
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
        phoneNumber: '0345678912',
        addresses: [
            {
                type: 'home',
                fullName: 'Jane Smith',
                phoneNumber: '0345678912',
                address: '789 Cat Street',
                city: 'Hanoi',
                district: 'Ba Dinh',
                ward: 'Cong Vi Ward',
                isDefault: true,
            },
        ],
        preferences: {
            petTypes: ['cat'],
            newsletter: true,
            notifications: {
                orders: true,
                promotions: true,
                newProducts: false,
            },
        },
        isActive: true,
        emailVerified: true,
        timestamp: true,
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
        phoneNumber: '0567891234',
        addresses: [
            {
                type: 'home',
                fullName: 'Pet Lover',
                phoneNumber: '0567891234',
                address: '321 Animal Paradise',
                city: 'Da Nang',
                district: 'Hai Chau',
                ward: 'Hai Chau 1 Ward',
                isDefault: true,
            },
        ],
        preferences: {
            petTypes: ['dog', 'cat', 'bird'],
            newsletter: true,
            notifications: {
                orders: true,
                promotions: true,
                newProducts: true,
            },
        },
        isActive: true,
        emailVerified: true,
        timestamp: true,
    },
    {
        provider: 'local',
        username: 'new_user',
        email: 'newuser@email.com',
        password: 'password123',
        name: 'New User',
        role: 'USER',
        bio: 'Just joined the pet community',
        avatar: 'avatar5.jpg',
        addresses: [],
        preferences: {
            petTypes: [],
            newsletter: false,
            notifications: {
                orders: true,
                promotions: false,
                newProducts: false,
            },
        },
        isActive: true,
        emailVerified: false,
        timestamp: true,
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
        addresses: [],
        preferences: {
            petTypes: [],
            newsletter: true,
            notifications: {
                orders: true,
                promotions: true,
                newProducts: false,
            },
        },
        isActive: true,
        emailVerified: true,
        timestamp: true,
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
        addresses: [],
        preferences: {
            petTypes: [],
            newsletter: true,
            notifications: {
                orders: true,
                promotions: true,
                newProducts: false,
            },
        },
        isActive: true,
        emailVerified: true,
        timestamp: true,
    },
];

export const hashSamplePasswords = async (users) => {
    const hashedUsers = await Promise.all(
        users.map(async (user) => {
            if (user.provider === 'local' && user.password) {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(user.password, saltRounds);
                return { ...user, password: hashedPassword };
            }
            return user;
        }),
    );
    return hashedUsers;
};

export default sampleUsers;
