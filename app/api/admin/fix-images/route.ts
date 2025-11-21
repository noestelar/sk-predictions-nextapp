import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        // Optional: Add a secret check if you want to protect this route
        // const { searchParams } = new URL(request.url);
        // if (searchParams.get('secret') !== process.env.ADMIN_SECRET) {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        const users = await prisma.user.findMany({
            where: {
                image: {
                    startsWith: 'https://platform-lookaside.fbsbx.com',
                },
            },
        });

        const results = [];

        for (const user of users) {
            if (!user.image) continue;

            const url = new URL(user.image);
            const asid = url.searchParams.get('asid');

            if (asid) {
                const newImage = `https://graph.facebook.com/${asid}/picture?type=large`;

                await prisma.user.update({
                    where: { id: user.id },
                    data: { image: newImage },
                });

                results.push({
                    user: user.email || user.name,
                    old: user.image,
                    new: newImage,
                    status: 'updated'
                });
            } else {
                results.push({
                    user: user.email || user.name,
                    image: user.image,
                    status: 'skipped_no_asid'
                });
            }
        }

        return NextResponse.json({
            message: `Processed ${users.length} users`,
            results
        });
    } catch (error) {
        console.error('Error fixing images:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
