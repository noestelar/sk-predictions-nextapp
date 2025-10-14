// Server Component for data fetching
import PredictionsClient from './predictions-client'
import prisma from '@/lib/prisma'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function ParticipantsList() {
  const participants = await prisma.participant.findMany();
  const cutoffTime = await prisma.cutoffTime.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  const now = new Date();
  const isPastCutoff = cutoffTime && new Date(cutoffTime.datetime) < now;

  return (
    <PredictionsClient
      participants={participants}
      cutoffTime={cutoffTime}
      isPastCutoff={isPastCutoff || false}
    />
  );
}

export default function PredictionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <ParticipantsList />
    </Suspense>
  )
}
