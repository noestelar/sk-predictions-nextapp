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

    const [predictions, users, results, participants, cutoffTime] = await Promise.all([
        prisma.prediction.findMany(),
        prisma.user.findMany(),
        prisma.result.findMany(),
        prisma.participant.findMany(),
        prisma.cutoffTime.findFirst({ orderBy: { createdAt: 'desc' } })
    ]);

    // Compute leaderboard scores
    const userScores = new Map<string, {
        userId: string;
        userName: string | null;
        correctGuesses: number;
        totalGuesses: number;
    }>();

    predictions.forEach((prediction) => {
        const isCorrect = results.some((result) =>
            result.gifterId === prediction.participantIdGifter &&
            result.gifteeId === prediction.participantIdGiftee
        );

        const user = users.find((u) => u.id === prediction.userId);
        const currentScore = userScores.get(prediction.userId) || {
            userId: prediction.userId,
            userName: user?.name ?? null,
            correctGuesses: 0,
            totalGuesses: 0,
        };

        userScores.set(prediction.userId, {
            ...currentScore,
            correctGuesses: currentScore.correctGuesses + (isCorrect ? 1 : 0),
            totalGuesses: currentScore.totalGuesses + 1,
        });
    });

    const sortedScores = Array.from(userScores.values()).sort((a, b) => b.correctGuesses - a.correctGuesses);

    // Cache only the leaderboard; other reveal data is dynamic and small
    if (redis) {
        await redis.set(LEADERBOARD_CACHE_KEY, JSON.stringify(sortedScores), 'EX', 30);
    }

    const now = new Date();
    const isPastCutoff = cutoffTime ? new Date(cutoffTime.datetime) < now : false;

    // Prepare predictions with user names for tooltips
    const predictionsWithUsers = predictions.map((p) => ({
        userId: p.userId,
        userName: users.find((u) => u.id === p.userId)?.name ?? null,
        participantIdGifter: p.participantIdGifter,
        participantIdGiftee: p.participantIdGiftee,
    }));

    return (
        <WinnersClient
            scores={sortedScores}
            participants={participants}
            results={results}
            predictions={predictionsWithUsers}
            isPastCutoff={isPastCutoff}
        />
    );
}

export default function WinnersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <WinnersList />
    </Suspense>
  )
}
