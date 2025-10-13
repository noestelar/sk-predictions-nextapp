'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Gift, Save, X, Loader2 } from 'lucide-react'
import { Participant } from '@prisma/client'
import Image from 'next/image'

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

interface Result {
  gifterId: string
  gifteeId: string
  gifter: Participant
  giftee: Participant
}

export default function ResultsPage() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selectedPair, setSelectedPair] = useState<string[]>([])
  const [results, setResults] = useState<string[][]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectionMessage, setSelectionMessage] = useState<string>('Selecciona primero quién regala y después quién recibe.')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/')
    }
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const participantsRes = await fetch('/api/participants')
        if (!participantsRes.ok) {
          throw new Error('No pudimos cargar a los participantes')
        }
        const participantsData = await participantsRes.json()
        setParticipants(participantsData.participants)

        const resultsRes = await fetch('/api/admin/results')
        if (!resultsRes.ok) {
          throw new Error('No pudimos cargar los resultados guardados')
        }
        const resultsData = await resultsRes.json()
        const existingResults = resultsData.results.map((r: Result) => [r.gifterId, r.gifteeId])
        setResults(existingResults)
        if (existingResults.length > 0) {
          setSelectionMessage('Haz clic en cualquier pareja para actualizarla o limpia todo para empezar de nuevo.')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        const message = error instanceof Error ? error.message : 'No pudimos cargar la información inicial.'
        setErrorMessage(message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const getGifteeForGifter = (gifterId: string) => {
    const pair = results.find(([g]) => g === gifterId)
    return pair ? pair[1] : null
  }

  const getGifterForGiftee = (gifteeId: string) => {
    const pair = results.find(([gifter, giftee]) => giftee === gifteeId)
    return pair ? pair[0] : null
  }

  const handleSelectParticipant = (participantId: string) => {
    setSelectionMessage('')

    if (selectedPair.length === 0) {
      const participant = participants.find((p) => p.id === participantId)
      setSelectedPair([participantId])
      setSelectionMessage(`Seleccionaste a ${participant?.name} como regalador. Ahora elige a quién le regaló.`)
      return
    }

    if (selectedPair[0] === participantId) {
      setSelectedPair([])
      setSelectionMessage('Selección cancelada.')
      return
    }

    const updatedPair: string[] = [selectedPair[0], participantId]
    const existingGifterPair = results.find((pair) => pair[0] === updatedPair[0])

    if (existingGifterPair) {
      const updatedResults = results.map((pair) => (pair[0] === updatedPair[0] ? updatedPair : pair))
      setResults(updatedResults)
    } else {
      setResults([...results, updatedPair])
    }

    const gifter = participants.find((p) => p.id === updatedPair[0])
    const giftee = participants.find((p) => p.id === updatedPair[1])
    setSelectionMessage(`${gifter?.name} le regaló a ${giftee?.name}. Puedes seguir asignando más parejas.`)
    setSelectedPair([])
  }

  const handleSaveResults = async () => {
    if (isSubmitting || results.length === 0) return

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const response = await fetch('/api/admin/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ results })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'No se pudieron guardar los resultados')
      }

      router.push('/admin')
    } catch (error) {
      console.error('Error saving results:', error)
      const message = error instanceof Error ? error.message : 'No se pudieron guardar los resultados. Intenta nuevamente.'
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClearResults = () => {
    setResults([])
    setSelectedPair([])
    setSelectionMessage('Asignaciones reiniciadas. Selecciona quién regala y quién recibe.')
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border/60 bg-card/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              No tienes permisos para acceder a esta página.
            </CardDescription>
            <Button onClick={() => router.push('/')} className="mt-4 w-full">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted px-4 py-12 text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight">Resultados oficiales</h1>
          <p className="mt-2 text-muted-foreground">Asigna quién regaló a quién para calcular las puntuaciones.</p>
        </div>

        <Card className="border-border/60 bg-card/85 backdrop-blur">
          <CardHeader className="items-center space-y-3 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Gift className="h-8 w-8" />
            </span>
            <CardTitle className="text-2xl">Participantes</CardTitle>
            <CardDescription>
              Haz clic primero en quien regaló y después en la persona que recibió el regalo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertTitle>Ocurrió un problema</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {selectionMessage && (
              <Alert variant="info">
                <AlertDescription>{selectionMessage}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {participants.map((participant) => {
                const gifteeId = getGifteeForGifter(participant.id)
                const gifterId = getGifterForGiftee(participant.id)
                const isGifter = selectedPair[0] === participant.id
                const isSelected = isGifter || selectedPair[1] === participant.id

                return (
                  <button
                    key={participant.id}
                    type="button"
                    onClick={() => handleSelectParticipant(participant.id)}
                    className={cn(
                      'group relative flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-5 text-center transition-all hover:border-primary/60 hover:bg-primary/5',
                      isSelected && 'border-primary bg-primary/10 shadow-lg'
                    )}
                  >
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border border-border/60 bg-muted">
                      <Image src={participant.profilePic} alt={participant.name} fill className="object-cover" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-base font-semibold">{participant.name}</p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {gifterId && (
                          <Badge variant="secondary" className="gap-1">
                            <Gift className="h-3.5 w-3.5" />
                            Regaló
                          </Badge>
                        )}
                        {gifteeId && (
                          <Badge className="gap-1">
                            <Gift className="h-3.5 w-3.5" />
                            Recibió
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

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={handleSaveResults} disabled={isSubmitting || results.length === 0} className="min-w-[220px]">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar resultados
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleClearResults} disabled={results.length === 0} className="min-w-[220px]">
            <X className="mr-2 h-4 w-4" />
            Limpiar todo
          </Button>
        </div>
      </div>
    </div>
  )
}
