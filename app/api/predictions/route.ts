// app/api/predictions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { AuthOptions } from 'next-auth';
import FacebookProvider from 'next-auth/providers/facebook';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

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

        // First, delete any existing predictions for this user
        await prisma.prediction.deleteMany({
            where: { userId }
        });

        // Then create the new predictions
        const data = predictions.map(([gifterId, gifteeId]: [string, string]) => ({
            userId,
            participantIdGifter: gifterId,
            participantIdGiftee: gifteeId,
        }));

        await prisma.prediction.createMany({ data });

        return NextResponse.json({ message: 'Predictions saved successfully.' });
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

        const predictions = await prisma.prediction.findMany({
            where: {
                userId: session.user.id
            }
        });

        return NextResponse.json({ predictions });
    } catch (error) {
        console.error('Error in GET:', error);
        return NextResponse.json({ error: 'Failed to fetch predictions.' }, { status: 500 });
    }
}