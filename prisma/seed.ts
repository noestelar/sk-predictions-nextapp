import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
    try {
        console.log('Starting database seed...');

        // First check if we already have participants to avoid duplicate seeding
        const existingParticipants = await prisma.participant.findMany().catch(() => []);

        if (existingParticipants && existingParticipants.length > 0) {
            console.log('Database already seeded, skipping...');
            return;
        }

        // Create all participants in a transaction to ensure data consistency
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            await tx.participant.createMany({
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
                skipDuplicates: true,
            });
        }).catch((error: Error) => {
            console.error('Transaction failed:', error);
            return null;
        });

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
        // Don't throw in production
        if (process.env.NODE_ENV === 'development') {
            throw error;
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Handle any unhandled promise rejections
process.on('unhandledRejection', (error: Error) => {
    console.error('Unhandled Promise Rejection:', error);
    // Don't exit process in production
    if (process.env.NODE_ENV === 'development') {
        process.exit(1);
    }
});

seed();