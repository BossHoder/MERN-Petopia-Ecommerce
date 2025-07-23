import { Router } from 'express';
import { ERROR_MESSAGES } from '../../constants/errorMessages.js';

const router = Router();

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            // Nếu có lỗi trong quá trình logout của passport, bạn có thể xử lý ở đây
            return res.status(500).json({ success: false, message: ERROR_MESSAGES.LOGOUT_FAILED });
        }
        res.status(200).json({ success: true, message: ERROR_MESSAGES.LOGOUT_SUCCESS });
    });
});

export default router;
