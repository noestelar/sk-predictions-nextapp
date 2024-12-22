import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
    try {
        // First check if we already have participants to avoid duplicate seeding
        const existingParticipants = await prisma.participant.findMany();
        if (existingParticipants.length > 0) {
            console.log('Database already seeded, skipping...');
            return;
        }

        await prisma.participant.createMany({
            data: [
                { name: 'Miriam', profilePic: '/images/miriam.jpg' },
                { name: 'Noé', profilePic: '/images/noe.jpg' },
                { name: 'Queso', profilePic: '/images/queso.jpg' },
                { name: 'Martín', profilePic: '/images/martin.jpg' },
                { name: 'Esteban', profilePic: '/images/esteban.jpg' },
                { name: 'Ilse', profilePic: '/images/ilse.jpg' },
                { name: 'Cesar', profilePic: '/images/cesar.jpg' },
                { name: 'Alex', profilePic: '/images/alex.jpg' },
                { name: 'Iris', profilePic: '/images/iris.jpg' },
            ],
        });
        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
        // Don't exit with error in production, just log it
        if (process.env.NODE_ENV === 'development') {
            throw error;
        }
    } finally {
        await prisma.$disconnect();
    }
}

seed();