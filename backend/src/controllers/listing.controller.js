import prisma from '../prisma/client.js';

export const createListing = async (req, res) => {
    const { title, description, price, location, images, amenities, rules, availableFrom, roomType } = req.body;
    const ownerId = req.user.id;

    try {
        const uploadedImages = (req.files || []).map(f => `${req.protocol}://${req.get('host')}/uploads/${f.filename}`);
        const listing = await prisma.listing.create({
            data: {
                title,
                description,
                price: price !== undefined ? parseFloat(price) : 0,
                location,
                images: uploadedImages.length ? uploadedImages : (images || []),
                amenities: Array.isArray(amenities) ? amenities : (amenities ? amenities.split(',').map(a => a.trim()).filter(Boolean) : []),
                rules: Array.isArray(rules) ? rules : (rules ? rules.split(',').map(r => r.trim()).filter(Boolean) : []),
                availableFrom: availableFrom ? new Date(availableFrom) : null,
                roomType: roomType || null,
                ownerId
            }
        });
        res.json(listing);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create listing' });
    }
};

export const getListings = async (req, res) => {
    try {
        const { q, priceMin, priceMax, location, amenities, rules, availableFrom, immediate, roomType } = req.query;

        const where = {};

        // Text search across title, description, and location
        if (q && typeof q === 'string' && q.trim()) {
            where.OR = [
                { title: { contains: q.trim(), mode: 'insensitive' } },
                { description: { contains: q.trim(), mode: 'insensitive' } },
                { location: { contains: q.trim(), mode: 'insensitive' } },
            ];
        }

        // Location filter
        if (location && typeof location === 'string' && location.trim()) {
            where.location = { contains: location.trim(), mode: 'insensitive' };
        }

        // Price range
        if (priceMin || priceMax) {
            where.price = {};
            if (priceMin) where.price.gte = parseFloat(priceMin);
            if (priceMax) where.price.lte = parseFloat(priceMax);
        }

        // Availability filters
        if (availableFrom) {
            const date = new Date(availableFrom);
            if (!isNaN(date)) {
                where.availableFrom = { lte: date };
            }
        } else if (immediate === 'true') {
            const now = new Date();
            // Either availableFrom is null or already past
            const existingOr = where.OR || [];
            where.OR = [
                ...existingOr,
                { availableFrom: null },
                { availableFrom: { lte: now } }
            ];
        }

        // Array filters: amenities and rules
        if (amenities) {
            const amenArr = Array.isArray(amenities)
                ? amenities
                : String(amenities)
                    .split(',')
                    .map(a => a.trim())
                    .filter(Boolean);
            if (amenArr.length) {
                where.amenities = { hasSome: amenArr };
            }
        }

        if (rules) {
            const rulesArr = Array.isArray(rules)
                ? rules
                : String(rules)
                    .split(',')
                    .map(r => r.trim())
                    .filter(Boolean);
            if (rulesArr.length) {
                where.rules = { hasSome: rulesArr };
            }
        }

        // Room type filter
        if (roomType && typeof roomType === 'string' && roomType.trim()) {
            where.roomType = roomType.trim();
        }

        const listings = await prisma.listing.findMany({
            where,
            include: { owner: { select: { name: true, avatar: true } } }
        });
        res.json(listings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch listings' });
    }
};

export const getListingById = async (req, res) => {
    const { id } = req.params;
    try {
        const listing = await prisma.listing.findUnique({
            where: { id: parseInt(id) },
            include: { owner: { select: { name: true, avatar: true, email: true } } }
        });
        if (!listing) return res.status(404).json({ error: 'Listing not found' });
        res.json(listing);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch listing' });
    }
};

export const updateListing = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, price, location, images, amenities, rules, availableFrom, roomType } = req.body;

    try {
        const existing = await prisma.listing.findUnique({ where: { id: parseInt(id) } });
        if (!existing) return res.status(404).json({ error: 'Listing not found' });
        if (existing.ownerId !== userId) return res.status(403).json({ error: 'Forbidden' });

        const updated = await prisma.listing.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                price: price !== undefined ? parseFloat(price) : undefined,
                location,
                images: (req.files && req.files.length) ? req.files.map(f => `${req.protocol}://${req.get('host')}/uploads/${f.filename}`) : (images || undefined),
                amenities: Array.isArray(amenities) ? amenities : (amenities ? amenities.split(',').map(a => a.trim()).filter(Boolean) : undefined),
                rules: Array.isArray(rules) ? rules : (rules ? rules.split(',').map(r => r.trim()).filter(Boolean) : undefined),
                availableFrom: availableFrom ? new Date(availableFrom) : undefined,
                roomType: roomType || undefined,
            }
        });
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update listing' });
    }
};

export const deleteListing = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const existing = await prisma.listing.findUnique({ where: { id: parseInt(id) } });
        if (!existing) return res.status(404).json({ error: 'Listing not found' });
        if (existing.ownerId !== userId) return res.status(403).json({ error: 'Forbidden' });
        await prisma.listing.delete({ where: { id: parseInt(id) } });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete listing' });
    }
};

export const toggleFavorite = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const listingId = parseInt(id);
    try {
        const listing = await prisma.listing.findUnique({ where: { id: listingId } });
        if (!listing) return res.status(404).json({ error: 'Listing not found' });

        const existing = await prisma.favorite.findFirst({ where: { userId, listingId } });
        let favorited;
        if (existing) {
            await prisma.favorite.delete({ where: { id: existing.id } });
            favorited = false;
        } else {
            await prisma.favorite.create({ data: { userId, listingId } });
            favorited = true;
        }

        const count = await prisma.favorite.count({ where: { listingId } });
        res.json({ favorited, count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to toggle favorite' });
    }
};

export const getFavoriteListings = async (req, res) => {
    const userId = req.user.id;
    try {
        const favorites = await prisma.favorite.findMany({
            where: { userId },
            include: {
                listing: { include: { owner: { select: { name: true, avatar: true } } } }
            }
        });

        const listings = favorites.map(f => f.listing);
        res.json(listings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
};
