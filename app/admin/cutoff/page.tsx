'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Save } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function CutoffPage() {
    const [cutoffDate, setCutoffDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const router = useRouter();
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            router.push('/');
        },
    });

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleString());
        };
        
        updateTime();
        const interval = setInterval(updateTime, 1000);
        
        return () => clearInterval(interval);
    }, []);

    // Show loading state while checking authentication
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            console.log('Session status:', status);
            console.log('Session data:', session);
            console.log('Sending datetime:', cutoffDate);

            const response = await fetch('/api/admin/cutoff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ datetime: cutoffDate }),
                credentials: 'include',
            });

            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Raw response:', responseText);

            if (!responseText) {
                throw new Error('Empty response from server');
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                throw new Error('Invalid response from server');
            }

            if (response.ok) {
                alert('Cutoff date set successfully!');
                router.push('/admin');
            } else {
                throw new Error(data.error || 'Failed to set cutoff date');
            }
        } catch (error) {
            console.error('Error setting cutoff date:', error);
            alert(error instanceof Error ? error.message : 'Failed to set cutoff date. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Clock className="text-gold-500 mx-auto mb-4" size={48} />
                    <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
                        Set Cutoff Date
                    </h1>
                    <p className="text-gold-300">Choose the final date for Secret Santa predictions</p>
                    <p className="text-gold-300 mt-2">Current time: {currentTime}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <input
                            type="datetime-local"
                            value={cutoffDate}
                            onChange={(e) => setCutoffDate(e.target.value)}
                            required
                            className="w-full p-3 bg-gray-900 border-2 border-gold-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || status !== 'authenticated'}
                        className="w-full px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-black rounded-lg shadow-lg hover:from-gold-500 hover:to-gold-700 transition-colors duration-300 font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={20} />
                        <span>{isSubmitting ? 'Setting...' : 'Set Cutoff Date'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
