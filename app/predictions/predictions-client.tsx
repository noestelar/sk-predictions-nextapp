'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Participant } from '@prisma/client';
import { Sparkles, Gift, ArrowRight, Edit2, Save, X } from 'lucide-react';

interface PredictionsClientProps {
    participants: Participant[];
}

export default function PredictionsClient({ participants }: PredictionsClientProps) {
    const [selectedPair, setSelectedPair] = useState<string[]>([]);
    const [predictions, setPredictions] = useState<string[][]>([]);
    const [isEditing, setIsEditing] = useState(true);
    const [editingPredictions, setEditingPredictions] = useState<string[][]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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
                setIsEditing(existingPredictions.length === 0);
            } catch (error) {
                console.error('Error fetching predictions:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchPredictions();
    }, []);

    const getGifteeForGifter = (gifterId: string) => {
        const prediction = editingPredictions.find(pair => pair[0] === gifterId);
        return prediction ? prediction[1] : null;
    };

    const getGifterForGiftee = (gifteeId: string) => {
        const prediction = editingPredictions.find(pair => pair[1] === gifteeId);
        return prediction ? prediction[0] : null;
    };

    const handleSelectParticipant = (id: string) => {
        setSelectedPair((prev) => {
            // If no participant is selected yet (selecting gifter)
            if (prev.length === 0) {
                return [id];
            }

            // If selecting giftee
            if (prev.length === 1) {
                // Prevent self-selection
                if (id === prev[0]) {
                    return prev;
                }

                const updated = [...prev, id];

                // Update the predictions
                setEditingPredictions(prevPredictions => {
                    // Remove any existing predictions involving these participants
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
        if (isSubmitting) return;

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
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto relative">
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="absolute top-0 right-0 px-4 py-2 bg-transparent border-2 border-gold-500 text-gold-500 rounded-lg shadow-lg hover:bg-gold-500/10 transition-colors duration-300 font-semibold"
                >
                    Logout
                </button>
                <div className="text-center mb-8">
                    <Sparkles className="text-gold-500 mx-auto mb-4" size={48} />
                    <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
                        Welcome, {session?.user?.name}!
                    </h1>
                    <div className="w-24 h-24 mx-auto mb-6">
                        <img
                            src={session?.user?.image || '/default-avatar.png'}
                            alt={session?.user?.name || 'User'}
                            className="w-full h-full rounded-full object-cover border-4 border-gold-500"
                        />
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
                        </div>
                    ) : (
                        <>
                            <p className="text-gold-300 text-xl mb-6">
                                {isEditing ? 'Edit your predictions:' :
                                    predictions.length > 0 ? 'Your Secret Santa predictions:' :
                                        'Make your Secret Santa predictions:'}
                            </p>
                            {selectedPair.length === 1 && (isEditing || predictions.length === 0) && (
                                <p className="text-gold-400 mb-4">
                                    Select who {participants.find(p => p.id === selectedPair[0])?.name} will gift to
                                </p>
                            )}
                        </>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 relative">
                    {participants.map((participant) => {
                        const gifteeId = getGifteeForGifter(participant.id);
                        const gifterId = getGifterForGiftee(participant.id);
                        const isSelected = selectedPair[0] === participant.id;
                        const isAvailableAsGiftee = (isEditing || predictions.length === 0) && selectedPair.length === 1 && !gifterId && selectedPair[0] !== participant.id;
                        const isClickable = isEditing || predictions.length === 0;

                        return (
                            <div
                                key={participant.id}
                                className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 
                                    ${isSelected ? 'border-gold-500 bg-gold-500/20' : ''}
                                    ${isClickable && isAvailableAsGiftee ? 'border-gray-700 hover:border-gold-500/50' : 'border-gray-700'}
                                    ${!isClickable && !isAvailableAsGiftee ? 'cursor-default' : ''}`}
                                onClick={() => (isEditing || predictions.length === 0) && handleSelectParticipant(participant.id)}
                            >
                                <div className="relative w-24 h-24 mx-auto mb-4">
                                    <img
                                        src={participant.profilePic}
                                        alt={participant.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                    {gifteeId && (
                                        <div className="absolute -right-2 -bottom-2 bg-gold-500 rounded-full p-2">
                                            <ArrowRight className="w-4 h-4 text-black" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-center font-medium">{participant.name}</p>
                                {gifteeId && (
                                    <p className="text-xs text-gold-400 text-center mt-1">
                                        Gifting to: {participants.find(p => p.id === gifteeId)?.name}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 text-center space-x-4">
                    {isEditing ? (
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
                    )}
                </div>
            </div>
        </div>
    );
}

