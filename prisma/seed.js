import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create participants
    const participants = [
        { name: 'Noé', profilePic: '/images/noe.jpg' },
        { name: 'Miriam', profilePic: '/images/miriam.jpg' },
        { name: 'Martín', profilePic: '/images/martin.jpg' },
        { name: 'Iris', profilePic: '/images/iris.jpg' },
        { name: 'Ilse', profilePic: '/images/ilse.jpg' },
        { name: 'Alex', profilePic: '/images/alex.jpg' },
        { name: 'Esteban', profilePic: '/images/esteban.jpg' },
        { name: 'Brenda', profilePic: '/images/brenda.jpg' },
        { name: 'Queso', profilePic: '/images/queso.jpg' },
        { name: 'César', profilePic: '/images/cesar.jpg' },
    ];

    for (const participant of participants) {
        await prisma.participant.upsert({
            where: { name: participant.name },
            update: participant,
            create: participant,
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });