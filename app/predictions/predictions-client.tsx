'use client'

import React, { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { Participant, CutoffTime } from '@prisma/client'
import Image from 'next/image'
import { Clock, Gift, Sparkles, Save, X, Edit2, Loader2, ArrowRight, CheckCircle, AlertCircle, Users, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PredictionsClientProps {
  participants: Participant[]
  cutoffTime: CutoffTime | null
  isPastCutoff: boolean
}

interface Prediction {
  participantIdGifter: string
  participantIdGiftee: string
}

export default function PredictionsClient({ participants, cutoffTime, isPastCutoff }: PredictionsClientProps) {
  const [predictions, setPredictions] = useState<string[][]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingPredictions, setEditingPredictions] = useState<string[][]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<string>('')
  
  // New state for step-by-step interface
  const [currentStep, setCurrentStep] = useState<'overview' | 'selecting' | 'summary'>('overview')
  const [currentGifter, setCurrentGifter] = useState<string | null>(null)
  const [availableGiftees, setAvailableGiftees] = useState<string[]>([])
  const [stepMessage, setStepMessage] = useState<string>('')
  const [isSelecting, setIsSelecting] = useState(false) // Prevent double-clicks

  useEffect(() => {
    async function fetchPredictions() {
      try {
        const res = await fetch('/api/predictions')
        if (!res.ok) {
          throw new Error('Error al obtener predicciones')
        }
        const data = await res.json()
        const existingPredictions = data.predictions.map((p: Prediction) => [p.participantIdGifter, p.participantIdGiftee])
        
        // Clean up any duplicates that might exist
        const uniquePredictions = existingPredictions.filter((prediction: string[], index: number, array: string[][]) => {
          return array.findIndex((p: string[]) => p[0] === prediction[0] && p[1] === prediction[1]) === index
        })
        
        setPredictions(uniquePredictions)
        setEditingPredictions(uniquePredictions)
        setIsEditing(uniquePredictions.length === 0 && !isPastCutoff)
        setStepMessage(uniquePredictions.length === 0 && !isPastCutoff ? '¡Hora de crear tus predicciones! Haz clic en "Comenzar" para empezar.' : '')
      } catch (error) {
        console.error('Error al obtener predicciones:', error)
        setStepMessage('No pudimos cargar tus predicciones. Intenta refrescar la página.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchPredictions()
  }, [isPastCutoff])

  useEffect(() => {
    if (!cutoffTime) return

    const updateTimeLeft = () => {
      const now = new Date()
      const cutoffDate = new Date(cutoffTime.datetime)

      if (now >= cutoffDate) {
        setTimeLeft('Las predicciones están cerradas')
        setIsEditing(false)
        return
      }

      const diff = cutoffDate.getTime() - now.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s restantes`)
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [cutoffTime])

  const getGifteeForGifter = (gifterId: string) => {
    const prediction = editingPredictions.find((pair) => pair[0] === gifterId)
    return prediction ? prediction[1] : null
  }

  const getGifterForGiftee = (gifteeId: string) => {
    const prediction = editingPredictions.find((pair) => pair[1] === gifteeId)
    return prediction ? prediction[0] : null
  }


  const handleSavePredictions = async () => {
    if (isSubmitting || isPastCutoff) return

    // Validate predictions before saving
    if (!validatePredictions(editingPredictions)) {
      setStepMessage('❌ Error: Hay predicciones duplicadas. Por favor, revisa y elimina las duplicadas.')
      return
    }

    // Check if all participants have pairs
    const allParticipantIds = participants.map(p => p.id)
    const allGifters = editingPredictions.map(pair => pair[0])
    const allGiftees = editingPredictions.map(pair => pair[1])
    
    if (allGifters.length !== allParticipantIds.length || allGiftees.length !== allParticipantIds.length) {
      setStepMessage('❌ Error: Todos los participantes deben tener una pareja asignada.')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predictions: editingPredictions })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al guardar predicciones')
      }

      setPredictions(editingPredictions)
      setIsEditing(false)
      setCurrentStep('overview')
      setStepMessage('✅ ¡Predicciones guardadas exitosamente!')
    } catch (error) {
      console.error(error)
      const message = error instanceof Error ? error.message : 'Ocurrió un error al guardar las predicciones.'
      setStepMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingPredictions(predictions)
    setIsEditing(false)
    setCurrentStep('overview')
    setCurrentGifter(null)
    setStepMessage('')
  }

  // New helper functions for step-by-step interface
  const getNextAvailableGifter = () => {
    const allGifters = participants.map(p => p.id)
    const usedGifters = editingPredictions.map(pair => pair[0])
    return allGifters.find(id => !usedGifters.includes(id))
  }

  const getAvailableGiftees = (gifterId: string) => {
    const allGiftees = participants.map(p => p.id).filter(id => id !== gifterId)
    const usedGiftees = editingPredictions.map(pair => pair[1])
    return allGiftees.filter(id => !usedGiftees.includes(id))
  }

  // Validate predictions to ensure no duplicates
  const validatePredictions = (predictions: string[][]) => {
    const seenGifters = new Set<string>()
    const seenGiftees = new Set<string>()
    
    for (const [gifter, giftee] of predictions) {
      if (seenGifters.has(gifter) || seenGiftees.has(giftee)) {
        return false // Duplicate found
      }
      seenGifters.add(gifter)
      seenGiftees.add(giftee)
    }
    return true
  }

  const startSelection = () => {
    const nextGifter = getNextAvailableGifter()
    if (nextGifter) {
      setCurrentStep('selecting')
      setCurrentGifter(nextGifter)
      setAvailableGiftees(getAvailableGiftees(nextGifter))
      const gifterName = participants.find(p => p.id === nextGifter)?.name
      setStepMessage(`Selecciona a quién le regalará ${gifterName}:`)
    }
  }

  const selectGiftee = (gifteeId: string) => {
    if (!currentGifter || isSelecting) return

    // Check for duplicates before adding
    const duplicateExists = editingPredictions.some(pair => 
      pair[0] === currentGifter || pair[1] === gifteeId
    )

    if (duplicateExists) {
      console.warn('Duplicate prediction prevented:', { currentGifter, gifteeId })
      return
    }

    setIsSelecting(true)

    const newPrediction = [currentGifter, gifteeId]
    const updatedPredictions = [...editingPredictions, newPrediction]
    setEditingPredictions(updatedPredictions)

    // Use setTimeout to prevent rapid clicking and allow UI to update
    setTimeout(() => {
      // Use the updated predictions to find next gifter
      const allGifters = participants.map(p => p.id)
      const usedGifters = updatedPredictions.map(pair => pair[0])
      const nextGifter = allGifters.find(id => !usedGifters.includes(id))
      
      if (nextGifter) {
        setCurrentGifter(nextGifter)
        const allGiftees = participants.map(p => p.id).filter(id => id !== nextGifter)
        const usedGiftees = updatedPredictions.map(pair => pair[1])
        const availableGiftees = allGiftees.filter(id => !usedGiftees.includes(id))
        setAvailableGiftees(availableGiftees)
        const gifterName = participants.find(p => p.id === nextGifter)?.name
        setStepMessage(`Selecciona a quién le regalará ${gifterName}:`)
      } else {
        setCurrentStep('summary')
        setCurrentGifter(null)
        setStepMessage('¡Perfecto! Revisa tus predicciones antes de guardar:')
      }
      setIsSelecting(false)
    }, 300)
  }

  const goBackToSelection = () => {
    setCurrentStep('selecting')
    const nextGifter = getNextAvailableGifter()
    if (nextGifter) {
      setCurrentGifter(nextGifter)
      setAvailableGiftees(getAvailableGiftees(nextGifter))
      const gifterName = participants.find(p => p.id === nextGifter)?.name
      setStepMessage(`Selecciona a quién le regalará ${gifterName}:`)
    }
  }

  const removePrediction = (gifterId: string) => {
    const updatedPredictions = editingPredictions.filter(pair => pair[0] !== gifterId)
    setEditingPredictions(updatedPredictions)
  }

  const cleanupDuplicates = () => {
    const uniquePredictions = editingPredictions.filter((prediction, index, array) => {
      return array.findIndex(p => p[0] === prediction[0] && p[1] === prediction[1]) === index
    })
    setEditingPredictions(uniquePredictions)
    setStepMessage('✅ Duplicados eliminados. Revisa tus predicciones.')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-4 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary font-cinzel">Predicciones SKToxqui</h1>
            <p className="mt-1 text-sm text-primary/70">
              {isPastCutoff ? 'Las predicciones están cerradas.' : 'Crea tus predicciones paso a paso.'}
            </p>
            {cutoffTime && (
              <div className="mt-2 flex items-center gap-2 text-sm text-primary/90 bg-primary/10 rounded-lg px-3 py-2 border border-primary/20">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{timeLeft}</span>
              </div>
            )}
          </div>
        </div>

        {isPastCutoff && (
          <Alert variant="destructive" className="bg-red-950/30 border-red-500/20">
            <AlertTitle className="text-red-400">Predicciones cerradas</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-red-300">
              <span>El tiempo límite ha pasado. Puedes consultar a los ganadores.</span>
              <Button asChild className="bg-primary text-black hover:bg-primary/90 font-semibold" size="sm">
                <a href="/winners">Ver ganadores</a>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {stepMessage && !isPastCutoff && (
          <Alert className="bg-primary/10 border-primary/20">
            <AlertDescription className="text-primary">{stepMessage}</AlertDescription>
          </Alert>
        )}

        {/* Step indicator - Mobile First */}
        {!isPastCutoff && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-6">
            <div className={cn(
              "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border w-full sm:w-auto justify-center",
              currentStep === 'overview' ? "bg-primary/20 border-primary text-primary" : "bg-black/40 border-primary/30 text-primary/60"
            )}>
              <Users className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">1. Vista General</span>
            </div>
            <ArrowRight className="h-4 w-4 text-primary/60 hidden sm:block" />
            <div className={cn(
              "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border w-full sm:w-auto justify-center",
              currentStep === 'selecting' ? "bg-primary/20 border-primary text-primary" : "bg-black/40 border-primary/30 text-primary/60"
            )}>
              <Sparkles className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">2. Seleccionar</span>
            </div>
            <ArrowRight className="h-4 w-4 text-primary/60 hidden sm:block" />
            <div className={cn(
              "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border w-full sm:w-auto justify-center",
              currentStep === 'summary' ? "bg-primary/20 border-primary text-primary" : "bg-black/40 border-primary/30 text-primary/60"
            )}>
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">3. Confirmar</span>
            </div>
          </div>
        )}

        {/* Step 1: Overview */}
        {currentStep === 'overview' && (
          <Card className="border-primary/20 bg-black/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-primary font-cinzel">Vista General</CardTitle>
              <CardDescription className="text-primary/60">
                {isPastCutoff
                  ? 'Consulta las predicciones que registraste.'
                  : predictions.length > 0
                    ? 'Visualiza tus predicciones actuales.'
                    : 'Ve quiénes participan en el intercambio de regalos.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editingPredictions.length > 0 ? (
                // Show predictions with arrows - Mobile First
                <div className="space-y-3">
                  {editingPredictions.map((pair, index) => {
                    const gifter = participants.find(p => p.id === pair[0])
                    const giftee = participants.find(p => p.id === pair[1])
                    if (!gifter || !giftee) return null

                    return (
                      <div key={index} className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl border border-primary/20 bg-black/60">
                        {/* Gifter */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-1">
                          <div className="relative h-10 w-10 sm:h-14 sm:w-14 overflow-hidden rounded-full border-2 border-primary/30 bg-black flex-shrink-0">
                            <Image src={gifter.profilePic} alt={gifter.name} fill className="object-cover" />
                          </div>
                          <div className="flex flex-col items-start flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-semibold text-primary truncate">{gifter.name}</p>
                            <Badge variant="secondary" className="gap-1 bg-primary/20 text-primary border-primary/30 mt-1 text-xs">
                              <Sparkles className="h-3 w-3" />
                              <span className="hidden sm:inline">Regala</span>
                            </Badge>
                          </div>
                        </div>

                        {/* Arrow - Fill space between persons */}
                        <div className="flex items-center flex-1 px-2 sm:px-4">
                          <div className="flex-1 h-px bg-primary/40"></div>
                          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-primary mx-2 sm:mx-3 flex-shrink-0" />
                          <div className="flex-1 h-px bg-primary/40"></div>
                        </div>

                        {/* Giftee */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
                          <div className="flex flex-col items-end flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-semibold text-primary truncate">{giftee.name}</p>
                            <Badge className="gap-1 bg-primary text-black mt-1 text-xs">
                              <Gift className="h-3 w-3" />
                              <span className="hidden sm:inline">Recibe</span>
                            </Badge>
                          </div>
                          <div className="relative h-10 w-10 sm:h-14 sm:w-14 overflow-hidden rounded-full border-2 border-primary bg-black flex-shrink-0">
                            <Image src={giftee.profilePic} alt={giftee.name} fill className="object-cover" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                // Show all participants when no predictions - Mobile First
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {participants.map((participant) => {
                    return (
                      <div
                        key={participant.id}
                        className="flex flex-col items-center gap-2 sm:gap-3 rounded-xl border border-primary/20 bg-black/60 p-3 sm:p-4 text-center"
                      >
                        <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full border-2 border-primary/30 bg-black">
                          <Image src={participant.profilePic} alt={participant.name} fill className="object-cover" />
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <p className="text-sm sm:text-base font-semibold text-primary">{participant.name}</p>
                          <Badge variant="outline" className="gap-1 border-primary/30 text-primary/60 text-xs">
                            <AlertCircle className="h-3 w-3" />
                            <span className="hidden sm:inline">Sin pareja</span>
                            <span className="sm:hidden">Sin par</span>
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Selecting - Mobile First */}
        {currentStep === 'selecting' && currentGifter && (
          <Card className="border-primary/20 bg-black/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-primary font-cinzel">Seleccionar Pareja</CardTitle>
              <CardDescription className="text-sm sm:text-base text-primary/60">
                {stepMessage}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full border-2 border-primary bg-primary/10">
                      <Image 
                        src={participants.find(p => p.id === currentGifter)?.profilePic || ''} 
                        alt={participants.find(p => p.id === currentGifter)?.name || ''} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-primary">
                      {participants.find(p => p.id === currentGifter)?.name}
                    </p>
                    <Badge className="gap-1 bg-primary text-black text-xs">
                      <Sparkles className="h-3 w-3" />
                      Regala
                    </Badge>
                  </div>
                  
                  {/* Arrow with connecting lines */}
                  <div className="flex items-center flex-1 px-4">
                    <div className="flex-1 h-px bg-primary/40"></div>
                    <ArrowRight className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-3 flex-shrink-0" />
                    <div className="flex-1 h-px bg-primary/40"></div>
                  </div>
                  
                  <div className="text-center flex-shrink-0">
                    <p className="text-xs sm:text-sm text-primary/60">Regalará a...</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                {availableGiftees.map((gifteeId) => {
                  const giftee = participants.find(p => p.id === gifteeId)
                  if (!giftee) return null

                  return (
                    <button
                      key={gifteeId}
                      type="button"
                      onClick={() => selectGiftee(gifteeId)}
                      disabled={isSelecting}
                      className={cn(
                        "group relative flex flex-col items-center gap-2 sm:gap-3 rounded-xl border border-primary/20 bg-black/60 p-3 sm:p-4 text-center transition-all hover:border-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20 active:scale-95",
                        isSelecting && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-full border-2 border-primary/30 bg-black">
                        <Image src={giftee.profilePic} alt={giftee.name} fill className="object-cover" />
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <p className="text-sm sm:text-base font-semibold text-primary">{giftee.name}</p>
                        <Badge variant="secondary" className="gap-1 bg-primary/20 text-primary border-primary/30 text-xs">
                          <Gift className="h-3 w-3" />
                          Recibe
                        </Badge>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Summary - Mobile First */}
        {currentStep === 'summary' && (
          <Card className="border-primary/20 bg-black/40 backdrop-blur">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-xl sm:text-2xl text-primary font-cinzel">Resumen de Predicciones</CardTitle>
                  <CardDescription className="text-sm sm:text-base text-primary/60">
                    {stepMessage}
                  </CardDescription>
                </div>
                {editingPredictions.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cleanupDuplicates}
                    className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <AlertCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Limpiar duplicados
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {editingPredictions.map((pair, index) => {
                  const gifter = participants.find(p => p.id === pair[0])
                  const giftee = participants.find(p => p.id === pair[1])
                  if (!gifter || !giftee) return null

                  return (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-lg border border-primary/20 bg-black/60">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full">
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                          <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full border border-primary/30 flex-shrink-0">
                            <Image src={gifter.profilePic} alt={gifter.name} fill className="object-cover" />
                          </div>
                          <span className="text-sm sm:text-base font-semibold text-primary">{gifter.name}</span>
                          <Badge className="gap-1 bg-primary/20 text-primary border-primary/30 text-xs ml-auto sm:ml-0">
                            <Sparkles className="h-3 w-3" />
                            <span className="hidden sm:inline">Regala</span>
                          </Badge>
                        </div>
                        {/* Arrow with connecting lines - only on desktop */}
                        <div className="hidden sm:flex items-center flex-1 px-4">
                          <div className="flex-1 h-px bg-primary/40"></div>
                          <ArrowRight className="h-4 w-4 text-primary/60 mx-3 flex-shrink-0" />
                          <div className="flex-1 h-px bg-primary/40"></div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto pl-12 sm:pl-0">
                          <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full border border-primary/30 flex-shrink-0">
                            <Image src={giftee.profilePic} alt={giftee.name} fill className="object-cover" />
                          </div>
                          <span className="text-sm sm:text-base font-semibold text-primary">{giftee.name}</span>
                          <Badge className="gap-1 bg-primary text-black text-xs ml-auto sm:ml-0">
                            <Gift className="h-3 w-3" />
                            <span className="hidden sm:inline">Recibe</span>
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removePrediction(pair[0])}
                        className="border-red-500/50 text-red-400 bg-red-500/5 hover:bg-red-500/20 hover:border-red-500 w-full sm:w-auto"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="ml-2 sm:hidden">Eliminar</span>
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons - Mobile First */}
        {!isPastCutoff && (
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
            {currentStep === 'overview' && (
              <>
                {predictions.length > 0 ? (
                  <Button 
                    onClick={() => {
                      setIsEditing(true)
                      setCurrentStep('summary')
                      setStepMessage('¡Perfecto! Revisa tus predicciones antes de guardar:')
                    }} 
                    className="w-full sm:min-w-[200px] sm:w-auto bg-primary text-black hover:bg-primary/90 font-semibold"
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Editar predicciones
                  </Button>
                ) : (
                  <Button
                    onClick={startSelection}
                    className="w-full sm:min-w-[200px] sm:w-auto bg-primary text-black hover:bg-primary/90 font-semibold"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Comenzar predicciones
                  </Button>
                )}
              </>
            )}

            {currentStep === 'selecting' && (
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep('overview')} 
                className="w-full sm:min-w-[200px] sm:w-auto border-primary/30 text-primary hover:bg-primary/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            )}

            {currentStep === 'summary' && (
              <>
                <Button 
                  onClick={handleSavePredictions} 
                  disabled={isSubmitting} 
                  className="w-full sm:min-w-[200px] sm:w-auto bg-primary text-black hover:bg-primary/90 font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar predicciones
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={goBackToSelection} 
                  className="w-full sm:min-w-[200px] sm:w-auto border-primary/50 text-primary bg-primary/5 hover:bg-primary/10 hover:border-primary"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Ajustar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit} 
                  className="w-full sm:min-w-[200px] sm:w-auto border-red-500/50 text-red-400 bg-red-500/5 hover:bg-red-500/20 hover:border-red-500"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
