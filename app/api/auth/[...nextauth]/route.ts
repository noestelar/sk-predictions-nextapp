import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';

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

const handler = NextAuth({
    debug: true,
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'Name',
            credentials: {
                name: { label: "Name", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.name) return null;

                // Find the participant with the given name
                const participant = await prisma.participant.findUnique({
                    where: { name: credentials.name }
                });

                if (!participant) return null;

                // Find or create a user for this participant
                let user = await prisma.user.findUnique({
                    where: { name: participant.name }
                });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            name: participant.name,
                            image: participant.profilePic
                        }
                    });
                }

                return {
                    id: user.id,
                    name: user.name,
                    image: user.image
                };
            }
        })
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
});

export { handler as GET, handler as POST };