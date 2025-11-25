import express from 'express';
import { createListing, getListings, getListingById, updateListing, deleteListing, toggleFavorite, getFavoriteListings } from '../controllers/listing.controller.js';
import upload from '../middleware/upload.middleware.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticateToken, upload.array('images', 6), createListing);
router.get('/', getListings);
router.get('/favorites', authenticateToken, getFavoriteListings);
router.get('/:id', getListingById);
router.put('/:id', authenticateToken, upload.array('images', 6), updateListing);
router.delete('/:id', authenticateToken, deleteListing);
router.post('/:id/favorite', authenticateToken, toggleFavorite);

export default router;
