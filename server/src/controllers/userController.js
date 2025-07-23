import User, { hashPassword } from '../models/User.js';
import UserService from '../services/userService.js';
import { existsSync } from 'fs';
// import { addressDto, addressesDto } from '../dto/addressDto.js'; // Tạm thời bỏ qua

// ===========================================
// USER CONTROLLER
// ===========================================
// This controller handles HTTP requests and responses for user-related operations

class UserController {
    constructor() {
        this.updateProfile = this.updateProfile.bind(this);
        this.getCurrentUser = this.getCurrentUser.bind(this);
        this.getUserByUsername = this.getUserByUsername.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.addToWishlist = this.addToWishlist.bind(this);
        this.removeFromWishlist = this.removeFromWishlist.bind(this);
        this.getWishlist = this.getWishlist.bind(this);
        this.getAddresses = this.getAddresses.bind(this);
        this.addAddress = this.addAddress.bind(this);
        this.updateAddress = this.updateAddress.bind(this);
        this.removeAddress = this.removeAddress.bind(this);
        this.setDefaultAddress = this.setDefaultAddress.bind(this);
        this.getUserStats = this.getUserStats.bind(this);
        this.updatePreferences = this.updatePreferences.bind(this);
        this.getUserActivity = this.getUserActivity.bind(this);
        this.bulkUpdateUsers = this.bulkUpdateUsers.bind(this);
        this.reseedDatabase = this.reseedDatabase.bind(this);
    }

    // Update user profile
    async updateProfile(req, res, next) {
        try {
            console.log('updateProfile called with:', {
                params: req.params,
                body: req.body,
                file: req.file
                    ? {
                          filename: req.file.filename,
                          size: req.file.size,
                          mimetype: req.file.mimetype,
                          originalname: req.file.originalname,
                      }
                    : null,
                user: req.user ? { id: req.user.id, role: req.user.role } : null,
            });

            const tempUser = await User.findById(req.params.id);
            if (!tempUser) {
                console.log('User not found:', req.params.id);
                return res.status(404).json({ message: 'No such user.' });
            }

            if (!(tempUser.id === req.user.id || req.user.role === 'ADMIN')) {
                console.log('Insufficient privileges:', {
                    tempUserId: tempUser.id,
                    currentUserId: req.user.id,
                    role: req.user.role,
                });
                return res.status(403).json({
                    message: 'You do not have privileges to edit this user.',
                });
            }

            // Prepare update data
            const updateData = {};

            if (req.body.name && req.body.name.trim() !== '') {
                updateData.name = req.body.name.trim();
            }

            if (req.body.username && req.body.username.trim() !== '') {
                updateData.username = req.body.username.trim();
            } // Handle avatar upload
            if (req.file) {
                console.log('🔥 AVATAR UPLOAD DETECTED');
                console.log('📸 Full file object:', JSON.stringify(req.file, null, 2));
                console.log('📁 File path:', req.file.path);
                console.log('📄 File size:', req.file.size);
                console.log('📄 File exists at path:', existsSync(req.file.path));

                // Store the path for public/images (simple solution)
                updateData.avatar = `/public/images/${req.file.filename}`;
                console.log('💾 Avatar saved to database as:', updateData.avatar);
            } else {
                console.log('❌ No file received in req.file');
            }

            // Handle password update for email users only
            if (tempUser.provider === 'email' && req.body.password && req.body.password.trim() !== '') {
                updateData.password = await hashPassword(req.body.password.trim());
                console.log('Password updated for email user');
            }

            // Check username uniqueness
            if (req.body.username && req.body.username.trim() !== '') {
                const existingUser = await User.findOne({ username: req.body.username.trim() });
                if (existingUser && existingUser.id !== tempUser.id) {
                    console.log('Username already taken:', req.body.username);
                    return res.status(400).json({ message: 'Username already taken.' });
                }
            }

            console.log('Update data prepared:', updateData);

            // Use UserService to update profile
            const result = await UserService.updateProfile(req.params.id, updateData);

            if (!result.success) {
                console.log('UserService update failed:', result);
                return res.status(400).json({
                    message: result.error || result.errors?.join(', '),
                });
            }

            console.log('Profile updated successfully:', result.user);
            res.status(200).json({ user: result.user });
        } catch (err) {
            console.error('Error updating user profile:', err);

            // Handle specific multer errors
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
            }

            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({ message: 'Too many files or unexpected field name.' });
            }

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

    // GET all addresses for a user
    async getAddresses(req, res) {
        try {
            const { id: paramId } = req.params;

            console.log('--- DEBUGGING /api/users/:id/addresses ---');
            console.log('ID from Token (req.user.id):', req.user.id, `(Type: ${typeof req.user.id})`);
            console.log('ID from URL (paramId):', paramId, `(Type: ${typeof paramId})`);

            if (req.user.id.toString() !== paramId.toString() && req.user.role !== 'ADMIN') {
                console.log('PERMISSION DENIED: IDs do not match.');
                return res.status(403).json({ message: 'Forbidden: You can only view your own addresses.' });
            }
            console.log('PERMISSION GRANTED.');

            const user = await User.findById(paramId).select('addresses');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({
                success: true,
                message: 'Addresses fetched successfully',
                data: {
                    addresses: user.addresses,
                },
            });
        } catch (error) {
            console.error('Error in getAddresses:', error);
            res.status(500).json({ message: 'Server error while fetching addresses' });
        }
    }

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
        console.log('--- DEBUGGING _checkUserPermission ---');
        console.log('ID from Token (req.user.id):', req.user.id, `(Type: ${typeof req.user.id})`);
        console.log('ID from URL (req.params.id):', req.params.id, `(Type: ${typeof req.params.id})`);

        const hasPermission = req.user.id.toString() === req.params.id.toString() || req.user.role === 'ADMIN';
        console.log('Permission result:', hasPermission);
        return hasPermission;
    }

    // Check if user is admin
    _checkAdminPermission(req) {
        return req.user.role === 'ADMIN';
    }
}

export default new UserController();
