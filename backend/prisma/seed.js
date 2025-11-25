import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // Clean up existing data
    await prisma.message.deleteMany();
    await prisma.match.deleteMany();
    await prisma.like.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.user.deleteMany();

    const pass = await bcrypt.hash('password123', 10);
    const usersData = [
        {
            email: 'owner1@demo.com', name: 'Carlos Propietario', role: 'OWNER', birthDate: new Date('1987-04-12'), gender: 'HOMBRE',
            cityActual: 'Madrid - Centro', ciudadBusquedaPiso: 'Madrid - Sol', prefieroCompartirCon: 'INDISTINTO',
            appModes: ['SOLO_COMPARTIR_PISO','PISO_Y_AMISTADES'], objetivoConvivencia: ['CONVIVENCIA_TRANQUILA','LARGO_PLAZO'],
            interests: ['Música','Leer','Cocinar'], languages: ['Español','Inglés'], presupuestoAproximado: 600,
            origen: 'Madrid, España', occupation: 'Arquitecto', universidadEscuela: 'UPM', quiereMudarseDesde: new Date(),
            bio: 'Tengo un departamento genial en el centro.', profilePhotos: [
                'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=800',
                'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=800'
            ], lifestyle: { actividadSocial: 'A_VECES_INVITA', mascotas: 'ACEPTA', huespedes: 'A_VECES', presenciaCasa: 'EQUILIBRADO', fuma: 'NO', limpieza: 'NORMAL' }
        },
        {
            email: 'owner2@demo.com', name: 'Lucía Dueña', role: 'OWNER', birthDate: new Date('1990-11-02'), gender: 'MUJER',
            cityActual: 'Barcelona - Eixample', ciudadBusquedaPiso: 'Barcelona - Gràcia', prefieroCompartirCon: 'SOLO_MUJERES',
            appModes: ['SOLO_COMPARTIR_PISO'], objetivoConvivencia: ['CONVIVENCIA_TRANQUILA'],
            interests: ['Arte','Cine','Música'], languages: ['Español','Francés'], presupuestoAproximado: 700,
            origen: 'Barcelona, España', occupation: 'Diseñadora', universidadEscuela: 'UB', quiereMudarseDesde: new Date(),
            bio: 'Busco compañera tranquila y ordenada.', profilePhotos: [
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800',
                'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=800'
            ], lifestyle: { actividadSocial: 'TRANQUILO', mascotas: 'NO_ACEPTA', huespedes: 'CASI_NUNCA', presenciaCasa: 'MUCHO_EN_CASA', fuma: 'NO', limpieza: 'MUY_ORDENADO' }
        },
        {
            email: 'owner3@demo.com', name: 'Diego Host', role: 'OWNER', birthDate: new Date('1984-07-23'), gender: 'HOMBRE',
            cityActual: 'Buenos Aires - Palermo', ciudadBusquedaPiso: 'Buenos Aires - Belgrano', prefieroCompartirCon: 'INDISTINTO',
            appModes: ['PISO_Y_AMISTADES'], objetivoConvivencia: ['AMBIENTE_SOCIAL'],
            interests: ['Videojuegos','Gimnasio'], languages: ['Español','Inglés'], presupuestoAproximado: 500,
            origen: 'Argentina', occupation: 'Dev', universidadEscuela: 'UBA', quiereMudarseDesde: new Date(),
            bio: 'Me gusta compartir y hacer amigos.', profilePhotos: [
                'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=800',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800'
            ], lifestyle: { actividadSocial: 'MUY_SOCIAL', mascotas: 'LE_GUSTAN', huespedes: 'FRECUENTEMENTE', presenciaCasa: 'SIEMPRE_AFUERA', fuma: 'NO', limpieza: 'NORMAL' }
        },
        {
            email: 'seeker1@demo.com', name: 'Ana Buscadora', role: 'SEEKER', birthDate: new Date('1996-03-01'), gender: 'MUJER',
            cityActual: 'Madrid - Lavapiés', ciudadBusquedaPiso: 'Madrid - Centro', prefieroCompartirCon: 'INDISTINTO',
            appModes: ['PISO_Y_AMISTADES','PISO_Y_CITAS'], objetivoConvivencia: ['AMBIENTE_SOCIAL','TEMPORAL'],
            interests: ['Música','Cine','Viajar'], languages: ['Español','Inglés'], presupuestoAproximado: 500,
            origen: 'Sevilla', occupation: 'Estudiante', universidadEscuela: 'UCM',
            bio: 'Busco habitación tranquila para estudiar.', profilePhotos: [
                'https://images.unsplash.com/photo-1544005313-2f31b0b09359?q=80&w=800',
                'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800'
            ], lifestyle: { actividadSocial: 'A_VECES_INVITA', mascotas: 'ACEPTA', huespedes: 'A_VECES', presenciaCasa: 'EQUILIBRADO', fuma: 'NO', limpieza: 'NORMAL' }
        },
        {
            email: 'seeker2@demo.com', name: 'Marcos', role: 'SEEKER', birthDate: new Date('1998-09-11'), gender: 'HOMBRE',
            cityActual: 'Barcelona - Sants', ciudadBusquedaPiso: 'Barcelona - Gràcia', prefieroCompartirCon: 'SOLO_HOMBRES',
            appModes: ['SOLO_COMPARTIR_PISO'], objetivoConvivencia: ['LARGO_PLAZO'],
            interests: ['Gimnasio','Videojuegos'], languages: ['Español'], presupuestoAproximado: 650,
            origen: 'Zaragoza', occupation: 'Ingeniero', universidadEscuela: 'UPC',
            bio: 'Ordenado y responsable.', profilePhotos: [
                'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=800',
                'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800'
            ], lifestyle: { actividadSocial: 'TRANQUILO', mascotas: 'NO_ACEPTA', huespedes: 'CASI_NUNCA', presenciaCasa: 'MUCHO_EN_CASA', fuma: 'NO', limpieza: 'MUY_ORDENADO' }
        },
        {
            email: 'seeker3@demo.com', name: 'Julia', role: 'SEEKER', birthDate: new Date('1997-12-22'), gender: 'MUJER',
            cityActual: 'Buenos Aires - Palermo', ciudadBusquedaPiso: 'Buenos Aires - Belgrano', prefieroCompartirCon: 'INDISTINTO',
            appModes: ['PISO_Y_AMISTADES'], objetivoConvivencia: ['CONVIVENCIA_TRANQUILA'],
            interests: ['Arte','Leer'], languages: ['Español','Italiano'], presupuestoAproximado: 400,
            origen: 'Argentina', occupation: 'Diseñadora', universidadEscuela: 'UBA',
            bio: 'Busco convivencia tranquila.', profilePhotos: [
                'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=800',
                'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=800'
            ], lifestyle: { actividadSocial: 'TRANQUILO', mascotas: 'LE_GUSTAN', huespedes: 'CASI_NUNCA', presenciaCasa: 'EQUILIBRADO', fuma: 'NO', limpieza: 'MUY_ORDENADO' }
        },
        {
            email: 'both1@demo.com', name: 'Sofía Flexible', role: 'BOTH', birthDate: new Date('1993-06-19'), gender: 'MUJER',
            cityActual: 'Madrid - Chamberí', ciudadBusquedaPiso: 'Madrid - Chamberí', prefieroCompartirCon: 'INDISTINTO',
            appModes: ['SOLO_COMPARTIR_PISO','PISO_Y_AMISTADES'], objetivoConvivencia: ['LARGO_PLAZO'],
            interests: ['Cine','Cocinar','Música'], languages: ['Español','Inglés'], presupuestoAproximado: 700,
            origen: 'Valencia', occupation: 'Marketing', universidadEscuela: 'UV',
            bio: 'Busco compañero/a compatible.', profilePhotos: [
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800',
                'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800'
            ], lifestyle: { actividadSocial: 'A_VECES_INVITA', mascotas: 'ACEPTA', huespedes: 'A_VECES', presenciaCasa: 'EQUILIBRADO', fuma: 'NO', limpieza: 'NORMAL' }
        },
    ];

    const createdUsers = [];
    for (const u of usersData) {
        const user = await prisma.user.create({
            data: {
                email: u.email,
                password: pass,
                name: u.name,
                role: u.role,
                birthDate: u.birthDate,
                gender: u.gender,
                bio: u.bio,
                profilePhotos: u.profilePhotos,
                cityActual: u.cityActual,
                ciudadBusquedaPiso: u.ciudadBusquedaPiso,
                prefieroCompartirCon: u.prefieroCompartirCon,
                appModes: u.appModes,
                objetivoConvivencia: u.objetivoConvivencia,
                interests: u.interests,
                languages: u.languages,
                presupuestoAproximado: u.presupuestoAproximado,
                origen: u.origen,
                occupation: u.occupation,
                universidadEscuela: u.universidadEscuela,
                quiereMudarseDesde: u.quiereMudarseDesde || null,
                lifestyle: u.lifestyle,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`,
            }
        });
        createdUsers.push(user);
    }

    // Owners create listings
    const owners = createdUsers.filter(u => u.role === 'OWNER');
    for (const o of owners) {
        await prisma.listing.create({
            data: {
                title: `Habitación de ${o.name}`,
                description: 'Luminoso, bien ubicado, ideal para convivir.',
                price: Math.floor(400 + Math.random() * 300),
                location: o.cityActual || 'Madrid',
                ownerId: o.id,
                amenities: ['Wifi', 'Ascensor', 'Cocina equipada'],
                availableFrom: new Date(),
                images: [o.profilePhotos[0]],
            }
        });
    }

    // Seed some seeker likes to owners' listings to generar "incoming likes"
    const seekers = createdUsers.filter(u => u.role === 'SEEKER');
    const listings = await prisma.listing.findMany();
    for (const s of seekers) {
        const targetListing = listings[Math.floor(Math.random() * listings.length)];
        await prisma.like.create({ data: { fromUserId: s.id, toListingId: targetListing.id } });
    }

    const owner1 = createdUsers.find(u => u.email === 'owner1@demo.com');
    const seeker1 = createdUsers.find(u => u.email === 'seeker1@demo.com');
    if (owner1 && seeker1) {
        const ownerListing = await prisma.listing.findFirst({ where: { ownerId: owner1.id } });
        if (ownerListing) {
            await prisma.like.create({ data: { fromUserId: seeker1.id, toListingId: ownerListing.id } });
        }
    }

    console.log('Seeding finished. Created users:', createdUsers.length);

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
