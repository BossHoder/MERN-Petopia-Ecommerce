import { ERROR_MESSAGES } from '../constants/errorMessages.js';
import { unauthorizedResponse } from '../helpers/responseHelper.js';
import passport from 'passport';

const requireJwtAuth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return unauthorizedResponse(res, ERROR_MESSAGES.UNAUTHORIZED);
        }
        req.user = user;
        next();
    })(req, res, next);
};

export default requireJwtAuth;
