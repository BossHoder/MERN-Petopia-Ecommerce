import { Router } from 'express';

const router = Router();

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            // Nếu có lỗi trong quá trình logout của passport, bạn có thể xử lý ở đây
            return res.status(500).json({ success: false, message: 'Logout failed.' });
        }
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    });
});

export default router;
