import { Router } from 'express';
import requireJwtAuth from '../../middleware/requireJwtAuth.js';
import requireAdmin from '../../middleware/requireAdmin.js';
import userController from '../../controllers/userController.js';
import upload from '../../utils/uploadConfig.js';

const router = Router();

//`checkit`, which is probably the option I'd suggest if  `validatem`

router.put('/:id', [requireJwtAuth, upload.single('avatar')], userController.updateProfile);

router.get('/reseed', userController.reseedDatabase);

// Development only - promote current user to admin
router.post('/promote-admin', requireJwtAuth, (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Not allowed in production' });
    }

    req.user.role = 'ADMIN';
    req.user
        .save()
        .then(() => res.json({ message: 'User promoted to admin', user: req.user }))
        .catch((err) => res.status(500).json({ message: err.message }));
});

router.get('/me', requireJwtAuth, userController.getCurrentUser);

router.get('/:username', requireJwtAuth, userController.getUserByUsername);

router.get('/', [requireJwtAuth, requireAdmin], userController.getUsers);

router.delete('/:id', requireJwtAuth, userController.deleteUser);

// ===========================================
// WISHLIST ENDPOINTS
// ===========================================

// Add item to wishlist
router.post('/:id/wishlist', requireJwtAuth, userController.addToWishlist);

// Remove item from wishlist
router.delete('/:id/wishlist/:productId', requireJwtAuth, userController.removeFromWishlist);

// Get user's wishlist
router.get('/:id/wishlist', requireJwtAuth, userController.getWishlist);

// ===========================================
// ADDRESS ENDPOINTS
// ===========================================

// Add new address
router.post('/:id/addresses', requireJwtAuth, userController.addAddress);

// Update address
router.put('/:id/addresses/:addressId', requireJwtAuth, userController.updateAddress);

// Remove address
router.delete('/:id/addresses/:addressId', requireJwtAuth, userController.removeAddress);

// Set default address
router.put('/:id/addresses/:addressId/default', requireJwtAuth, userController.setDefaultAddress);

// ===========================================
// USER STATS & ADMIN ENDPOINTS
// ===========================================

// Get user statistics
router.get('/:id/stats', requireJwtAuth, userController.getUserStats);

// Update user preferences
router.put('/:id/preferences', requireJwtAuth, userController.updatePreferences);

// Admin: Get user activity
router.get('/:id/activity', requireJwtAuth, userController.getUserActivity);

// Admin: Bulk update users
router.put('/bulk-update', requireJwtAuth, userController.bulkUpdateUsers);

export default router;
