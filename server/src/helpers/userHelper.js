// ===========================================
// USER HELPER FUNCTIONS
// ===========================================
// This file contains utility functions for user operations

import User from '../models/User.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

// Validate email format
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate phone number (Vietnamese format)
export const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)\d{8}$/;
    return phoneRegex.test(phone);
};

// Generate username from email
export const generateUsername = async (email) => {
    const baseUsername = email.split('@')[0].toLowerCase();
    let username = baseUsername;
    let counter = 1;

    // Check if username exists and generate unique one
    while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
    }

    return username;
};

// Add address to user
export const addAddress = async (userId, addressData) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        // Validate address data
        const requiredFields = ['phoneNumber', 'address'];
        for (const field of requiredFields) {
            if (!addressData[field]) {
                throw new Error(`${field} is required`);
            }
        }

        // If this is the first address, make it default
        if (user.addresses.length === 0) {
            addressData.isDefault = true;
        }

        user.addresses.push(addressData);
        await user.save();

        return {
            success: true,
            addresses: user.addresses,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

// Update address
export const updateAddress = async (userId, addressId, addressData) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            throw new Error(ERROR_MESSAGES.ADDRESS_NOT_FOUND);
        }

        Object.assign(address, addressData);
        await user.save();

        return {
            success: true,
            addresses: user.addresses,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

// Remove address
export const removeAddress = async (userId, addressId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            throw new Error(ERROR_MESSAGES.ADDRESS_NOT_FOUND);
        }

        const wasDefault = address.isDefault;
        user.addresses.pull(addressId);

        // If removed address was default, make first remaining address default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        return {
            success: true,
            addresses: user.addresses,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

// Set default address
export const setDefaultAddress = async (userId, addressId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        // Remove default from all addresses
        user.addresses.forEach((address) => {
            address.isDefault = false;
        });

        // Set new default
        const targetAddress = user.addresses.id(addressId);
        if (!targetAddress) {
            throw new Error(ERROR_MESSAGES.ADDRESS_NOT_FOUND);
        }

        targetAddress.isDefault = true;
        await user.save();

        return {
            success: true,
            addresses: user.addresses,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

// Add to wishlist
export const addToWishlist = async (userId, productId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
        }

        return {
            success: true,
            message: 'Product added to wishlist',
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

// Remove from wishlist
export const removeFromWishlist = async (userId, productId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        user.wishlist.pull(productId);
        await user.save();

        return {
            success: true,
            message: 'Product removed from wishlist',
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

// Update user preferences
export const updatePreferences = async (userId, preferences) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        user.preferences = { ...user.preferences, ...preferences };
        await user.save();

        return {
            success: true,
            preferences: user.preferences,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

// Update order statistics
export const updateOrderStats = async (userId, orderTotal) => {
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $inc: {
                    totalOrders: 1,
                    totalSpent: orderTotal,
                },
            },
            { new: true },
        );

        return user;
    } catch (error) {
        console.error('Error updating order stats:', error);
        return null;
    }
};

// Update last login
export const updateLastLogin = async (userId) => {
    try {
        await User.findByIdAndUpdate(userId, {
            lastLogin: new Date(),
        });
    } catch (error) {
        console.error('Error updating last login:', error);
    }
};

// Verify email
export const verifyEmail = async (userId) => {
    try {
        const user = await User.findByIdAndUpdate(userId, { isEmailVerified: true }, { new: true });

        return {
            success: true,
            user,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

// Deactivate user account
export const deactivateUser = async (userId) => {
    try {
        const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });

        return {
            success: true,
            user,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

// Reactivate user account
export const reactivateUser = async (userId) => {
    try {
        const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });

        return {
            success: true,
            user,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

// Get user's full wishlist with product details
export const getUserWishlist = async (userId) => {
    try {
        const user = await User.findById(userId).populate({
            path: 'wishlist',
            select: 'name price salePrice images stockQuantity isPublished',
            match: { isPublished: true },
        });

        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        return {
            success: true,
            wishlist: user.wishlist,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

// Validate user profile data
export const validateProfileData = (profileData) => {
    const errors = [];

    if (profileData.email && !isValidEmail(profileData.email)) {
        errors.push(ERROR_MESSAGES.INVALID_EMAIL_FORMAT);
    }

    if (profileData.phoneNumber && !isValidPhoneNumber(profileData.phoneNumber)) {
        errors.push(ERROR_MESSAGES.INVALID_PHONE_NUMBER_FORMAT);
    }

    if (profileData.dateOfBirth) {
        const birthDate = new Date(profileData.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        if (age < 13) {
            errors.push(ERROR_MESSAGES.USER_MUST_BE_AT_LEAST_13_YEARS_OLD);
        }

        if (age > 120) {
            errors.push(ERROR_MESSAGES.INVALID_BIRTH_DATE);
        }
    }

    if (profileData.name && profileData.name.trim().length < 2) {
        errors.push(ERROR_MESSAGES.NAME_MUST_BE_AT_LEAST_2_CHARACTERS_LONG);
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};
