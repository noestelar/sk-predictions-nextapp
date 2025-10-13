"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Trophy, Medal, Star, Gift, ArrowRight, Sparkles, PartyPopper, PlayCircle, SkipForward, Check, X } from 'lucide-react'
import Image from 'next/image'
import { signOut } from 'next-auth/react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

interface Score {
  userId: string
  userName: string | null
  correctGuesses: number
  totalGuesses: number
}

interface ParticipantLite {
  id: string
  name: string
  profilePic: string
}

interface ResultLite {
  gifterId: string
  gifteeId: string
}

interface PredictionWithUser {
  userId: string
  userName: string | null
  participantIdGifter: string
  participantIdGiftee: string
}

interface WinnersClientProps {
  scores: Score[]
  participants: ParticipantLite[]
  results: ResultLite[]
  predictions: PredictionWithUser[]
  isPastCutoff: boolean
}

type Phase = 'intro' | 'gift-animation' | 'prediction-map' | 'results-button' | 'results-reveal' | 'winners'

export default function WinnersClient({ scores, participants, results, predictions, isPastCutoff }: WinnersClientProps) {
  const [phase, setPhase] = useState<Phase>(isPastCutoff ? 'intro' : 'winners')
  const [giftIndex, setGiftIndex] = useState(0)
  const [predictionIndex, setPredictionIndex] = useState(0)
  const [revealedPredictions, setRevealedPredictions] = useState<number>(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const timeoutsRef = useRef<number[]>([])

  const resultsSet = useMemo(() => {
    const set = new Set<string>()
    results.forEach(r => set.add(`${r.gifterId}|${r.gifteeId}`))
    return set
  }, [results])

  // Attach indices to predictions for animation gating and group by user
  const indexedPredictions = useMemo(() => (
    predictions.map((p, idx) => ({ ...p, idx }))
  ), [predictions])

  const predictionsByUser = useMemo(() => {
    const map = new Map<string, { userId: string; userName: string | null; items: typeof indexedPredictions }>()
    indexedPredictions.forEach(p => {
      const key = p.userId
      const existing = map.get(key)
      if (existing) {
        existing.items.push(p)
      } else {
        map.set(key, { userId: key, userName: p.userName ?? null, items: [p] })
      }
    })
    // Return as a stable array sorted by userName
    return Array.from(map.values()).sort((a, b) => (a.userName ?? 'Usuario').localeCompare(b.userName ?? 'Usuario'))
  }, [indexedPredictions])

  // Clean up timeouts on unmount or when skipping
  const clearAllTimers = () => {
    timeoutsRef.current.forEach(id => window.clearTimeout(id))
    timeoutsRef.current = []
  }

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timeoutsRef.current.push(id)
  }

  useEffect(() => {
    if (!isPastCutoff) return

    // Within-phase animations only; no automatic phase changes
    if (phase === 'gift-animation') {
      setGiftIndex(0)
      results.forEach((_, i) => {
        schedule(() => setGiftIndex(i + 1), 900 * (i + 1))
      })
    } else if (phase === 'prediction-map') {
      setPredictionIndex(0)
      predictions.forEach((_, i) => {
        schedule(() => setPredictionIndex(i + 1), 150 * (i + 1))
      })
    } else if (phase === 'results-reveal') {
      setRevealedPredictions(0)
      predictions.forEach((_, i) => {
        schedule(() => {
          setRevealedPredictions(prev => {
            const next = Math.min(predictions.length, prev + 1)
            const p = predictions[i]
            const correct = resultsSet.has(`${p.participantIdGifter}|${p.participantIdGiftee}`)
            if (correct) {
              setShowConfetti(true)
              schedule(() => setShowConfetti(false), 800)
            }
            return next
          })
        }, 100 * (i + 1))
      })
    }

    return () => {
      clearAllTimers()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isPastCutoff])

  const nextPhase = () => {
    clearAllTimers()
    if (phase === 'intro') setPhase('gift-animation')
    else if (phase === 'gift-animation') setPhase('prediction-map')
    else if (phase === 'prediction-map') setPhase('results-button')
    else if (phase === 'results-button') setPhase('results-reveal')
    else if (phase === 'results-reveal') setPhase('winners')
  }

  const skipToWinners = () => {
    clearAllTimers()
    setPhase('winners')
  }

  const replay = () => {
    clearAllTimers()
    setPhase('intro')
  }

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

  const renderIntro = () => (
    <div className="flex items-center justify-center py-8">
      <div className="rounded-2xl border border-primary/30 bg-primary/10 px-6 py-4 text-center shadow-lg">
        <p className="text-lg font-semibold text-primary">¡Ya tenemos ganadores!</p>
        <p className="text-sm text-primary/80">Prepárate para la revelación ✨</p>
      </div>
    </div>
  )

  const renderGiftAnimation = () => (
    <div className="space-y-3">
      {results.slice(0, giftIndex).map((r, i) => {
        const gifter = participants.find(p => p.id === r.gifterId)
        const giftee = participants.find(p => p.id === r.gifteeId)
        if (!gifter || !giftee) return null
        return (
          <Card key={`${r.gifterId}-${r.gifteeId}-${i}`} className="border-primary/30 bg-black/60 backdrop-blur">
            <CardContent className="flex items-center justify-between gap-3 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white/30">
                  <Image src={gifter.profilePic} alt={gifter.name} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white/90">{gifter.name}</p>
                  <Badge className="mt-1 bg-primary text-black"><Sparkles className="mr-1 h-3 w-3" />Regala</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 text-primary/80">
                <div className="h-px w-10 bg-primary/40" />
                <ArrowRight className="h-4 w-4" />
                <div className="h-px w-10 bg-primary/40" />
              </div>
              <div className="flex items-center gap-3">
                <div className="min-w-0 text-right">
                  <p className="truncate text-sm font-semibold text-white/90">{giftee.name}</p>
                  <Badge variant="secondary" className="mt-1 bg-primary/20 text-primary border-primary/30"><Gift className="mr-1 h-3 w-3" />Recibe</Badge>
                </div>
                <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white/30">
                  <Image src={giftee.profilePic} alt={giftee.name} fill className="object-cover" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  const renderPredictionMap = () => (
    <div>
      <div className="mb-3 text-center text-sm text-primary/80">Mapa de predicciones por usuario</div>
      <div className="space-y-4">
        {predictionsByUser.map(group => (
          <Card key={group.userId} className="border-primary/30 bg-black/60 backdrop-blur">
            <CardHeader className="py-3">
              <CardTitle className="text-base text-white/90">Predicciones de {group.userName ?? 'Usuario'}</CardTitle>
              <CardDescription className="text-xs text-primary/70">{group.items.length} predicción(es)</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {group.items
                  .filter(item => item.idx < predictionIndex)
                  .map(item => {
                    const gifter = participants.find(pp => pp.id === item.participantIdGifter)
                    const giftee = participants.find(pp => pp.id === item.participantIdGiftee)
                    if (!gifter || !giftee) return null
                    return (
                      <div key={`${group.userId}-${item.idx}`} className="flex items-center justify-between rounded-lg border border-primary/20 bg-black/50 p-2">
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/20">
                            <Image src={gifter.profilePic} alt={gifter.name} fill className="object-cover" />
                          </div>
                          <span className="truncate text-sm text-white/90">{gifter.name}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-primary/70" />
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm text-white/90">{giftee.name}</span>
                          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/20">
                            <Image src={giftee.profilePic} alt={giftee.name} fill className="object-cover" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderResultsButton = () => (
    <div className="flex items-center justify-center py-6">
      <Button size="lg" className="bg-primary text-black hover:bg-primary/90 font-semibold" onClick={() => setPhase('results-reveal')}>
        <PlayCircle className="mr-2 h-5 w-5" /> Ver resultados
      </Button>
    </div>
  )

  const renderResultsReveal = () => (
    <div>
      <div className="mb-3 text-center text-sm text-primary/80">Resultados de predicciones por usuario</div>
      <div className="space-y-4">
        {predictionsByUser.map(group => (
          <Card key={`reveal-${group.userId}`} className="border-primary/30 bg-black/60 backdrop-blur">
            <CardHeader className="py-3">
              <CardTitle className="text-base text-white/90">Predicciones de {group.userName ?? 'Usuario'}</CardTitle>
              <CardDescription className="text-xs text-primary/70">{group.items.length} predicción(es)</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {group.items
                  .filter(item => item.idx < revealedPredictions)
                  .map(item => {
                    const gifter = participants.find(pp => pp.id === item.participantIdGifter)
                    const giftee = participants.find(pp => pp.id === item.participantIdGiftee)
                    if (!gifter || !giftee) return null
                    const correct = resultsSet.has(`${item.participantIdGifter}|${item.participantIdGiftee}`)
                    return (
                      <div key={`res-${group.userId}-${item.idx}`} className={`flex items-center justify-between rounded-lg border p-2 transition-colors ${correct ? 'border-emerald-500/40 bg-emerald-600/15' : 'border-red-500/40 bg-red-600/15'}`}>
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/20">
                            <Image src={gifter.profilePic} alt={gifter.name} fill className="object-cover" />
                          </div>
                          <span className="truncate text-sm text-white/90">{gifter.name}</span>
                        </div>
                        {correct ? <Check className="h-4 w-4 text-emerald-300" /> : <X className="h-4 w-4 text-red-300" />}
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm text-white/90">{giftee.name}</span>
                          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/20">
                            <Image src={giftee.profilePic} alt={giftee.name} fill className="object-cover" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 flex items-start justify-center">
          <div className="mt-10 grid grid-cols-8 gap-2 opacity-90">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className="select-none text-lg sm:text-2xl animate-bounce" style={{ animationDelay: `${(i % 8) * 80}ms` }}>🎉</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-black px-4 py-12 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Ganadores SKToxqui</h1>
            <p className="mt-2 text-sm sm:text-base text-primary/70">¡Mira quién hizo las predicciones más precisas!</p>
          </div>
          <div className="flex items-center gap-2">
            {(isPastCutoff && phase !== 'winners') && (
              <Button onClick={nextPhase} className="bg-primary text-black hover:bg-primary/90 font-semibold">
                Siguiente
              </Button>
            )}
            {(phase !== 'winners') && (
              <Button variant="outline" onClick={skipToWinners} className="border-primary/40 text-primary bg-transparent hover:bg-primary/10">
                <SkipForward className="mr-2 h-4 w-4" /> Saltar animación
              </Button>
            )}
            <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })} className="border-primary/40 text-primary bg-transparent hover:bg-primary/10">
              Cerrar sesión
            </Button>
          </div>
        </div>

        {isPastCutoff && phase === 'intro' && renderIntro()}
        {isPastCutoff && phase === 'gift-animation' && renderGiftAnimation()}
        {isPastCutoff && phase === 'prediction-map' && renderPredictionMap()}
        {isPastCutoff && phase === 'results-button' && renderResultsButton()}
        {isPastCutoff && phase === 'results-reveal' && renderResultsReveal()}

        {(phase === 'winners') && (
          <>
            <div className="space-y-4">
              {scores.map((score, index) => (
                <Card key={score.userId} className={`${getHighlightVariant(index)} transition-shadow hover:shadow-lg`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-4">
                      {getPositionIcon(index)}
                      <div>
                        <CardTitle className="text-2xl font-semibold text-primary">{score.userName ?? 'Usuario'}</CardTitle>
                        <CardDescription>
                          {score.correctGuesses} aciertos de {score.totalGuesses} predicciones
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-base bg-primary/20 text-primary border border-primary/30">
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
            <div className="flex items-center justify-center gap-3 pt-2">
              {isPastCutoff && (
                <Button variant="outline" onClick={replay} className="border-primary/40 text-primary bg-transparent hover:bg-primary/10">
                  <PlayCircle className="mr-2 h-4 w-4" /> Reproducir animación
                </Button>
              )}
              <Button asChild size="lg">
                <a href="/predictions">Volver a predicciones</a>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
