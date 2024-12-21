// app/api/predictions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { predictions } = await req.json();
        const userId = session.user.id;

        const data = predictions.map(([gifterId, gifteeId]: [string, string]) => ({
            userId,
            participantIdGifter: gifterId,
            participantIdGiftee: gifteeId,
        }));

        await prisma.prediction.createMany({ data });

        return NextResponse.json({ message: 'Predictions saved successfully.' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to save predictions.' }, { status: 500 });
    }
}