// Server Component for data fetching
import { Participant } from '@prisma/client';
import PredictionsClient from './predictions-client';
import prisma from '@/lib/prisma';
import { Suspense } from 'react';

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
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    }>
      <ParticipantsList />
    </Suspense>
  );
}