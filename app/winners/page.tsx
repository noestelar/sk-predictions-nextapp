import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import WinnersClient from './winners-client';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function WinnersList() {
    const session = await getServerSession();
    if (!session?.user) {
        redirect('/login');
    }

    // Fetch all predictions and users
    const predictions = await prisma.prediction.findMany();
    const users = await prisma.user.findMany();

    // Fetch actual results
    const results = await prisma.result.findMany();

    // Calculate scores for each user
    const userScores = new Map();

    predictions.forEach((prediction) => {
        const correctGuess = results.some(
            (result) =>
                result.gifterId === prediction.participantIdGifter &&
                result.gifteeId === prediction.participantIdGiftee
        );

        const user = users.find(u => u.id === prediction.userId);
        const currentScore = userScores.get(prediction.userId) || {
            userId: prediction.userId,
            userName: user?.name || 'Unknown User',
            correctGuesses: 0,
            totalGuesses: 0,
        };

        userScores.set(prediction.userId, {
            ...currentScore,
            correctGuesses: currentScore.correctGuesses + (correctGuess ? 1 : 0),
            totalGuesses: currentScore.totalGuesses + 1,
        });
    });

    // Convert scores to array and sort by correct guesses
    const sortedScores = Array.from(userScores.values()).sort(
        (a, b) => b.correctGuesses - a.correctGuesses
    );

    return <WinnersClient scores={sortedScores} />;
}

export default function WinnersPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
            </div>
        }>
            <WinnersList />
        </Suspense>
    );
} 