// ===========================================
// USER SERVICE CLASS
// ===========================================
// This service handles all user-related business logic

import User from '../models/User.js';
import * as userHelper from '../helpers/userHelper.js';
import { userDto, publicUserDto, profileDto } from '../dto/userDto.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

class UserService {
    // Create new user
    async createUser(userData) {
        try {
            // Validate user data
            const validation = userHelper.validateProfileData(userData);
            if (!validation.isValid) {
                return {
                    success: false,
                    errors: validation.errors,
                };
            }

            // Generate username if not provided
            if (!userData.username) {
                userData.username = await userHelper.generateUsername(userData.email);
            }

            const user = new User(userData);
            await user.save();

            return {
                success: true,
                user: userDto(user),
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get user by ID or username
    async getUser(identifier, isPublic = false) {
        try {
            const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
            const user = isObjectId
                ? await User.findById(identifier).populate('wishlist', 'name price images')
                : await User.findOne({ username: identifier }).populate('wishlist', 'name price images');

            if (!user) {
                return {
                    success: false,
                    error: ERROR_MESSAGES.USER_NOT_FOUND,
                };
            }

            // Return appropriate DTO based on context
            const userResponse = isPublic ? publicUserDto(user) : profileDto(user);

            return {
                success: true,
                user: userResponse,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Update user profile
    async updateProfile(userId, updateData) {
        try {
            console.log('UserService.updateProfile called with:', { userId, updateData });

            // Validate update data
            const validation = userHelper.validateProfileData(updateData);
            if (!validation.isValid) {
                console.log('Validation failed:', validation.errors);
                return {
                    success: false,
                    errors: validation.errors,
                };
            }

            // Update last login if user is logging in
            if (updateData.lastLogin) {
                await userHelper.updateLastLogin(userId);
            }

            console.log('Updating user with data:', updateData);
            const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).populate(
                'wishlist',
                'name price images',
            );

            if (!user) {
                console.log('User not found for ID:', userId);
                return {
                    success: false,
                    error: ERROR_MESSAGES.USER_NOT_FOUND,
                };
            }

            console.log('User updated successfully:', user);
            return {
                success: true,
                user: profileDto(user),
            };
        } catch (error) {
            console.error('UserService.updateProfile error:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Delete user account
    async deleteUser(userId) {
        try {
            const user = await User.findByIdAndDelete(userId);
            if (!user) {
                return {
                    success: false,
                    error: ERROR_MESSAGES.USER_NOT_FOUND,
                };
            }

            return {
                success: true,
                message: 'User account deleted successfully',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get all users (admin only)
    async getUsers(options = {}) {
        try {
            const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', role, isActive } = options;

            const query = {
                ...(role && { role }),
                ...(isActive !== undefined && { isActive }),
            };

            const users = await User.find(query)
                .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
                .skip((page - 1) * limit)
                .limit(limit);

            const total = await User.countDocuments(query);

            return {
                success: true,
                users: users.map((user) => userDto(user)),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Manage user addresses
    async addAddress(userId, addressData) {
        try {
            const result = await userHelper.addAddress(userId, addressData);
            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async updateAddress(userId, addressId, addressData) {
        try {
            const result = await userHelper.updateAddress(userId, addressId, addressData);
            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async removeAddress(userId, addressId) {
        try {
            const result = await userHelper.removeAddress(userId, addressId);
            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async setDefaultAddress(userId, addressId) {
        try {
            const result = await userHelper.setDefaultAddress(userId, addressId);
            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Manage wishlist
    async addToWishlist(userId, productId) {
        try {
            const result = await userHelper.addToWishlist(userId, productId);
            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async removeFromWishlist(userId, productId) {
        try {
            const result = await userHelper.removeFromWishlist(userId, productId);
            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async getWishlist(userId) {
        try {
            const result = await userHelper.getUserWishlist(userId);
            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Update preferences
    async updatePreferences(userId, preferences) {
        try {
            const result = await userHelper.updatePreferences(userId, preferences);
            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Account management
    async verifyEmail(userId) {
        try {
            const result = await userHelper.verifyEmail(userId);
            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async deactivateAccount(userId) {
        try {
            const result = await userHelper.deactivateUser(userId);
            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async reactivateAccount(userId) {
        try {
            const result = await userHelper.reactivateUser(userId);
            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Update order statistics
    async updateOrderStats(userId, orderTotal) {
        try {
            const user = await userHelper.updateOrderStats(userId, orderTotal);
            return {
                success: true,
                user: user ? userDto(user) : null,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Search users (admin only)
    async searchUsers(query, options = {}) {
        try {
            const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;

            const searchQuery = {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } },
                    { username: { $regex: query, $options: 'i' } },
                ],
            };

            const users = await User.find(searchQuery)
                .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
                .skip((page - 1) * limit)
                .limit(limit);

            const total = await User.countDocuments(searchQuery);

            return {
                success: true,
                users: users.map((user) => userDto(user)),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get user statistics
    async getUserStats(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                return {
                    success: false,
                    error: ERROR_MESSAGES.USER_NOT_FOUND,
                };
            }

            const stats = {
                totalOrders: user.totalOrders,
                totalSpent: user.totalSpent,
                averageOrderValue: user.totalOrders > 0 ? user.totalSpent / user.totalOrders : 0,
                wishlistItems: user.wishlist.length,
                addresses: user.addresses.length,
                isEmailVerified: user.isEmailVerified,
                lastLogin: user.lastLogin,
                memberSince: user.createdAt,
            };

            return {
                success: true,
                stats,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Bulk operations (admin only)
    async bulkUpdateUsers(updates) {
        try {
            const results = [];

            for (const update of updates) {
                const result = await this.updateProfile(update.id, update.data);
                results.push(result);
            }

            const successful = results.filter((r) => r.success).length;
            const failed = results.filter((r) => !r.success).length;

            return {
                success: true,
                message: `Updated ${successful} users, ${failed} failed`,
                results,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get user activity (admin only)
    async getUserActivity(userId, options = {}) {
        try {
            const { page = 1, limit = 20, startDate, endDate } = options;

            const user = await User.findById(userId);
            if (!user) {
                return {
                    success: false,
                    error: ERROR_MESSAGES.USER_NOT_FOUND,
                };
            }

            // This would typically integrate with other services
            // For now, return basic activity data
            const activity = {
                user: userDto(user),
                lastLogin: user.lastLogin,
                totalOrders: user.totalOrders,
                totalSpent: user.totalSpent,
                // Additional activity data would come from orders, reviews, etc.
            };

            return {
                success: true,
                activity,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
}

export default new UserService();
