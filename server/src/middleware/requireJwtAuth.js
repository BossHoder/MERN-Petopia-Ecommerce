import { ERROR_MESSAGES } from '../constants/errorMessages.js';
import { unauthorizedResponse } from '../helpers/responseHelper.js';
import passport from 'passport';

const requireJwtAuth = (req, res, next) => {
    const token = req.headers['x-auth-token'];
    console.log('🔐 JWT Auth Debug:', {
        path: req.path,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
    });

    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            console.error('JWT Auth Error:', err);
            return next(err);
        }
        if (!user) {
            console.log('JWT Auth Failed:', info);
            return unauthorizedResponse(res, ERROR_MESSAGES.UNAUTHORIZED);
        }
        console.log('✅ JWT Auth Success:', { userId: user._id, role: user.role });
        req.user = user;
        next();
    })(req, res, next);
};

export default requireJwtAuth;
