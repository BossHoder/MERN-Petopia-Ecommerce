import { Router } from 'express';
import requireJwtAuth from '../../middleware/requireJwtAuth.js';
import requireAdmin from '../../middleware/requireAdmin.js';
import userController from '../../controllers/userController.js';
import upload from '../../utils/uploadConfig.js';

const router = Router();

// Các route cụ thể nên được đặt trước các route có tham số động như /:id hay /:username

// Route đặc biệt
router.get('/reseed', userController.reseedDatabase);
router.get('/me', requireJwtAuth, userController.getCurrentUser);
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
router.put('/bulk-update', requireJwtAuth, userController.bulkUpdateUsers);

// Routes cho ADDRESSES (có /:id/)
router.get('/:id/addresses', requireJwtAuth, userController.getAddresses);
router.post('/:id/addresses', requireJwtAuth, userController.addAddress);
router.put('/:id/addresses/:addressId', requireJwtAuth, userController.updateAddress);
router.delete('/:id/addresses/:addressId', requireJwtAuth, userController.removeAddress);
router.put('/:id/addresses/:addressId/default', requireJwtAuth, userController.setDefaultAddress);

// Routes cho WISHLIST (có /:id/)
router.post('/:id/wishlist', requireJwtAuth, userController.addToWishlist);
router.delete('/:id/wishlist/:productId', requireJwtAuth, userController.removeFromWishlist);
router.get('/:id/wishlist', requireJwtAuth, userController.getWishlist);

// Routes cho STATS & PREFERENCES (có /:id/)
router.get('/:id/stats', requireJwtAuth, userController.getUserStats);
router.put('/:id/preferences', requireJwtAuth, userController.updatePreferences);
router.get('/:id/activity', requireJwtAuth, userController.getUserActivity);

// Các route chung chung nên đặt cuối cùng
router.get('/', [requireJwtAuth, requireAdmin], userController.getUsers);
router.get('/:username', requireJwtAuth, userController.getUserByUsername); // Route này sẽ không bắt các route có /addresses nữa
router.put('/:id', [requireJwtAuth, upload.single('avatar')], userController.updateProfile);
router.delete('/:id', requireJwtAuth, userController.deleteUser);

export default router;
