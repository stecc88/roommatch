import prisma from '../prisma/client.js';

export const getConversations = async (req, res) => {
    const userId = req.user.id;

    try {
        if (userId === -1 || req.user?.email?.endsWith('@demo.com')) {
            return res.json([
                {
                    id: 7001,
                    otherUser: { id: 1002, name: 'Marco Demo', avatar: 'https://i.pravatar.cc/300?u=marco' },
                    lastMessage: { id: 1, content: 'Ciao! 👋', createdAt: new Date().toISOString() },
                    unreadCount: 0
                }
            ]);
        }
        const matches = await prisma.match.findMany({
            where: {
                OR: [
                    { user1Id: userId },
                    { user2Id: userId }
                ]
            },
            include: {
                user1: { select: { id: true, name: true, avatar: true } },
                user2: { select: { id: true, name: true, avatar: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        const conversations = await Promise.all(matches.map(async (m) => {
            const unreadCount = await prisma.message.count({
                where: { matchId: m.id, receiverId: userId, read: false }
            });
            return {
                id: m.id,
                otherUser: m.user1Id === userId ? m.user2 : m.user1,
                lastMessage: m.messages[0] || null,
                unreadCount
            };
        }));

        res.json(conversations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
};

export const getMessages = async (req, res) => {
    const { matchId } = req.params;
    try {
        if (req.user?.id === -1 || req.user?.email?.endsWith('@demo.com')) {
            const id = parseInt(matchId)
            const demo = [
                { id: 1, matchId: id, senderId: 1002, receiverId: -1, content: 'Ciao! 👋', createdAt: new Date().toISOString(), sender: { id: 1002, name: 'Marco Demo', avatar: 'https://i.pravatar.cc/300?u=marco' } },
                { id: 2, matchId: id, senderId: -1, receiverId: 1002, content: 'Hola! ¿Cómo estás?', createdAt: new Date().toISOString(), sender: { id: -1, name: 'Demo User', avatar: 'https://i.pravatar.cc/300?u=demo' } },
            ]
            return res.json(demo)
        }
        const messages = await prisma.message.findMany({
            where: { matchId: parseInt(matchId) },
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { id: true, name: true, avatar: true } } }
        });
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

export const sendMessage = async (req, res) => {
    const { matchId, content, receiverId } = req.body;
    const senderId = req.user.id;

    try {
        if (senderId === -1 || req.user?.email?.endsWith('@demo.com')) {
            const message = {
                id: Math.floor(Math.random() * 100000),
                matchId: parseInt(matchId),
                senderId,
                receiverId: parseInt(receiverId),
                content,
                createdAt: new Date().toISOString(),
                sender: { id: senderId, name: 'Demo User', avatar: 'https://i.pravatar.cc/300?u=demo' }
            }
            try {
                const { io } = await import('../app.js');
                io.to(String(receiverId)).emit('new_message', {
                    matchId: parseInt(matchId),
                    senderName: message.sender.name,
                    content: message.content
                });
            } catch {}
            return res.json(message)
        }
        const message = await prisma.message.create({
            data: {
                matchId: parseInt(matchId),
                senderId,
                receiverId: parseInt(receiverId),
                content
            },
            include: { sender: { select: { id: true, name: true, avatar: true } } }
        });

        const { io } = await import('../app.js');
        io.to(receiverId.toString()).emit('new_message', {
            matchId: parseInt(matchId),
            senderName: message.sender.name,
            content: message.content
        });

        res.json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

export const markAsRead = async (req, res) => {
    const { matchId } = req.params;
    const userId = req.user.id;
    try {
        if (userId === -1 || req.user?.email?.endsWith('@demo.com')) {
            return res.json({ success: true })
        }
        await prisma.message.updateMany({
            where: { matchId: parseInt(matchId), receiverId: userId, read: false },
            data: { read: true }
        });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
};
