import { Router } from 'express';
import multer from 'multer';
import { resolve } from 'path';

import requireJwtAuth from '../../middleware/requireJwtAuth.js';
import User, { hashPassword, validateUser } from '../../models/User.js';
import UserService from '../../services/userService.js';
// import { seedDb } from '../../utils/seed';

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resolve(__dirname, '../../../public/images'));
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, `avatar-${Date.now()}-${fileName}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  },
});

//`checkit`, which is probably the option I'd suggest if  `validatem`

router.put('/:id', [requireJwtAuth, upload.single('avatar')], async (req, res, next) => {
  try {
    const tempUser = await User.findById(req.params.id);
    if (!tempUser) return res.status(404).json({ message: 'No such user.' });
    if (!(tempUser.id === req.user.id || req.user.role === 'ADMIN'))
      return res.status(400).json({ message: 'You do not have privileges to edit this user.' });

    // Prepare update data
    const updateData = {
      name: req.body.name,
      username: req.body.username
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
        message: result.error || result.errors?.join(', ') 
      });
    }

    res.status(200).json({ user: result.user });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

router.get('/reseed', async (req, res) => {
  // await seedDb(); // Tạm thời comment out
  res.json({ message: 'Database reseed functionality temporarily disabled.' });
});

router.get('/me', requireJwtAuth, async (req, res) => {
  try {
    const result = await UserService.getUser(req.user.id, false);
    
    if (!result.success) {
      return res.status(404).json({ message: result.error });
    }

    res.json({ me: result.user });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

router.get('/:username', requireJwtAuth, async (req, res) => {
  try {
    const result = await UserService.getUser(req.params.username, true);
    
    if (!result.success) {
      return res.status(404).json({ message: result.error });
    }

    res.json({ user: result.user });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

router.get('/', requireJwtAuth, async (req, res) => {
  try {
    // Parse query parameters for pagination and filtering
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
      role: req.query.role,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined
    };

    // Check if it's a search request
    if (req.query.search) {
      const result = await UserService.searchUsers(req.query.search, options);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      return res.json({
        users: result.users,
        pagination: result.pagination
      });
    }

    // Regular get all users with pagination
    const result = await UserService.getUsers(options);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.json({
      users: result.users,
      pagination: result.pagination
    });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

router.delete('/:id', requireJwtAuth, async (req, res) => {
  try {
    const tempUser = await User.findById(req.params.id);
    if (!tempUser) return res.status(404).json({ message: 'No such user.' });
    if (!(tempUser.id === req.user.id || req.user.role === 'ADMIN'))
      return res.status(400).json({ message: 'You do not have privileges to delete that user.' });

    // Use UserService to delete user
    const result = await UserService.deleteUser(req.params.id);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.status(200).json({ message: result.message });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

// ===========================================
// WISHLIST ENDPOINTS
// ===========================================

// Add item to wishlist
router.post('/:id/wishlist', requireJwtAuth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const result = await UserService.addToWishlist(req.params.id, req.body.productId);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

// Remove item from wishlist
router.delete('/:id/wishlist/:productId', requireJwtAuth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const result = await UserService.removeFromWishlist(req.params.id, req.params.productId);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

// Get user's wishlist
router.get('/:id/wishlist', requireJwtAuth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const result = await UserService.getWishlist(req.params.id);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

// ===========================================
// ADDRESS ENDPOINTS
// ===========================================

// Add new address
router.post('/:id/addresses', requireJwtAuth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const result = await UserService.addAddress(req.params.id, req.body);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

// Update address
router.put('/:id/addresses/:addressId', requireJwtAuth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const result = await UserService.updateAddress(req.params.id, req.params.addressId, req.body);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

// Remove address
router.delete('/:id/addresses/:addressId', requireJwtAuth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const result = await UserService.removeAddress(req.params.id, req.params.addressId);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

// Set default address
router.put('/:id/addresses/:addressId/default', requireJwtAuth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const result = await UserService.setDefaultAddress(req.params.id, req.params.addressId);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

// ===========================================
// USER STATS & ADMIN ENDPOINTS
// ===========================================

// Get user statistics
router.get('/:id/stats', requireJwtAuth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const result = await UserService.getUserStats(req.params.id);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

// Update user preferences
router.put('/:id/preferences', requireJwtAuth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const result = await UserService.updatePreferences(req.params.id, req.body);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

// Admin: Get user activity
router.get('/:id/activity', requireJwtAuth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const result = await UserService.getUserActivity(req.params.id, options);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

// Admin: Bulk update users
router.put('/bulk-update', requireJwtAuth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const result = await UserService.bulkUpdateUsers(req.body.updates);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

export default router;
