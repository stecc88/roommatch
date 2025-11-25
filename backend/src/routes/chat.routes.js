import express from 'express';
import { getMessages, sendMessage, getConversations, markAsRead } from '../controllers/chat.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/conversations', authenticateToken, getConversations);
router.get('/:matchId', authenticateToken, getMessages);
router.post('/', authenticateToken, sendMessage);
router.put('/:matchId/read', authenticateToken, markAsRead);

export default router;
