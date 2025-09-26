// app/api/predictions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { AuthOptions } from 'next-auth';
import FacebookProvider from 'next-auth/providers/facebook';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

import { redis } from '@/lib/redis';

const CACHE_TTL_SECONDS = 60;

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        }
    }
    interface JWT {
        id: string;
    }
}

const authOptions: AuthOptions = {
    debug: true,
    adapter: PrismaAdapter(prisma),
    providers: [
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) token.id = user.id;
            return token;
        },
    },
};

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { predictions } = await req.json();
        const userId = session.user.id;

        await prisma.$transaction(async (tx) => {
            await tx.prediction.deleteMany({
                where: { userId }
            });

            const data = predictions.map(([gifterId, gifteeId]: [string, string]) => ({
                userId,
                participantIdGifter: gifterId,
                participantIdGiftee: gifteeId,
            }));

            for (const predictionData of data) {
                await tx.prediction.create({ data: predictionData });
            }
        });

        const savedPredictions = await prisma.prediction.findMany({
            where: { userId }
        });

        const cacheKey = `predictions:user:${userId}`;
        if (redis) {
            await redis.set(cacheKey, JSON.stringify(savedPredictions), 'EX', CACHE_TTL_SECONDS);
        }

        return NextResponse.json({ message: 'Predictions saved successfully.', predictions: savedPredictions });
    } catch (error) {
        console.error('Error in POST:', error);
        return NextResponse.json({ error: 'Failed to save predictions.' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cacheKey = `predictions:user:${session.user.id}`;
        if (redis) {
            const cached = await redis.get(cacheKey);
            if (cached) {
                return NextResponse.json({ predictions: JSON.parse(cached) });
            }
        }

        const predictions = await prisma.prediction.findMany({
            where: {
                userId: session.user.id
            }
        });

        if (redis) {
            await redis.set(cacheKey, JSON.stringify(predictions), 'EX', CACHE_TTL_SECONDS);
        }

        return NextResponse.json({ predictions });
    } catch (error) {
        console.error('Error in GET:', error);
        return NextResponse.json({ error: 'Failed to fetch predictions.' }, { status: 500 });
    }
}
