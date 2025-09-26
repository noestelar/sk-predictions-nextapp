'use client'

import { Trophy, Medal, Star } from 'lucide-react'
import { signOut } from 'next-auth/react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Score {
  userId: string
  userName: string
  correctGuesses: number
  totalGuesses: number
}

interface WinnersClientProps {
  scores: Score[]
}

export default function WinnersClient({ scores }: WinnersClientProps) {
  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-8 w-8 text-yellow-500" />
      case 1:
        return <Medal className="h-8 w-8 text-slate-400" />
      case 2:
        return <Medal className="h-8 w-8 text-amber-600" />
      default:
        return <Star className="h-7 w-7 text-gold-400/70" />
    }
  }

  const getHighlightVariant = (index: number) => {
    if (index === 0) return 'bg-yellow-500/10 border-yellow-500'
    if (index === 1) return 'bg-slate-400/10 border-slate-400'
    if (index === 2) return 'bg-amber-600/10 border-amber-600'
    return 'bg-card/70 border-border/60'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted px-4 py-12 text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Ganadores SKToxqui</h1>
            <p className="mt-2 text-muted-foreground">¡Mira quién hizo las predicciones más precisas!</p>
          </div>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
            Cerrar sesión
          </Button>
        </div>

        <div className="space-y-4">
          {scores.map((score, index) => (
            <Card key={score.userId} className={`${getHighlightVariant(index)} transition-shadow hover:shadow-lg`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-4">
                  {getPositionIcon(index)}
                  <div>
                    <CardTitle className="text-2xl font-semibold">{score.userName}</CardTitle>
                    <CardDescription>
                      {score.correctGuesses} aciertos de {score.totalGuesses} predicciones
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="text-base">
                  {((score.correctGuesses / score.totalGuesses) * 100).toFixed(1)}%
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {index === 0 && '🏆 ¡Campeón absoluto de las predicciones!'}
                  {index === 1 && '🥈 Gran actuación, casi perfecto.'}
                  {index === 2 && '🥉 Excelente intuición festiva.'}
                  {index > 2 && 'Gracias por participar y compartir la emoción.'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg">
            <a href="/predictions">Volver a predicciones</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
