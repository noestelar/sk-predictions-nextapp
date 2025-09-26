import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import WinnersClient from './winners-client'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

import { redis } from '@/lib/redis'

const LEADERBOARD_CACHE_KEY = 'leaderboard:latest'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function WinnersList() {
    const session = await getServerSession();
    if (!session?.user) {
        redirect('/login');
    }

    if (redis) {
        const cached = await redis.get(LEADERBOARD_CACHE_KEY);
        if (cached) {
            return <WinnersClient scores={JSON.parse(cached)} />;
        }
    }

    const [predictions, users, results] = await Promise.all([
        prisma.prediction.findMany(),
        prisma.user.findMany(),
        prisma.result.findMany()
    ]);

    const userScores = new Map<string, {
        userId: string;
        userName: string;
        correctGuesses: number;
        totalGuesses: number;
    }>();

    predictions.forEach((prediction) => {
        const correctGuess = results.some(
            (result) =>
                result.gifterId === prediction.participantIdGifter &&
                result.gifteeId === prediction.participantIdGiftee
        );

        const user = users.find((u) => u.id === prediction.userId);
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

    const sortedScores = Array.from(userScores.values()).sort(
        (a, b) => b.correctGuesses - a.correctGuesses
    );

    if (redis) {
        await redis.set(LEADERBOARD_CACHE_KEY, JSON.stringify(sortedScores), 'EX', 30);
    }

    return <WinnersClient scores={sortedScores} />;
}

export default function WinnersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <WinnersList />
    </Suspense>
  )
}
