import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const participants = await prisma.participant.findMany({
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json({ participants });
    } catch (error) {
        console.error('Error in GET:', error);
        return NextResponse.json({ error: 'Failed to fetch participants.' }, { status: 500 });
    }
} 
