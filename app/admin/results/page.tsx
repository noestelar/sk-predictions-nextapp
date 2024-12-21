'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Gift, Save, X } from 'lucide-react';
import { Participant } from '@prisma/client';

interface Result {
    gifterId: string;
    gifteeId: string;
    gifter: Participant;
    giftee: Participant;
}

export default function ResultsPage() {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [selectedPair, setSelectedPair] = useState<string[]>([]);
    const [results, setResults] = useState<string[][]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectionMessage, setSelectionMessage] = useState<string>('');
    const router = useRouter();
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            router.push('/');
        },
    });

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch participants
                const participantsRes = await fetch('/api/participants');
                if (!participantsRes.ok) {
                    throw new Error('Failed to fetch participants');
                }
                const participantsData = await participantsRes.json();
                setParticipants(participantsData.participants);

                // Fetch existing results
                const resultsRes = await fetch('/api/admin/results');
                if (!resultsRes.ok) {
                    throw new Error('Failed to fetch results');
                }
                const resultsData = await resultsRes.json();
                const existingResults = resultsData.results.map((r: Result) => [r.gifterId, r.gifteeId]);
                setResults(existingResults);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    // Show loading state while checking authentication
    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
            </div>
        );
    }

    const handleSelectParticipant = (participantId: string) => {
        if (selectedPair.length === 0) {
            setSelectedPair([participantId]);
            setSelectionMessage('Now select who they will give a gift to');
        } else if (selectedPair[0] === participantId) {
            setSelectedPair([]);
            setSelectionMessage('');
        } else {
            // Check if the gifter is already assigned
            const existingGifterPair = results.find(pair => pair[0] === selectedPair[0]);
            if (existingGifterPair) {
                const updatedResults = results.map(pair =>
                    pair[0] === selectedPair[0] ? [selectedPair[0], participantId] : pair
                );
                setResults(updatedResults);
            } else {
                setResults([...results, [selectedPair[0], participantId]]);
            }
            setSelectedPair([]);
            setSelectionMessage('');
        }
    };

    const getGifteeForGifter = (gifterId: string) => {
        const pair = results.find(([g]) => g === gifterId);
        return pair ? pair[1] : null;
    };

    const getGifterForGiftee = (gifteeId: string) => {
        const pair = results.find(([_, g]) => g === gifteeId);
        return pair ? pair[0] : null;
    };

    const handleSaveResults = async () => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            const response = await fetch('/api/admin/results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ results }),
            });

            if (!response.ok) {
                throw new Error('Failed to save results');
            }

            alert('Results saved successfully!');
            router.push('/admin');
        } catch (error) {
            console.error('Error saving results:', error);
            alert('Failed to save results. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClearResults = () => {
        setResults([]);
        setSelectedPair([]);
        setSelectionMessage('');
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <Gift className="text-gold-500 mx-auto mb-4" size={48} />
                    <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
                        Set Gift-Giving Results
                    </h1>
                    <p className="text-gold-300">Assign who gave a gift to whom</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 relative">
                    {participants.map((participant) => {
                        const isGifter = selectedPair[0] === participant.id;
                        const isGiftee = getGifteeForGifter(participant.id);
                        const isGifterFor = getGifterForGiftee(participant.id);
                        const isSelected = isGifter || selectedPair[1] === participant.id;

                        return (
                            <div
                                key={participant.id}
                                onClick={() => handleSelectParticipant(participant.id)}
                                className={`
                                    relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer
                                    hover:border-gold-400
                                    ${isSelected ? 'border-gold-500 bg-gold-500/20' : 'border-gray-700'}
                                `}
                            >
                                <div className="aspect-square relative rounded-full overflow-hidden mb-4">
                                    <img
                                        src={participant.profilePic}
                                        alt={participant.name}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <h3 className="text-center font-semibold">{participant.name}</h3>
                                {isGiftee && (
                                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                                        <Gift className="w-6 h-6 text-gold-500" />
                                    </div>
                                )}
                                {isGifterFor && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <Gift className="w-6 h-6 text-gold-500" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {selectionMessage && (
                    <div className="mt-4 p-4 bg-gold-500/20 border border-gold-500 rounded-lg text-gold-300 text-center">
                        {selectionMessage}
                    </div>
                )}

                <div className="mt-8 text-center space-x-4">
                    <button
                        className="px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-black rounded-lg shadow-lg hover:from-gold-500 hover:to-gold-700 transition-colors duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSaveResults}
                        disabled={isSubmitting || results.length === 0}
                    >
                        <Save className="w-4 h-4 inline-block mr-2" />
                        {isSubmitting ? 'Saving...' : 'Save Results'}
                    </button>
                    <button
                        className="px-6 py-3 bg-transparent border-2 border-gold-500 text-gold-500 rounded-lg shadow-lg hover:bg-gold-500/10 transition-colors duration-300 font-semibold"
                        onClick={handleClearResults}
                        disabled={results.length === 0}
                    >
                        <X className="w-4 h-4 inline-block mr-2" />
                        Clear All
                    </button>
                </div>
            </div>
        </div>
    );
} 