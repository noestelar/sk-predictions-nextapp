import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Facebook image URL fix...');

    const users = await prisma.user.findMany({
        where: {
            image: {
                startsWith: 'https://platform-lookaside.fbsbx.com',
            },
        },
    });

    console.log(`Found ${users.length} users with temporary Facebook image URLs.`);

    for (const user of users) {
        if (!user.image) continue;

        const url = new URL(user.image);
        const asid = url.searchParams.get('asid');

        if (asid) {
            const newImage = `https://graph.facebook.com/${asid}/picture?type=large`;
            console.log(`Updating user ${user.email || user.name} (${user.id}):`);
            console.log(`  Old: ${user.image}`);
            console.log(`  New: ${newImage}`);

            await prisma.user.update({
                where: { id: user.id },
                data: { image: newImage },
            });
        } else {
            console.warn(`Could not extract ASID from image URL for user ${user.id}: ${user.image}`);
        }
    }

    console.log('Finished updating user images.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
