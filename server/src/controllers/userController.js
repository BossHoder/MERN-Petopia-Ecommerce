import User, { hashPassword } from '../models/User.js';
import UserService from '../services/userService.js';

// ===========================================
// USER CONTROLLER
// ===========================================
// This controller handles HTTP requests and responses for user-related operations

class UserController {
    // Update user profile
    async updateProfile(req, res, next) {
        try {
            const tempUser = await User.findById(req.params.id);
            if (!tempUser) {
                return res.status(404).json({ message: 'No such user.' });
            }

            if (!(tempUser.id === req.user.id || req.user.role === 'ADMIN')) {
                return res.status(403).json({
                    message: 'You do not have privileges to edit this user.',
                });
            }

            // Prepare update data
            const updateData = {
                name: req.body.name,
                username: req.body.username,
            };

            // Handle avatar upload
            if (req.file) {
                updateData.avatar = req.file.filename;
            }

            // Handle password update for email users only
            if (req.user.provider === 'email' && req.body.password && req.body.password !== '') {
                updateData.password = await hashPassword(req.body.password);
            }

            // Check username uniqueness
            if (req.body.username) {
                const existingUser = await User.findOne({ username: req.body.username });
                if (existingUser && existingUser.id !== tempUser.id) {
                    return res.status(400).json({ message: 'Username already taken.' });
                }
            }

            // Use UserService to update profile
            const result = await UserService.updateProfile(req.params.id, updateData);

            if (!result.success) {
                return res.status(400).json({
                    message: result.error || result.errors?.join(', '),
                });
            }

            res.status(200).json({ user: result.user });
        } catch (err) {
            console.error('Error updating user profile:', err);
            res.status(500).json({ message: 'Something went wrong.' });
        }
    }

    // Get current user
    async getCurrentUser(req, res) {
        try {
            const result = await UserService.getUser(req.user.id, false);

            if (!result.success) {
                return res.status(404).json({ message: result.error });
            }

            res.json({ me: result.user });
        } catch (err) {
            console.error('Error getting current user:', err);
            res.status(500).json({ message: 'Something went wrong.' });
        }
    }

    // Get user by username
    async getUserByUsername(req, res) {
        try {
            const result = await UserService.getUser(req.params.username, true);

            if (!result.success) {
                return res.status(404).json({ message: result.error });
            }

            res.json({ user: result.user });
        } catch (err) {
            console.error('Error getting user by username:', err);
            res.status(500).json({ message: 'Something went wrong.' });
        }
    }

    // Get all users with pagination and filtering
    async getUsers(req, res) {
        try {
            // Parse query parameters for pagination and filtering
            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
                sortBy: req.query.sortBy || 'createdAt',
                sortOrder: req.query.sortOrder || 'desc',
                role: req.query.role,
                isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
            };

            let result;

            // Check if it's a search request
            if (req.query.search) {
                result = await UserService.searchUsers(req.query.search, options);
            } else {
                // Regular get all users with pagination
                result = await UserService.getUsers(options);
            }

            if (!result.success) {
                return res.status(400).json({ message: result.error });
            }

            res.json({
                users: result.users,
                pagination: result.pagination,
            });
        } catch (err) {
            console.error('Error getting users:', err);
            res.status(500).json({ message: 'Something went wrong.' });
        }
    }

    // Delete user
    async deleteUser(req, res) {
        try {
            const tempUser = await User.findById(req.params.id);
            if (!tempUser) {
                return res.status(404).json({ message: 'No such user.' });
            }

            if (!(tempUser.id === req.user.id || req.user.role === 'ADMIN')) {
                return res.status(403).json({
                    message: 'You do not have privileges to delete that user.',
                });
            }

            // Use UserService to delete user
            const result = await UserService.deleteUser(req.params.id);

            if (!result.success) {
                return res.status(400).json({ message: result.error });
            }

            res.status(200).json({ message: result.message });
        } catch (err) {
            console.error('Error deleting user:', err);
            res.status(500).json({ message: 'Something went wrong.' });
        }
    }

    // ===========================================
    // WISHLIST METHODS
    // ===========================================

    // Add item to wishlist
    async addToWishlist(req, res) {
        try {
            if (!this._checkUserPermission(req)) {
                return res.status(403).json({ message: 'Access denied.' });
            }

            const result = await UserService.addToWishlist(req.params.id, req.body.productId);

            if (!result.success) {
                return res.status(400).json({ message: result.error });
            }

            res.status(200).json(result);
        } catch (err) {
            console.error('Error adding to wishlist:', err);
            res.status(500).json({ message: 'Something went wrong.' });
        }
    }

    // Remove item from wishlist
    async removeFromWishlist(req, res) {
        try {
            if (!this._checkUserPermission(req)) {
                return res.status(403).json({ message: 'Access denied.' });
            }

            const result = await UserService.removeFromWishlist(req.params.id, req.params.productId);

            if (!result.success) {
                return res.status(400).json({ message: result.error });
            }

            res.status(200).json(result);
        } catch (err) {
            console.error('Error removing from wishlist:', err);
            res.status(500).json({ message: 'Something went wrong.' });
        }
    }

    // Get user's wishlist
    async getWishlist(req, res) {
        try {
            if (!this._checkUserPermission(req)) {
                return res.status(403).json({ message: 'Access denied.' });
            }

            const result = await UserService.getWishlist(req.params.id);

            if (!result.success) {
                return res.status(400).json({ message: result.error });
            }

            res.status(200).json(result);
        } catch (err) {
            console.error('Error getting wishlist:', err);
            res.status(500).json({ message: 'Something went wrong.' });
        }
    }

    // ===========================================
    // ADDRESS METHODS
    // ===========================================

    // Add new address
    async addAddress(req, res) {
        try {
            if (!this._checkUserPermission(req)) {
                return res.status(403).json({ message: 'Access denied.' });
            }

            const result = await UserService.addAddress(req.params.id, req.body);

            if (!result.success) {
                return res.status(400).json({ message: result.error });
            }

            res.status(201).json(result);
        } catch (err) {
            console.error('Error adding address:', err);
            res.status(500).json({ message: 'Something went wrong.' });
        }
    }

    // Update address
    async updateAddress(req, res) {
        try {
            if (!this._checkUserPermission(req)) {
                return res.status(403).json({ message: 'Access denied.' });
            }

            const result = await UserService.updateAddress(req.params.id, req.params.addressId, req.body);

            if (!result.success) {
                return res.status(400).json({ message: result.error });
            }

            res.status(200).json(result);
        } catch (err) {
            console.error('Error updating address:', err);
            res.status(500).json({ message: 'Something went wrong.' });
        }
    }

    // Remove address
    async removeAddress(req, res) {
        try {
            if (!this._checkUserPermission(req)) {
                return res.status(403).json({ message: 'Access denied.' });
            }

            const result = await UserService.removeAddress(req.params.id, req.params.addressId);

            if (!result.success) {
                return res.status(400).json({ message: result.error });
            }

            res.status(200).json(result);
        } catch (err) {
            console.error('Error removing address:', err);
            res.status(500).json({ message: 'Something went wrong.' });
        }
    }

    // Set default address
    async setDefaultAddress(req, res) {
        try {
            if (!this._checkUserPermission(req)) {
                return res.status(403).json({ message: 'Access denied.' });
            }

            const result = await UserService.setDefaultAddress(req.params.id, req.params.addressId);

            if (!result.success) {
                return res.status(400).json({ message: result.error });
            }

            res.status(200).json(result);
        } catch (err) {
            console.error('Error setting default address:', err);
            res.status(500).json({ message: 'Something went wrong.' });
        }
    }

    // ===========================================
    // USER STATS & ADMIN METHODS
    // ===========================================

    // Get user statistics
    async getUserStats(req, res) {
        try {
            if (!this._checkUserPermission(req)) {
                return res.status(403).json({ message: 'Access denied.' });
            }

            const result = await UserService.getUserStats(req.params.id);

            if (!result.success) {
                return res.status(400).json({ message: result.error });
            }

            res.status(200).json(result);
        } catch (err) {
            console.error('Error getting user stats:', err);
            res.status(500).json({ message: 'Something went wrong.' });
        }
    }

    // Update user preferences
    async updatePreferences(req, res) {
        try {
            if (!this._checkUserPermission(req)) {
                return res.status(403).json({ message: 'Access denied.' });
            }

            const result = await UserService.updatePreferences(req.params.id, req.body);

            if (!result.success) {
                return res.status(400).json({ message: result.error });
            }

            res.status(200).json(result);
        } catch (err) {
            console.error('Error updating preferences:', err);
            res.status(500).json({ message: 'Something went wrong.' });
        }
    }

    // Admin: Get user activity
    async getUserActivity(req, res) {
        try {
            if (!this._checkAdminPermission(req)) {
                return res.status(403).json({ message: 'Admin access required.' });
            }

            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            };

            const result = await UserService.getUserActivity(req.params.id, options);

            if (!result.success) {
                return res.status(400).json({ message: result.error });
            }

            res.status(200).json(result);
        } catch (err) {
            console.error('Error getting user activity:', err);
            res.status(500).json({ message: 'Something went wrong.' });
        }
    }

    // Admin: Bulk update users
    async bulkUpdateUsers(req, res) {
        try {
            if (!this._checkAdminPermission(req)) {
                return res.status(403).json({ message: 'Admin access required.' });
            }

            const result = await UserService.bulkUpdateUsers(req.body.updates);

            if (!result.success) {
                return res.status(400).json({ message: result.error });
            }

            res.status(200).json(result);
        } catch (err) {
            console.error('Error bulk updating users:', err);
            res.status(500).json({ message: 'Something went wrong.' });
        }
    }

    // Database reseed (development only)
    async reseedDatabase(req, res) {
        try {
            // Only allow in development environment
            if (process.env.NODE_ENV === 'production') {
                return res.status(403).json({
                    message: 'Database reseed is not allowed in production.',
                });
            }

            res.json({
                message: 'Database reseed functionality temporarily disabled.',
            });
        } catch (err) {
            console.error('Error reseeding database:', err);
            res.status(500).json({ message: 'Something went wrong.' });
        }
    }

    // ===========================================
    // PRIVATE HELPER METHODS
    // ===========================================

    // Check if user has permission to access resource
    _checkUserPermission(req) {
        return req.user.id === req.params.id || req.user.role === 'ADMIN';
    }

    // Check if user is admin
    _checkAdminPermission(req) {
        return req.user.role === 'ADMIN';
    }
}

export default new UserController();
