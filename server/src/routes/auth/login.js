import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
    const token = req.user.generateJWT();
    const me = req.user.toJSON();
    res.json({ token, me });
});

export default router;
