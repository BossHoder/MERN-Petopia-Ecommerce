import { Router } from 'express';
import passport from 'passport';
import { errorResponse, successResponse } from '../../helpers/responseHelper.js';
import { ERROR_MESSAGES } from '../../constants/errorMessages.js';

const router = Router();

router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) {
            console.error('Login error:', err);
            return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
        }

        if (!user) {
            // Trả về thông báo lỗi cụ thể từ LocalStrategy
            const errorMessage = info?.message || 'Invalid email or password.';
            return errorResponse(res, errorMessage, 401);
        }

        try {
            const token = user.generateJWT();
            const me = user.toJSON();
            return successResponse(res, { token, me }, 'Login successful');
        } catch (error) {
            console.error('Token generation error:', error);
            return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
        }
    })(req, res, next);
});

export default router;
