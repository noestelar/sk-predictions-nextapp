// Server Component for data fetching
import { Participant } from '@prisma/client';
import PredictionsClient from './predictions-client';
import prisma from '@/lib/prisma';
import { Suspense } from 'react';

async function ParticipantsList() {
  const participants = await prisma.participant.findMany();
  return <PredictionsClient participants={participants} />;
}

export default function PredictionsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ParticipantsList />
    </Suspense>
  );
}