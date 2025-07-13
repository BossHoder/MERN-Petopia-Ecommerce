import { Router } from 'express';

const router = Router();

router.get('/logout', (req, res) => {
    req.logout();
    res.send(false);
});

export default router;
