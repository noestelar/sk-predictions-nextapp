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
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        isAdmin?: boolean;
    }
}

export const authOptions: AuthOptions = {
    debug: true,
    adapter: PrismaAdapter(prisma),
    providers: [
        // at top-level in the provider list
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            // Use the latest Facebook API version
            authorization: 'https://www.facebook.com/v21.0/dialog/oauth?scope=email',
            token: 'https://graph.facebook.com/v21.0/oauth/access_token',
            userinfo: 'https://graph.facebook.com/v21.0/me?fields=id,name,email,picture.type(large)',
            profile(profile) {
                console.log('Facebook profile data:', profile);
                return {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    image: `https://graph.facebook.com/${profile.id}/picture?type=large`
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
                        // Generate a simple avatar URL for dev users
                        const devAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(rawName || 'Dev User')}&background=d4af37&color=000&size=128`;
                        
                        if (rawEmail) {
                            user = await prisma.user.upsert({
                                where: { email: rawEmail },
                                create: { email: rawEmail, name: rawName ?? null, isAdmin: wantsAdmin, image: devAvatarUrl },
                                update: { name: rawName ?? undefined, isAdmin: wantsAdmin, image: devAvatarUrl },
                            });
                        } else {
                            // No email provided, fall back to unique name
                            user = await prisma.user.upsert({
                                where: { name: rawName! },
                                create: { name: rawName!, isAdmin: wantsAdmin, image: devAvatarUrl },
                                update: { isAdmin: wantsAdmin, image: devAvatarUrl },
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
                session.user.isAdmin = Boolean(token.isAdmin);
                
                // Ensure we have the latest user data including image
                if (token.id) {
                    try {
                        const dbUser = await prisma.user.findUnique({
                            where: { id: token.id as string },
                            select: { image: true }
                        });
                        if (dbUser?.image && !session.user.image) {
                            session.user.image = dbUser.image;
                        }
                    } catch (error) {
                        console.error('Error fetching user image in session callback:', error);
                    }
                }
            }
            console.log('Session callback - final session:', session);
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
