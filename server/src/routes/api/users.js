import { Router } from 'express';
import multer from 'multer';
import { resolve } from 'path';

import requireJwtAuth from '../../middleware/requireJwtAuth.js';
import userController from '../../controllers/userController.js';
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

router.put('/:id', [requireJwtAuth, upload.single('avatar')], userController.updateProfile);

router.get('/reseed', userController.reseedDatabase);

router.get('/me', requireJwtAuth, userController.getCurrentUser);

router.get('/:username', requireJwtAuth, userController.getUserByUsername);

router.get('/', requireJwtAuth, userController.getUsers);

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
