import prisma from '../prisma/client.js';

export const like = async (req, res) => {
    const { listingId, targetUserId } = req.body;
    const fromUserId = req.user.id;

    try {
        // Create the like
        await prisma.like.create({
            data: {
                fromUserId,
                toListingId: listingId ? parseInt(listingId) : null,
                toUserId: targetUserId ? parseInt(targetUserId) : null
            }
        });

        // Check for match
        let match = null;

        if (listingId) {
            // Seeker liked a listing. Check if owner liked seeker.
            const listing = await prisma.listing.findUnique({ where: { id: parseInt(listingId) } });
            if (listing) {
                const ownerLike = await prisma.like.findFirst({
                    where: {
                        fromUserId: listing.ownerId,
                        toUserId: fromUserId
                    }
                });

                if (ownerLike) {
                    // It's a match!
                    const user1Id = fromUserId < listing.ownerId ? fromUserId : listing.ownerId;
                    const user2Id = fromUserId < listing.ownerId ? listing.ownerId : fromUserId;

                    // Check if match already exists
                    const existingMatch = await prisma.match.findFirst({
                        where: { user1Id, user2Id, listingId: parseInt(listingId) }
                    });

                    if (!existingMatch) {
                        match = await prisma.match.create({
                            data: {
                                user1Id,
                                user2Id,
                                listingId: parseInt(listingId)
                            }
                        });

                        const otherForUser1 = await prisma.user.findUnique({ where: { id: user2Id }, select: { id: true, name: true, avatar: true } });
                        const otherForUser2 = await prisma.user.findUnique({ where: { id: user1Id }, select: { id: true, name: true, avatar: true } });
                        const { io } = await import('../app.js');
                        io.to(user1Id.toString()).emit('new_match', { withUser: otherForUser1, matchId: match.id });
                        io.to(user2Id.toString()).emit('new_match', { withUser: otherForUser2, matchId: match.id });
                    }
                }
            }
        } else if (targetUserId) {
            // Owner liked a seeker. Check if seeker liked any of owner's listings.
            const myListings = await prisma.listing.findMany({ where: { ownerId: fromUserId } });
            const myListingIds = myListings.map(l => l.id);

            const seekerLike = await prisma.like.findFirst({
                where: {
                    fromUserId: parseInt(targetUserId),
                    toListingId: { in: myListingIds }
                }
            });

            if (seekerLike) {
                // It's a match!
                const user1Id = fromUserId < parseInt(targetUserId) ? fromUserId : parseInt(targetUserId);
                const user2Id = fromUserId < parseInt(targetUserId) ? parseInt(targetUserId) : fromUserId;

                const existingMatch = await prisma.match.findFirst({
                    where: { user1Id, user2Id, listingId: seekerLike.toListingId }
                });

                if (!existingMatch) {
                    match = await prisma.match.create({
                        data: {
                            user1Id,
                            user2Id,
                            listingId: seekerLike.toListingId
                        }
                    });

                    const otherForUser1 = await prisma.user.findUnique({ where: { id: user2Id }, select: { id: true, name: true, avatar: true } });
                    const otherForUser2 = await prisma.user.findUnique({ where: { id: user1Id }, select: { id: true, name: true, avatar: true } });
                    const { io } = await import('../app.js');
                    io.to(user1Id.toString()).emit('new_match', { withUser: otherForUser1, matchId: match.id });
                    io.to(user2Id.toString()).emit('new_match', { withUser: otherForUser2, matchId: match.id });
                }
            }
        }

        res.json({ success: true, match });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process like' });
    }
};

export const getMatches = async (req, res) => {
    const userId = req.user.id;

    try {
        const matches = await prisma.match.findMany({
            where: {
                OR: [
                    { user1Id: userId },
                    { user2Id: userId }
                ]
            },
            include: {
                user1: { select: { id: true, name: true, avatar: true, email: true, birthDate: true, bio: true } },
                user2: { select: { id: true, name: true, avatar: true, email: true, birthDate: true, bio: true } },
            }
        });

        const formattedMatches = matches.map(m => {
            const otherUser = m.user1Id === userId ? m.user2 : m.user1;
            return {
                id: m.id,
                otherUser,
                listingId: m.listingId,
                createdAt: m.createdAt
            };
        });

        res.json(formattedMatches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
};

export const getIncomingLikes = async (req, res) => {
    const userId = req.user.id;
    try {
        const likes = await prisma.like.findMany({
            where: { toUserId: userId },
            include: { fromUser: { select: { id: true, name: true, avatar: true, bio: true } } }
        });
        const matchedPairs = await prisma.match.findMany({
            where: { OR: [{ user1Id: userId }, { user2Id: userId }] }
        });
        const matchedSet = new Set(matchedPairs.flatMap(m => [m.user1Id, m.user2Id]));
        const formatted = likes
            .filter(l => !matchedSet.has(l.fromUserId))
            .map(l => ({ id: l.id, user: l.fromUser, createdAt: l.createdAt }));
        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch incoming likes' });
    }
};

export const getOutgoingLikes = async (req, res) => {
    const userId = req.user.id;
    try {
        const likes = await prisma.like.findMany({
            where: { fromUserId: userId },
            include: { toUser: { select: { id: true, name: true, avatar: true, bio: true } } }
        });
        const matchedPairs = await prisma.match.findMany({
            where: { OR: [{ user1Id: userId }, { user2Id: userId }] }
        });
        const matchedSet = new Set(matchedPairs.flatMap(m => [m.user1Id, m.user2Id]));
        const formatted = likes
            .filter(l => l.toUserId && !matchedSet.has(l.toUserId))
            .map(l => ({ id: l.id, user: l.toUser, createdAt: l.createdAt }));
        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch outgoing likes' });
    }
};
