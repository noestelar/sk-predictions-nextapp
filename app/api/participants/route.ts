import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { AuthOptions } from 'next-auth';
import FacebookProvider from 'next-auth/providers/facebook';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

const authOptions: AuthOptions = {
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

export async function GET(req: NextRequest) {
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