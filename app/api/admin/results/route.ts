import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

import { redis } from '@/lib/redis';
import { authOptions } from '@/lib/auth';

const LEADERBOARD_CACHE_KEY = 'leaderboard:latest';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const results = await prisma.result.findMany({
            select: {
                gifterId: true,
                gifteeId: true,
            },
        });

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Error in GET:', error);
        return NextResponse.json({ error: 'Failed to fetch results.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { results } = await req.json();

        // First, delete all existing results
        await prisma.result.deleteMany();

        // Then create the new results
        const data = results.map(([gifterId, gifteeId]: [string, string]) => ({
            gifterId,
            gifteeId,
        }));

        // Create results one by one since createMany isn't supported
        for (const result of data) {
            await prisma.result.create({ data: result });
        }

        if (redis) {
            await redis.del(LEADERBOARD_CACHE_KEY);
        }

        return NextResponse.json({ message: 'Results saved successfully.' });
    } catch (error) {
        console.error('Error in POST:', error);
        return NextResponse.json({ error: 'Failed to save results.' }, { status: 500 });
    }
} 
