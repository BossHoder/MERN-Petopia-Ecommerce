import { ERROR_MESSAGES } from '../constants/errorMessages.js';
import { forbiddenResponse } from '../helpers/responseHelper.js';

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return forbiddenResponse(res, ERROR_MESSAGES.FORBIDDEN);
    }
    next();
};

export default requireAdmin;
