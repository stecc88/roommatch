import prisma from '../prisma/client.js';
import { Prisma } from '@prisma/client'

export const getProfile = async (req, res) => {
    const userId = req.user.id;
    try {
        if (userId === -1 || req.user?.email?.endsWith('@demo.com')) {
            return res.json({
                id: -1,
                email: req.user.email || 'demo@demo.com',
                name: req.user.name || 'Demo User',
                role: req.user.role || 'SEEKER',
                bio: 'Cuenta demo',
                avatar: 'https://i.pravatar.cc/300?u=demo',
                profilePhotos: [
                    'https://i.pravatar.cc/300?u=demo-1',
                    'https://i.pravatar.cc/300?u=demo-2',
                ],
                listings: [],
            });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                listings: true
            }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

export const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { name, bio, birthDate, gender, occupation, lifestyle, preferences } = req.body;

    let avatarUrl;
    if (req.file) {
        avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                bio,
                avatar: avatarUrl, // Update avatar only if new file uploaded
                birthDate: birthDate ? new Date(birthDate) : undefined,
                gender,
                occupation,
                lifestyle: lifestyle ? JSON.parse(lifestyle) : undefined, // Handle JSON strings if sent as form-data
                preferences: preferences ? JSON.parse(preferences) : undefined
            }
        });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

export const getDiscover = async (req, res) => {
    const userId = req.user.id;
    const { limit = 20, offset = 0, city, role, mode } = req.query;

    try {
        if (userId === -1 || req.user?.email?.endsWith('@demo.com')) {
            const demoCandidates = [
                {
                    id: 1001,
                    name: 'Alice Demo',
                    avatar: 'https://i.pravatar.cc/300?u=alice',
                    ciudadBusquedaPiso: 'Milano',
                    quiereMudarseDesde: null,
                    presupuestoAproximado: 650,
                    occupation: 'Studente',
                    universidadEscuela: 'Politecnico di Milano',
                    bio: 'Mi piace fare sport e cucinare',
                    lifestyle: { smoker: false, pets: false },
                    interests: ['Musica', 'Sport'],
                    languages: ['Italiano', 'Inglese'],
                    compatibility: 85,
                    profilePhotos: ['https://i.pravatar.cc/300?u=alice-1','https://i.pravatar.cc/300?u=alice-2'],
                },
                {
                    id: 1002,
                    name: 'Marco Demo',
                    avatar: 'https://i.pravatar.cc/300?u=marco',
                    ciudadBusquedaPiso: 'Roma',
                    quiereMudarseDesde: null,
                    presupuestoAproximado: 700,
                    occupation: 'Developer',
                    universidadEscuela: 'Sapienza',
                    bio: 'Amo la tecnologia e i viaggi',
                    lifestyle: { smoker: false, pets: true },
                    interests: ['Tecnologia', 'Viaggi'],
                    languages: ['Italiano', 'Inglese'],
                    compatibility: 78,
                    profilePhotos: ['https://i.pravatar.cc/300?u=marco-1','https://i.pravatar.cc/300?u=marco-2'],
                },
            ];
            return res.json(demoCandidates);
        }
        const me = await prisma.user.findUnique({ where: { id: userId } });

        const likedIds = await prisma.like.findMany({
            where: { fromUserId: userId },
            select: { toUserId: true }
        });
        const likedSet = new Set(likedIds.map(l => l.toUserId).filter(Boolean));

        const matched = await prisma.match.findMany({
            where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
            select: { user1Id: true, user2Id: true }
        });
        const matchedSet = new Set(matched.flatMap(m => [m.user1Id, m.user2Id]).filter(id => id !== userId));

        const where = {
            NOT: { id: userId },
        };
        if (city) {
            where.OR = [
                { ciudadBusquedaPiso: { contains: city, mode: 'insensitive' } },
                { cityActual: { contains: city, mode: 'insensitive' } }
            ];
        }
        if (role && ['OWNER', 'SEEKER', 'BOTH'].includes(role)) {
            where.role = role;
        }
        if (mode && ['SOLO_COMPARTIR_PISO', 'PISO_Y_AMISTADES', 'PISO_Y_CITAS'].includes(mode)) {
            where.appModes = { has: mode };
        }

        const candidates = await prisma.user.findMany({
            where,
            skip: Number(offset),
            take: Number(limit),
        });

        const score = (a, b) => {
            let s = 0;
            const cityBoost = (x, y) => (x && y && x.split('-')[0].trim().toLowerCase() === y.split('-')[0].trim().toLowerCase()) ? 1 : 0;
            if (cityBoost(a.cityActual, b.ciudadBusquedaPiso) || cityBoost(a.ciudadBusquedaPiso, b.cityActual)) s += 20;

            const rolePair = (r1, r2) => {
                const pairs = new Set([
                    `OWNER-SEEKER`, `SEEKER-OWNER`,
                    `BOTH-OWNER`, `OWNER-BOTH`, `BOTH-SEEKER`, `SEEKER-BOTH`,
                    `BOTH-BOTH`, `OWNER-OWNER`, `SEEKER-SEEKER`
                ]);
                return pairs.has(`${r1}-${r2}`);
            };
            if (rolePair(a.role, b.role)) s += 15;

            if (a.prefieroCompartirCon === 'INDISTINTO' || b.gender === 'PREFIERO_NO_DECIR' ||
                (a.prefieroCompartirCon === 'SOLO_HOMBRES' && b.gender === 'HOMBRE') ||
                (a.prefieroCompartirCon === 'SOLO_MUJERES' && b.gender === 'MUJER')) {
                s += 10;
            }

            const appModeOverlap = (a.appModes || []).filter(x => (b.appModes || []).includes(x)).length;
            if (appModeOverlap > 0) s += 15;

            const objOverlap = (a.objetivoConvivencia || []).filter(x => (b.objetivoConvivencia || []).includes(x)).length;
            s += Math.min(10, objOverlap * 5);

            const interestOverlap = (a.interests || []).filter(x => (b.interests || []).includes(x)).length;
            s += Math.min(10, interestOverlap * 2);

            const langOverlap = (a.languages || []).filter(x => (b.languages || []).includes(x)).length;
            s += Math.min(5, langOverlap * 1.5);

            const age = (d) => d ? (new Date().getFullYear() - new Date(d).getFullYear()) : null;
            const a1 = age(a.birthDate), a2 = age(b.birthDate);
            if (a1 && a2) {
                const diff = Math.abs(a1 - a2);
                s -= Math.min(10, Math.max(0, diff - 10));
            }

            return Math.max(0, Math.min(100, Math.round(s)));
        };

        const formatted = candidates
            .filter(c => !likedSet.has(c.id) && !matchedSet.has(c.id))
            .map(c => ({
                id: c.id,
                name: c.name,
                avatar: c.avatar,
                ciudadBusquedaPiso: c.ciudadBusquedaPiso,
                quiereMudarseDesde: c.quiereMudarseDesde,
                presupuestoAproximado: c.presupuestoAproximado,
                occupation: c.occupation,
                universidadEscuela: c.universidadEscuela,
                bio: c.bio,
                lifestyle: c.lifestyle,
                interests: c.interests,
                languages: c.languages,
                compatibility: score(me, c),
                profilePhotos: c.profilePhotos,
            }));

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch discover' });
    }
};
