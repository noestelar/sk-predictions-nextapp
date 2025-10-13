import { type AuthOptions } from 'next-auth';
import FacebookProvider from 'next-auth/providers/facebook';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            isAdmin?: boolean;
        }
    }
    interface JWT {
        id: string;
        isAdmin?: boolean;
    }
}

export const authOptions: AuthOptions = {
    debug: false,
    adapter: PrismaAdapter(prisma),
    providers: [
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            profile(profile) {
                return {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture?.data?.url ?? null
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
                session.user.isAdmin = token.isAdmin || false;
            }
            return session;
        },
        async jwt({ token, user, account }) {
            if (user && account) {
                // Initial sign in - user object contains the provider ID
                // We need to find the actual database user
                const dbUser = await prisma.user.findFirst({
                    where: {
                        accounts: {
                            some: {
                                provider: account.provider,
                                providerAccountId: user.id
                            }
                        }
                    },
                    select: { id: true, isAdmin: true }
                });
                
                if (dbUser) {
                    token.id = dbUser.id;
                    token.isAdmin = dbUser.isAdmin || false;
                } else {
                    // Fallback: try to find by email if available
                    if (user.email) {
                        const dbUserByEmail = await prisma.user.findUnique({
                            where: { email: user.email },
                            select: { id: true, isAdmin: true }
                        });
                        if (dbUserByEmail) {
                            token.id = dbUserByEmail.id;
                            token.isAdmin = dbUserByEmail.isAdmin || false;
                        }
                    }
                }
            }
            return token;
        },
    },
};
