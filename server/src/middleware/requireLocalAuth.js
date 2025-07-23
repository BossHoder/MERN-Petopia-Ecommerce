import { ERROR_MESSAGES } from '../constants/errorMessages.js';
import { unauthorizedResponse } from '../helpers/responseHelper.js';

const requireLocalAuth = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return unauthorizedResponse(res, ERROR_MESSAGES.UNAUTHORIZED);
    }
    next();
};

export default requireLocalAuth;
