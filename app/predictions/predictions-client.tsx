'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Participant } from '@prisma/client';
import { Sparkles, Gift } from 'lucide-react';

interface PredictionsClientProps {
    participants: Participant[];
}

export default function PredictionsClient({ participants }: PredictionsClientProps) {
    const [selectedPair, setSelectedPair] = useState<string[]>([]);
    const [predictions, setPredictions] = useState<string[][]>([]);
    const [confirmationMessage, setConfirmationMessage] = useState<string>('');
    const [showReview, setShowReview] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    const isAllPredictionsSet = () => {
        return predictions.length === participants.length;
    };

    const isParticipantUsed = (participantId: string) => {
        return predictions.some(pair => pair[0] === participantId);
    };

    const isParticipantGiftee = (participantId: string) => {
        return predictions.some(pair => pair[1] === participantId);
    };

    const handleSelectParticipant = (id: string) => {
        if (showReview) return; // Prevent selections while reviewing
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

                // Prevent selecting someone who is already receiving a gift
                if (isParticipantGiftee(id)) {
                    return prev;
                }

                const updated = [...prev, id];

                // Check if this prediction already exists
                const isDuplicate = predictions.some(
                    pair => pair[0] === updated[0] && pair[1] === updated[1]
                );

                if (isDuplicate) {
                    return prev;
                }

                // Save the prediction and reset the pair selection
                setPredictions((prevPredictions) => [...prevPredictions, updated]);

                // Show confirmation message
                const gifter = participants.find(p => p.id === updated[0])?.name;
                const giftee = participants.find(p => p.id === updated[1])?.name;
                setConfirmationMessage(`${gifter} will gift to ${giftee}`);

                // Clear confirmation message after 3 seconds
                setTimeout(() => {
                    setConfirmationMessage('');
                }, 3000);

                return [];
            }

            return prev;
        });
    };

    const getParticipantStatus = (participantId: string) => {
        if (selectedPair.length === 0) {
            // When selecting a gifter
            return isParticipantUsed(participantId) ? 'used' : 'available';
        } else {
            // When selecting a giftee
            if (participantId === selectedPair[0]) {
                return null; // Can't select self
            }
            if (isParticipantGiftee(participantId)) {
                return 'used'; // Already receiving a gift
            }
            if (selectedPair[0] === participantId) {
                return 'gifter';
            }
            return 'available';
        }
    };

    const handleSavePredictions = async () => {
        if (!showReview) {
            setShowReview(true);
            return;
        }

        try {
            const res = await fetch('/api/predictions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ predictions }),
            });

            if (res.ok) {
                alert('Predictions saved successfully!');
                router.push('/');
            } else {
                throw new Error('Failed to save predictions');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while saving predictions.');
        }
    };

    const handleCancelReview = () => {
        setShowReview(false);
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <Sparkles className="text-gold-500 mx-auto mb-4" size={48} />
                    <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
                        Welcome, {session?.user?.name}!
                    </h1>
                    <p className="text-gold-300 text-xl mb-6">Ready to make your Secret Santa predictions?</p>
                    <div className="w-24 h-24 mx-auto mb-6">
                        <img
                            src={session?.user?.image || '/default-avatar.png'}
                            alt={session?.user?.name || 'User'}
                            className="w-full h-full rounded-full object-cover border-4 border-gold-500"
                        />
                    </div>
                    {confirmationMessage && !showReview && (
                        <div className="mt-4 p-3 bg-gold-500/20 text-gold-400 rounded-lg border border-gold-500/50 animate-fade-in">
                            {confirmationMessage}
                        </div>
                    )}
                    {selectedPair.length === 1 && !showReview && (
                        <p className="mt-4 text-gold-400">
                            Select who {participants.find(p => p.id === selectedPair[0])?.name} will gift to
                        </p>
                    )}
                    {selectedPair.length === 0 && !confirmationMessage && !showReview && (
                        <p className="mt-4 text-gold-400">
                            Select who will be gifting
                        </p>
                    )}
                    {showReview && (
                        <div className="mt-6 p-4 bg-gold-500/10 rounded-lg border border-gold-500/30">
                            <h2 className="text-xl font-semibold text-gold-400 mb-3">Review Your Predictions</h2>
                            <div className="space-y-2">
                                {[...new Set(predictions.map(pair => JSON.stringify(pair)))].map((pairStr, index) => {
                                    const pair = JSON.parse(pairStr);
                                    const gifter = participants.find(p => p.id === pair[0])?.name;
                                    const giftee = participants.find(p => p.id === pair[1])?.name;
                                    return (
                                        <p key={index} className="text-gold-300">
                                            {gifter} → {giftee}
                                        </p>
                                    );
                                })}
                            </div>
                            <p className="mt-4 text-sm text-gold-400">
                                Please review your predictions. Click "Confirm & Save" to finalize or "Cancel" to make changes.
                            </p>
                        </div>
                    )}
                </div>
                <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 ${showReview ? 'opacity-50 pointer-events-none' : ''}`}>
                    {participants.map((participant) => {
                        const status = getParticipantStatus(participant.id);
                        return (
                            <div
                                key={participant.id}
                                className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${status === 'gifter'
                                    ? 'border-gold-500 bg-gold-500/20'
                                    : status === 'used'
                                        ? 'border-gray-700 opacity-50 cursor-not-allowed'
                                        : status === 'available'
                                            ? 'border-gray-700 hover:border-gold-500/50'
                                            : 'border-gray-700 opacity-50 cursor-not-allowed'
                                    }`}
                                onClick={() => status !== 'used' && handleSelectParticipant(participant.id)}
                            >
                                <div className="relative w-24 h-24 mx-auto mb-4">
                                    <img
                                        src={participant.profilePic}
                                        alt={participant.name}
                                        className={`w-full h-full rounded-full object-cover ${status === 'used' ? 'opacity-50' : ''}`}
                                    />
                                    {status === 'gifter' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                            <Gift className="text-gold-500" size={32} />
                                        </div>
                                    )}
                                </div>
                                <p className="text-center font-medium">{participant.name}</p>
                                {status === 'used' && (
                                    <p className="text-xs text-gray-400 text-center mt-1">Already assigned</p>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="mt-8 text-center space-x-4">
                    {showReview ? (
                        <>
                            <button
                                className="px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-black rounded-lg shadow-lg hover:from-gold-500 hover:to-gold-700 transition-colors duration-300 font-semibold"
                                onClick={handleSavePredictions}
                            >
                                Confirm & Save
                            </button>
                            <button
                                className="px-6 py-3 bg-transparent border-2 border-gold-500 text-gold-500 rounded-lg shadow-lg hover:bg-gold-500/10 transition-colors duration-300 font-semibold"
                                onClick={handleCancelReview}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            className="px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-black rounded-lg shadow-lg hover:from-gold-500 hover:to-gold-700 transition-colors duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleSavePredictions}
                            disabled={predictions.length === 0}
                        >
                            Review Predictions
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

