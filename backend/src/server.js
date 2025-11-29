import dotenv from 'dotenv';

dotenv.config();

import { httpServer } from './app.js';
import prisma from './prisma/client.js';
import bcrypt from 'bcryptjs';

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (process.env.SEED_DEMO_REAL === 'true') {
        (async () => {
            try {
                const ownerEmail = 'owner1@demo.com';
                const seekerEmail = 'seeker1@demo.com';
                let owner = await prisma.user.findUnique({ where: { email: ownerEmail } });
                if (!owner) {
                    const hashed = await bcrypt.hash('password123', 10);
                    owner = await prisma.user.create({
                        data: {
                            email: ownerEmail,
                            password: hashed,
                            name: 'Demo Propietario',
                            role: 'OWNER',
                            birthDate: new Date(1995, 0, 1),
                            gender: 'HOMBRE',
                            bio: 'Cuenta demo real',
                            profilePhotos: [
                                'https://i.pravatar.cc/300?u=owner1-1',
                                'https://i.pravatar.cc/300?u=owner1-2'
                            ],
                            cityActual: 'Milano',
                            ciudadBusquedaPiso: 'Milano',
                            prefieroCompartirCon: 'INDISTINTO',
                            appModes: ['SOLO_COMPARTIR_PISO'],
                            objetivoConvivencia: [],
                            interests: ['Musica'],
                            languages: ['Italiano'],
                            presupuestoAproximado: 650
                        }
                    });
                }
                let seeker = await prisma.user.findUnique({ where: { email: seekerEmail } });
                if (!seeker) {
                    const hashed = await bcrypt.hash('password123', 10);
                    seeker = await prisma.user.create({
                        data: {
                            email: seekerEmail,
                            password: hashed,
                            name: 'Demo Buscador',
                            role: 'SEEKER',
                            birthDate: new Date(1996, 5, 1),
                            gender: 'HOMBRE',
                            bio: 'Cuenta demo real',
                            profilePhotos: [
                                'https://i.pravatar.cc/300?u=seeker1-1',
                                'https://i.pravatar.cc/300?u=seeker1-2'
                            ],
                            cityActual: 'Roma',
                            ciudadBusquedaPiso: 'Roma',
                            prefieroCompartirCon: 'INDISTINTO',
                            appModes: ['SOLO_COMPARTIR_PISO'],
                            objetivoConvivencia: [],
                            interests: ['Tecnologia'],
                            languages: ['Italiano'],
                            presupuestoAproximado: 700
                        }
                    });
                }
                let listing = await prisma.listing.findFirst({ where: { ownerId: owner.id } });
                if (!listing) {
                    listing = await prisma.listing.create({
                        data: {
                            ownerId: owner.id,
                            title: 'Stanza luminosa in centro',
                            description: 'Camera ammobiliata vicino al Duomo',
                            price: 650,
                            location: 'Milano',
                            images: ['https://picsum.photos/seed/room1/600/400'],
                            amenities: ['WiFi','Ascensore'],
                            rules: ['No Fumatori'],
                            availableFrom: null,
                            roomType: 'SINGLE'
                        }
                    });
                }
                let match = await prisma.match.findFirst({
                    where: {
                        OR: [
                            { user1Id: owner.id, user2Id: seeker.id },
                            { user1Id: seeker.id, user2Id: owner.id }
                        ],
                        listingId: listing.id
                    }
                });
                if (!match) {
                    const user1Id = owner.id < seeker.id ? owner.id : seeker.id;
                    const user2Id = owner.id < seeker.id ? seeker.id : owner.id;
                    match = await prisma.match.create({
                        data: { user1Id, user2Id, listingId: listing.id }
                    });
                }
                const existingMessages = await prisma.message.count({ where: { matchId: match.id } });
                if (!existingMessages) {
                    await prisma.message.create({
                        data: {
                            matchId: match.id,
                            senderId: owner.id,
                            receiverId: seeker.id,
                            content: 'Ciao! La stanza è disponibile.'
                        }
                    });
                    await prisma.message.create({
                        data: {
                            matchId: match.id,
                            senderId: seeker.id,
                            receiverId: owner.id,
                            content: 'Perfetto! Quando posso visitarla?'
                        }
                    });
                }
            } catch {}
        })();
    }
});
