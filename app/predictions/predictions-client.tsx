'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Participant, CutoffTime } from '@prisma/client';
import { Sparkles, Gift, ArrowRight, Edit2, Save, X, Clock } from 'lucide-react';

interface PredictionsClientProps {
    participants: Participant[];
    cutoffTime: CutoffTime | null;
    isPastCutoff: boolean;
}

export default function PredictionsClient({ participants, cutoffTime, isPastCutoff }: PredictionsClientProps) {
    const [selectedPair, setSelectedPair] = useState<string[]>([]);
    const [predictions, setPredictions] = useState<string[][]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingPredictions, setEditingPredictions] = useState<string[][]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [selectionMessage, setSelectionMessage] = useState<string>('');
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        async function fetchPredictions() {
            try {
                const res = await fetch('/api/predictions');
                if (!res.ok) {
                    throw new Error('Failed to fetch predictions');
                }
                const data = await res.json();
                const existingPredictions = data.predictions.map((p: any) => [p.participantIdGifter, p.participantIdGiftee]);
                setPredictions(existingPredictions);
                setEditingPredictions(existingPredictions);
                setIsEditing(existingPredictions.length === 0 && !isPastCutoff);
            } catch (error) {
                console.error('Error fetching predictions:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchPredictions();
    }, [isPastCutoff]);

    useEffect(() => {
        if (!cutoffTime) return;

        const updateTimeLeft = () => {
            const now = new Date();
            const cutoffDate = new Date(cutoffTime.datetime);

            if (now >= cutoffDate) {
                setTimeLeft('Predictions are closed');
                setIsEditing(false);
                return;
            }

            const diff = cutoffDate.getTime() - now.getTime();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s remaining`);
        };

        updateTimeLeft();
        const interval = setInterval(updateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [cutoffTime]);

    const getGifteeForGifter = (gifterId: string) => {
        const prediction = editingPredictions.find(pair => pair[0] === gifterId);
        return prediction ? prediction[1] : null;
    };

    const getGifterForGiftee = (gifteeId: string) => {
        const prediction = editingPredictions.find(pair => pair[1] === gifteeId);
        return prediction ? prediction[0] : null;
    };

    const handleSelectParticipant = (id: string) => {
        if (isPastCutoff || !isEditing) return;

        setSelectedPair((prev) => {
            if (prev.length === 0) {
                const selectedParticipant = participants.find(p => p.id === id);
                setSelectionMessage(`Selected ${selectedParticipant?.name} as gifter. Now select their giftee.`);
                return [id];
            }

            if (prev.length === 1) {
                if (id === prev[0]) {
                    return prev;
                }

                const updated = [...prev, id];
                const gifter = participants.find(p => p.id === updated[0]);
                const giftee = participants.find(p => p.id === updated[1]);
                setSelectionMessage(`Set ${gifter?.name} to give a gift to ${giftee?.name}`);

                setEditingPredictions(prevPredictions => {
                    const filtered = prevPredictions.filter(pair =>
                        pair[0] !== updated[0] && pair[1] !== updated[1]
                    );
                    return [...filtered, updated];
                });

                return [];
            }

            return prev;
        });
    };

    const handleSavePredictions = async () => {
        if (isSubmitting || isPastCutoff) return;

        try {
            setIsSubmitting(true);
            const res = await fetch('/api/predictions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ predictions: editingPredictions }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to save predictions');
            }

            setPredictions(editingPredictions);
            setIsEditing(false);
            setSelectionMessage('');
            alert('Predictions saved successfully!');
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'An error occurred while saving predictions.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingPredictions(predictions);
        setIsEditing(false);
        setSelectedPair([]);
        setSelectionMessage('');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto relative">
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="absolute top-0 right-0 px-4 py-2 bg-transparent border-2 border-gold-500 text-gold-500 rounded-lg shadow-lg hover:bg-gold-500/10 transition-colors duration-300 font-semibold"
                >
                    Logout
                </button>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
                        Secret Santa Predictions
                    </h1>
                    {cutoffTime && (
                        <div className="flex items-center justify-center space-x-2 text-gold-300">
                            <Clock size={20} />
                            <span>{timeLeft}</span>
                        </div>
                    )}
                    {isPastCutoff && (
                        <div className="mt-4">
                            <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300 mb-4">
                                Predictions are now closed. The cutoff time has passed.
                            </div>
                            <a
                                href="/winners"
                                className="inline-block px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-black rounded-lg shadow-lg hover:from-gold-500 hover:to-gold-700 transition-colors duration-300 font-semibold"
                            >
                                View Winners
                            </a>
                        </div>
                    )}
                    {selectionMessage && (
                        <div className="mt-4 p-4 bg-gold-500/20 border border-gold-500 rounded-lg text-gold-300">
                            {selectionMessage}
                        </div>
                    )}
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
                                    ${isEditing && !isPastCutoff ? 'hover:border-gold-400' : ''}
                                    ${isSelected ? 'border-gold-500 bg-gold-500/20' : 'border-gray-700'}
                                    ${isPastCutoff ? 'cursor-not-allowed' : ''}
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
                                        <Sparkles className="w-6 h-6 text-gold-500" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 text-center space-x-4">
                    {!isPastCutoff && (
                        isEditing ? (
                            <>
                                <button
                                    className="px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-black rounded-lg shadow-lg hover:from-gold-500 hover:to-gold-700 transition-colors duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleSavePredictions}
                                    disabled={isSubmitting}
                                >
                                    <Save className="w-4 h-4 inline-block mr-2" />
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    className="px-6 py-3 bg-transparent border-2 border-gold-500 text-gold-500 rounded-lg shadow-lg hover:bg-gold-500/10 transition-colors duration-300 font-semibold"
                                    onClick={handleCancelEdit}
                                >
                                    <X className="w-4 h-4 inline-block mr-2" />
                                    Cancel
                                </button>
                            </>
                        ) : predictions.length > 0 ? (
                            <button
                                className="px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-black rounded-lg shadow-lg hover:from-gold-500 hover:to-gold-700 transition-colors duration-300 font-semibold"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit2 className="w-4 h-4 inline-block mr-2" />
                                Edit Predictions
                            </button>
                        ) : (
                            <button
                                className="px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-black rounded-lg shadow-lg hover:from-gold-500 hover:to-gold-700 transition-colors duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleSavePredictions}
                                disabled={isSubmitting || predictions.length === 0}
                            >
                                <Save className="w-4 h-4 inline-block mr-2" />
                                {isSubmitting ? 'Saving...' : 'Save Predictions'}
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
