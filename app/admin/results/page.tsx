import prisma from '@/lib/prisma'
import AdminResultsClient from './results-client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ResultsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session.user?.isAdmin) {
    redirect('/')
  }

  const [participants, existingResults] = await Promise.all([
    prisma.participant.findMany({ orderBy: { name: 'asc' } }),
    prisma.result.findMany({ select: { gifterId: true, gifteeId: true } })
  ])

  const initialResults = existingResults.map(r => [r.gifterId, r.gifteeId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted px-4 py-12 text-foreground">
      <AdminResultsClient participants={participants} initialResults={initialResults} />
    </div>
  )
}
