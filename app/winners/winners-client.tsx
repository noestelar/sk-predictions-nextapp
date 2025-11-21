"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Trophy, Medal, Star, Gift, ArrowRight, Sparkles, Crown, PlayCircle, SkipForward, Check, X, UserCircle } from 'lucide-react'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import Confetti from 'react-confetti'

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
  userImage: string | null
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

const AnimatedScore = ({ value }: { value: number }) => {
  const [currentValue, setCurrentValue] = useState(0)

  useEffect(() => {
    const animation = requestAnimationFrame(() => setCurrentValue(value))
    return () => cancelAnimationFrame(animation)
  }, [value])

  return <span>{Math.round(currentValue)}</span>
}

export default function WinnersClient({ scores, participants, results, predictions, isPastCutoff }: WinnersClientProps) {
  const [phase, setPhase] = useState<Phase>(isPastCutoff ? 'intro' : 'winners')
  const [giftIndex, setGiftIndex] = useState(0)
  const [predictionIndex, setPredictionIndex] = useState(0)
  const [revealedPredictions, setRevealedPredictions] = useState<number>(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  // Detect if device supports hover (desktop)
  useEffect(() => {
    const checkDesktop = () => {
      const hasHover = window.matchMedia('(hover: hover)').matches
      const isWideScreen = window.innerWidth > 768
      setIsDesktop(hasHover && isWideScreen)
    }

    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  useEffect(() => {
    if (phase === 'winners') {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 8000) // Confetti for 8 seconds
      return () => clearTimeout(timer)
    }
  }, [phase])

  const resultsSet = useMemo(() => {
    const set = new Set<string>()
    results.forEach(r => set.add(`${r.gifterId}|${r.gifteeId}`))
    return set
  }, [results])

  const indexedPredictions = useMemo(() => predictions.map((p, idx) => ({ ...p, idx })), [predictions])

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
    return Array.from(map.values()).sort((a, b) => (a.userName ?? 'Usuario').localeCompare(b.userName ?? 'Usuario'))
  }, [indexedPredictions])

  const clearAllTimers = () => {
    timeoutsRef.current.forEach(id => clearTimeout(id))
    timeoutsRef.current = []
  }

  const schedule = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
  }

  useEffect(() => {
    if (!isPastCutoff) return

    if (phase === 'gift-animation') {
      setGiftIndex(0)
      results.forEach((_, i) => schedule(() => setGiftIndex(i + 1), 900 * (i + 1)))
    } else if (phase === 'prediction-map') {
      setPredictionIndex(0)
      predictions.forEach((_, i) => schedule(() => setPredictionIndex(i + 1), 150 * (i + 1)))
    } else if (phase === 'results-reveal') {
      setRevealedPredictions(0)
      predictions.forEach((_, i) => {
        schedule(() => {
          setRevealedPredictions(prev => Math.min(predictions.length, prev + 1))
        }, 100 * (i + 1))
      })
    }

    return clearAllTimers
  }, [phase, isPastCutoff, predictions, results])

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
    if (index === 0) return <Crown className="h-8 w-8 text-amber-900" />
    if (index === 1) return <Medal className="h-8 w-8 text-slate-800" />
    if (index === 2) return <Medal className="h-8 w-8 text-orange-900" />
    return <Star className="h-7 w-7 text-gray-400/70" />
  }

  const getHighlightVariant = (index: number) => {
    if (index === 0) return 'metal-card metal-gold'
    if (index === 1) return 'metal-card metal-silver'
    if (index === 2) return 'metal-card metal-bronze'
    return 'bg-card/70 border-border/60'
  }

  const getTextColorClass = (index: number) => {
    if (index === 0) return 'text-amber-950'
    if (index === 1) return 'text-slate-900'
    if (index === 2) return 'text-orange-950'
    return 'text-primary'
  }

  const getSubTextColorClass = (index: number) => {
    if (index === 0) return 'text-amber-900/80'
    if (index === 1) return 'text-slate-800/80'
    if (index === 2) return 'text-orange-900/80'
    return 'text-gray-400'
  }

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardRef: HTMLDivElement) => {
    if (!isDesktop) return
    const rect = cardRef.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -12
    const rotateY = ((x - centerX) / centerX) * 12

    cardRef.style.setProperty('--card-rotate-x', `${rotateX}deg`)
    cardRef.style.setProperty('--card-rotate-y', `${rotateY}deg`)
  }

  const handleCardMouseLeave = (cardRef: HTMLDivElement) => {
    if (!isDesktop) return
    cardRef.style.setProperty('--card-rotate-x', '0deg')
    cardRef.style.setProperty('--card-rotate-y', '0deg')
  }

  const renderIntro = () => (
    <div className="flex items-center justify-center py-8">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-center shadow-lg backdrop-blur-sm">
        <p className="text-lg font-semibold text-amber-300">¡Ya tenemos ganadores!</p>
        <p className="text-sm text-amber-200/80">Prepárate para la revelación ✨</p>
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
          <Card key={`${r.gifterId}-${r.gifteeId}-${i}`} className="border-amber-500/30 bg-zinc-900/80 backdrop-blur-sm animate-fade-in">
            <CardContent className="flex items-center justify-between gap-3 p-4 text-zinc-200">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-amber-500/30">
                  <Image src={gifter.profilePic} alt={gifter.name} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-100">{gifter.name}</p>
                  <Badge className="mt-1 bg-amber-500 text-black hover:bg-amber-400"><Sparkles className="mr-1 h-3 w-3" />Regala</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 text-amber-500/80">
                <div className="h-px w-10 bg-amber-500/40" />
                <ArrowRight className="h-4 w-4" />
                <div className="h-px w-10 bg-amber-500/40" />
              </div>
              <div className="flex items-center gap-3">
                <div className="min-w-0 text-right">
                  <p className="truncate text-sm font-semibold text-zinc-100">{giftee.name}</p>
                  <Badge variant="secondary" className="mt-1 bg-amber-500/20 text-amber-300 border-amber-500/30"><Gift className="mr-1 h-3 w-3" />Recibe</Badge>
                </div>
                <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-amber-500/30">
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
      <div className="mb-3 text-center text-sm text-amber-200/80">Mapa de predicciones por usuario</div>
      <div className="space-y-4">
        {predictionsByUser.map(group => (
          <Card key={group.userId} className="border-amber-500/30 bg-zinc-900/80 backdrop-blur-sm animate-fade-in">
            <CardHeader className="py-3">
              <CardTitle className="text-base text-zinc-100">Predicciones de {group.userName ?? 'Usuario'}</CardTitle>
              <CardDescription className="text-xs text-amber-500/70">{group.items.length} predicción(es)</CardDescription>
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
                      <div key={`${group.userId}-${item.idx}`} className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-zinc-950/50 p-2 animate-fade-in-sm">
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-zinc-700">
                            <Image src={gifter.profilePic} alt={gifter.name} fill className="object-cover" />
                          </div>
                          <span className="truncate text-sm text-zinc-300">{gifter.name}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-amber-500/70" />
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm text-zinc-300">{giftee.name}</span>
                          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-zinc-700">
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
      <Button size="lg" className="bg-amber-500 text-black hover:bg-amber-400 font-semibold animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.4)]" onClick={() => setPhase('results-reveal')}>
        <PlayCircle className="mr-2 h-5 w-5" /> Ver resultados
      </Button>
    </div>
  )

  const renderResultsReveal = () => (
    <div>
      <div className="mb-3 text-center text-sm text-amber-200/80">Resultados de predicciones</div>
      <div className="space-y-4">
        {predictionsByUser.map(group => (
          <Card key={`reveal-${group.userId}`} className="border-amber-500/30 bg-zinc-900/80 backdrop-blur-sm">
            <CardHeader className="py-3">
              <CardTitle className="text-base text-zinc-100">Predicciones de {group.userName ?? 'Usuario'}</CardTitle>
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
                      <div key={`res-${group.userId}-${item.idx}`} className={`flex items-center justify-between rounded-lg border p-2 transition-colors duration-300 ${correct ? 'border-emerald-500/40 bg-emerald-900/20' : 'border-red-500/40 bg-red-900/20'}`}>
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-zinc-700">
                            <Image src={gifter.profilePic} alt={gifter.name} fill className="object-cover" />
                          </div>
                          <span className="truncate text-sm text-zinc-300">{gifter.name}</span>
                        </div>
                        {correct ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-red-400" />}
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm text-zinc-300">{giftee.name}</span>
                          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-zinc-700">
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500/30">
      {showConfetti && <Confetti width={typeof window !== 'undefined' ? window.innerWidth : 0} height={typeof window !== 'undefined' ? window.innerHeight : 0} recycle={false} numberOfPieces={600} gravity={0.15} />}

      {/* Luxurious Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-zinc-950 to-zinc-950" />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600/10 via-transparent to-transparent" />
        <div className="pattern-bg absolute inset-0 opacity-[0.15]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 drop-shadow-lg font-serif">Ganadores SKToxqui</h1>
            <p className="mt-2 text-sm sm:text-base text-amber-200/80">¡Mira quién hizo las predicciones más precisas!</p>
          </div>
          <div className="flex items-center gap-2">
            {(isPastCutoff && phase !== 'winners') && (
              <Button onClick={nextPhase} className="bg-amber-500 text-black hover:bg-amber-400 font-semibold">
                Siguiente
              </Button>
            )}
            {(phase !== 'winners') && (
              <Button variant="outline" onClick={skipToWinners} className="border-amber-500/40 text-amber-400 bg-transparent hover:bg-amber-500/10">
                <SkipForward className="mr-2 h-4 w-4" /> Saltar
              </Button>
            )}
            <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })} className="border-amber-500/40 text-amber-400 bg-transparent hover:bg-amber-500/10">
              Salir
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
              {scores.map((score, index) => {
                const isMetal = index < 3
                return (
                  <div key={score.userId} className={`${isMetal ? 'metal-card-container' : ''} animate-fade-in`} style={{ animationDelay: `${index * 150}ms` }}>
                    <Card
                      onMouseMove={e => isMetal && handleCardMouseMove(e, e.currentTarget)}
                      onMouseLeave={(e) => isMetal && handleCardMouseLeave(e.currentTarget)}
                      className={`${getHighlightVariant(index)} ${isMetal ? '' : 'bg-zinc-900/50 border-zinc-800'} transition-shadow duration-300 hover:shadow-2xl`}
                    >
                      {isMetal && <div className="metal-card-inner" />}
                      <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center">{getPositionIcon(index)}</div>
                          <div className="flex items-center gap-3">
                            <div className={`relative h-12 w-12 overflow-hidden rounded-full border-2 ${isMetal ? 'border-black/20' : 'border-amber-500/40'} bg-black/20`}>
                              {score.userImage ? (
                                <Image src={score.userImage} alt={score.userName ?? 'Usuario'} fill className="object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-primary/60">
                                  <UserCircle className="h-10 w-10" />
                                </div>
                              )}
                            </div>
                            <div>
                              <CardTitle className={`text-xl font-bold ${isMetal ? getTextColorClass(index) : 'text-amber-400'}`}>
                                {score.userName ?? 'Usuario'}
                              </CardTitle>
                              <CardDescription className={`text-sm ${isMetal ? getSubTextColorClass(index) : 'text-zinc-400'}`}>
                                <AnimatedScore value={score.correctGuesses} /> de {score.totalGuesses} aciertos
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className={`text-lg font-bold ${isMetal ? 'badge-contrast' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                          {score.totalGuesses > 0 ? ((score.correctGuesses / score.totalGuesses) * 100).toFixed(0) : 0}%
                        </Badge>
                      </CardHeader>
                      <CardContent className="relative z-10 px-4 pb-4">
                        <div className={`text-sm ${isMetal ? getSubTextColorClass(index) : 'text-zinc-500'}`}>
                          {index === 0 && '🏆 ¡Campeón absoluto de las predicciones!'}
                          {index === 1 && '🥈 Gran actuación, casi perfecto.'}
                          {index === 2 && '🥉 Excelente intuición festiva.'}
                          {index > 2 && 'Gracias por participar y compartir la emoción.'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-center gap-3 pt-4">
              {isPastCutoff && (
                <Button variant="outline" onClick={replay} className="border-amber-500/40 text-amber-400 bg-transparent hover:bg-amber-500/10">
                  <PlayCircle className="mr-2 h-4 w-4" /> Reproducir de nuevo
                </Button>
              )}
              <Button asChild size="lg" className="bg-amber-500 text-black hover:bg-amber-400 font-bold">
                <a href="/predictions">Volver a predicciones</a>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
