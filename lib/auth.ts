import { type AuthOptions } from 'next-auth';
import FacebookProvider from 'next-auth/providers/facebook';
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
        }),
        ...(process.env.NODE_ENV !== 'production' || process.env.ENABLE_DEV_AUTH === 'true'
            ? [
                CredentialsProvider({
                    name: 'Dev Credentials',
                    credentials: {
                        name: { label: 'Name', type: 'text' },
                        email: { label: 'Email', type: 'text' },
                        admin: { label: 'Admin', type: 'checkbox' },
                        secret: { label: 'Secret', type: 'password' },
                    },
                    async authorize(credentials) {
                        if (!credentials) return null;
                        const devEnabled = process.env.NODE_ENV !== 'production' || process.env.ENABLE_DEV_AUTH === 'true';
                        if (!devEnabled) return null;

                        const requiredSecret = process.env.NEXTAUTH_DEV_SECRET;
                        if (requiredSecret && credentials.secret !== requiredSecret) {
                            return null;
                        }

                        const rawName = (credentials.name as string | undefined)?.trim();
                        const rawEmail = (credentials.email as string | undefined)?.trim().toLowerCase();
                        const wantsAdmin = String(credentials.admin) === 'true' || String(credentials.admin) === '1' || credentials.admin === 'on';

                        if (!rawName && !rawEmail) return null;

                        // Create or update the user for dev sign-in
                        let user;
                        if (rawEmail) {
                            user = await prisma.user.upsert({
                                where: { email: rawEmail },
                                create: { email: rawEmail, name: rawName ?? null, isAdmin: wantsAdmin },
                                update: { name: rawName ?? undefined, isAdmin: wantsAdmin },
                            });
                        } else {
                            // No email provided, fall back to unique name
                            user = await prisma.user.upsert({
                                where: { name: rawName! },
                                create: { name: rawName!, isAdmin: wantsAdmin },
                                update: { isAdmin: wantsAdmin },
                            });
                        }

                        return { 
                            id: user.id, 
                            name: user.name, 
                            email: user.email, 
                            image: user.image,
                            isAdmin: user.isAdmin 
                        } as any;
                    },
                })
            ]
            : [])
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
            if (user) {
                token.id = user.id;
                token.isAdmin = (user as any).isAdmin || false;
            }
            return token;
        },
    },
};
