import express from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', authenticateToken, getProfile);
router.put('/', authenticateToken, upload.single('avatar'), updateProfile);

export default router;
