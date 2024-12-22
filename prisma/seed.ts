import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create participants
    const participants = [
        { name: 'Noé', profilePic: '/avatars/noe.jpg' },
        { name: 'Miriam', profilePic: '/avatars/miriam.jpg' },
        { name: 'Martín', profilePic: '/avatars/martin.jpg' },
        { name: 'Iris', profilePic: '/avatars/iris.jpg' },
        { name: 'Ilse', profilePic: '/avatars/ilse.jpg' },
        { name: 'Alex', profilePic: '/avatars/alex.jpg' },
        { name: 'Esteban Cesar', profilePic: '/avatars/esteban.jpg' },
        { name: 'Brenda', profilePic: '/avatars/brenda.jpg' },
        { name: 'Queso', profilePic: '/avatars/queso.jpg' },
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
        await prisma.disconnect();
    });