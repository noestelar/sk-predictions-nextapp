import prisma from '../lib/prisma';

async function seed() {
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
    console.log('Database seeded!');
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });