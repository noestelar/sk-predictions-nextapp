'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Clock, Gift } from 'lucide-react';

export default function AdminPage() {
    const router = useRouter();
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            router.push('/');
        },
    });

    // Show loading state while checking authentication
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
                        Admin Dashboard
                    </h1>
                    <p className="text-gold-300">Manage Secret Santa settings and results</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div
                        onClick={() => router.push('/admin/cutoff')}
                        className="p-8 rounded-lg border-2 border-gray-700 hover:border-gold-500 transition-colors duration-300 cursor-pointer bg-gray-900/50"
                    >
                        <Clock className="text-gold-500 mx-auto mb-4" size={48} />
                        <h2 className="text-2xl font-bold mb-2 text-center">Set Cutoff Date</h2>
                        <p className="text-gray-400 text-center">
                            Set the deadline for participants to submit their predictions
                        </p>
                    </div>

                    <div
                        onClick={() => router.push('/admin/results')}
                        className="p-8 rounded-lg border-2 border-gray-700 hover:border-gold-500 transition-colors duration-300 cursor-pointer bg-gray-900/50"
                    >
                        <Gift className="text-gold-500 mx-auto mb-4" size={48} />
                        <h2 className="text-2xl font-bold mb-2 text-center">Set Results</h2>
                        <p className="text-gray-400 text-center">
                            Record who actually gave gifts to whom
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 