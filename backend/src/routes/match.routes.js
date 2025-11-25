import express from 'express';
import { like, getMatches, getIncomingLikes, getOutgoingLikes } from '../controllers/match.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/like', authenticateToken, like);
router.get('/', authenticateToken, getMatches);
router.get('/incoming', authenticateToken, getIncomingLikes);
router.get('/outgoing', authenticateToken, getOutgoingLikes);

export default router;
