import { Router } from 'express';

import requireLocalAuth from '../../middleware/requireLocalAuth.js';

const router = Router();

router.post('/login', requireLocalAuth, (req, res) => {
    const token = req.user.generateJWT();
    const me = req.user.toJSON();
    res.json({ token, me });
});

export default router;
