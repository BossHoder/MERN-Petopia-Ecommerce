import { Router } from 'express';
import usersRoutes from './users.js';
import messagesRoutes from './messages.js';
const router = Router();

router.use('/users', usersRoutes);
router.use('/messages', messagesRoutes);

export default router;
