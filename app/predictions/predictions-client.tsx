'use client'

import React, { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { Participant, CutoffTime } from '@prisma/client'
import Image from 'next/image'
import { Clock, Gift, Sparkles, Save, X, Edit2, Loader2 } from 'lucide-react'

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
  const [selectedPair, setSelectedPair] = useState<string[]>([])
  const [predictions, setPredictions] = useState<string[][]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingPredictions, setEditingPredictions] = useState<string[][]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [selectionMessage, setSelectionMessage] = useState<string>('')

  useEffect(() => {
    async function fetchPredictions() {
      try {
        const res = await fetch('/api/predictions')
        if (!res.ok) {
          throw new Error('Error al obtener predicciones')
        }
        const data = await res.json()
        const existingPredictions = data.predictions.map((p: Prediction) => [p.participantIdGifter, p.participantIdGiftee])
        setPredictions(existingPredictions)
        setEditingPredictions(existingPredictions)
        setIsEditing(existingPredictions.length === 0 && !isPastCutoff)
        setSelectionMessage(existingPredictions.length === 0 && !isPastCutoff ? 'Selecciona primero quién regala y después quién recibe.' : '')
      } catch (error) {
        console.error('Error al obtener predicciones:', error)
        setSelectionMessage('No pudimos cargar tus predicciones. Intenta refrescar la página.')
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

  const handleSelectParticipant = (id: string) => {
    if (isPastCutoff || !isEditing) return

    setSelectedPair((prev) => {
      if (prev.length === 0) {
        const selectedParticipant = participants.find((p) => p.id === id)
        setSelectionMessage(`Seleccionaste a ${selectedParticipant?.name} como regalador. Ahora elige a quién le dará el regalo.`)
        return [id]
      }

      if (prev.length === 1) {
        if (id === prev[0]) {
          return prev
        }

        const updated = [...prev, id]
        const gifter = participants.find((p) => p.id === updated[0])
        const giftee = participants.find((p) => p.id === updated[1])
        setSelectionMessage(`${gifter?.name} le regalará a ${giftee?.name}`)

        setEditingPredictions((prevPredictions) => {
          const filtered = prevPredictions.filter(
            (pair) => pair[0] !== updated[0] && pair[1] !== updated[1]
          )
          return [...filtered, updated]
        })

        return []
      }

      return prev
    })
  }

  const handleSavePredictions = async () => {
    if (isSubmitting || isPastCutoff) return

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
      setSelectedPair([])
      setSelectionMessage('¡Predicciones guardadas exitosamente!')
    } catch (error) {
      console.error(error)
      const message = error instanceof Error ? error.message : 'Ocurrió un error al guardar las predicciones.'
      setSelectionMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingPredictions(predictions)
    setIsEditing(false)
    setSelectedPair([])
    setSelectionMessage('')
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
              {isPastCutoff ? 'Las predicciones están cerradas.' : 'Selecciona tus parejas antes del tiempo límite.'}
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

        {selectionMessage && !isPastCutoff && (
          <Alert className="bg-primary/10 border-primary/20">
            <AlertDescription className="text-primary">{selectionMessage}</AlertDescription>
          </Alert>
        )}

        <Card className="border-primary/20 bg-black/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-primary font-cinzel">Participantes</CardTitle>
            <CardDescription className="text-primary/60">
              {isPastCutoff
                ? 'Consulta las predicciones que registraste.'
                : isEditing
                  ? 'Selecciona primero quién regala y después quién recibe.'
                  : 'Visualiza tus predicciones y presiona editar para actualizarlas.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {participants.map((participant) => {
                const gifteeId = getGifteeForGifter(participant.id) // Who this participant gives TO
                const gifterId = getGifterForGiftee(participant.id) // Who gives TO this participant
                const isGifter = selectedPair[0] === participant.id
                const isSelected = isGifter || selectedPair[1] === participant.id

                // Check if this participant IS a gifter (gives to someone)
                const isParticipantGifter = editingPredictions.some(pair => pair[0] === participant.id)
                // Check if this participant IS a giftee (receives from someone)
                const isParticipantGiftee = editingPredictions.some(pair => pair[1] === participant.id)

                return (
                  <button
                    key={participant.id}
                    type="button"
                    onClick={() => handleSelectParticipant(participant.id)}
                    className={cn(
                      'group relative flex flex-col items-center gap-3 rounded-xl border border-primary/20 bg-black/60 p-5 text-center transition-all hover:border-primary/60 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
                      isSelected && 'border-primary bg-primary/10 shadow-xl shadow-primary/30 ring-2 ring-primary/30',
                      (isPastCutoff || !isEditing) && 'hover:border-primary/20 hover:bg-black/60 hover:shadow-none'
                    )}
                    disabled={isPastCutoff || !isEditing}
                  >
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-primary/30 bg-black">
                      <Image src={participant.profilePic} alt={participant.name} fill className="object-cover" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-base font-semibold text-primary">{participant.name}</p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {isParticipantGifter && (
                          <Badge variant="secondary" className="gap-1 bg-primary/20 text-primary border-primary/30">
                            <Sparkles className="h-3.5 w-3.5" />
                            Regala
                          </Badge>
                        )}
                        {isParticipantGiftee && (
                          <Badge className="gap-1 bg-primary text-black">
                            <Gift className="h-3.5 w-3.5" />
                            Recibe
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {!isPastCutoff && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSavePredictions} 
                  disabled={isSubmitting} 
                  className="min-w-[220px] bg-primary text-black hover:bg-primary/90 font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar cambios
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit} 
                  className="min-w-[220px] border-primary/30 text-primary hover:bg-primary/10"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </>
            ) : predictions.length > 0 ? (
              <Button 
                onClick={() => setIsEditing(true)} 
                className="min-w-[220px] bg-primary text-black hover:bg-primary/90 font-semibold"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Editar predicciones
              </Button>
            ) : (
              <Button
                onClick={handleSavePredictions}
                disabled={isSubmitting || predictions.length === 0}
                className="min-w-[220px] bg-primary text-black hover:bg-primary/90 font-semibold disabled:opacity-50"
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
            )}
          </div>
        )}
      </div>
    </div>
  )
}
