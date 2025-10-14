'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Participant } from '@prisma/client'
import { Gift, Sparkles, Save, X, Loader2, ArrowRight, CheckCircle, Users, ArrowLeft, AlertCircle, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AdminResultsClientProps {
  participants: Participant[]
  initialResults: string[][]
}

export default function AdminResultsClient({ participants, initialResults }: AdminResultsClientProps) {
  const router = useRouter()

  const [results, setResults] = useState<string[][]>(initialResults || [])
  const [editingResults, setEditingResults] = useState<string[][]>(initialResults || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [stepMessage, setStepMessage] = useState<string>('')

  const [currentStep, setCurrentStep] = useState<'overview' | 'selecting' | 'summary'>('overview')
  const [currentGifter, setCurrentGifter] = useState<string | null>(null)
  const [availableGiftees, setAvailableGiftees] = useState<string[]>([])
  const [isSelecting, setIsSelecting] = useState(false)

  useEffect(() => {
    if ((initialResults || []).length === 0) {
      setStepMessage('¡Hora de capturar los resultados! Haz clic en "Comenzar" para empezar.')
    } else {
      setStepMessage('Revisa y ajusta los resultados capturados, luego guarda los cambios.')
    }
  }, [initialResults])

  const getNextAvailableGifter = () => {
    const allGifters = participants.map(p => p.id)
    const usedGifters = editingResults.map(pair => pair[0])
    return allGifters.find(id => !usedGifters.includes(id))
  }

  const getAvailableGiftees = (gifterId: string) => {
    const allGiftees = participants.map(p => p.id).filter(id => id !== gifterId)
    const usedGiftees = editingResults.map(pair => pair[1])
    return allGiftees.filter(id => !usedGiftees.includes(id))
  }

  const validateResults = (pairs: string[][]) => {
    const seenGifters = new Set<string>()
    const seenGiftees = new Set<string>()
    for (const [gifter, giftee] of pairs) {
      if (seenGifters.has(gifter) || seenGiftees.has(giftee)) return false
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
      setStepMessage(`Selecciona a quién le regaló ${gifterName}:`)
    }
  }

  const selectGiftee = (gifteeId: string) => {
    if (!currentGifter || isSelecting) return

    const duplicateExists = editingResults.some(pair => pair[0] === currentGifter || pair[1] === gifteeId)
    if (duplicateExists) return

    setIsSelecting(true)

    const newPair: string[] = [currentGifter, gifteeId]
    const updated = [...editingResults, newPair]
    setEditingResults(updated)

    setTimeout(() => {
      const allGifters = participants.map(p => p.id)
      const usedGifters = updated.map(pair => pair[0])
      const nextGifter = allGifters.find(id => !usedGifters.includes(id))

      if (nextGifter) {
        setCurrentGifter(nextGifter)
        const allGiftees = participants.map(p => p.id).filter(id => id !== nextGifter)
        const usedGiftees = updated.map(pair => pair[1])
        const avail = allGiftees.filter(id => !usedGiftees.includes(id))
        setAvailableGiftees(avail)
        const gifterName = participants.find(p => p.id === nextGifter)?.name
        setStepMessage(`Selecciona a quién le regaló ${gifterName}:`)
      } else {
        setCurrentStep('summary')
        setCurrentGifter(null)
        setStepMessage('¡Perfecto! Revisa los resultados antes de guardar:')
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
      setStepMessage(`Selecciona a quién le regaló ${gifterName}:`)
    }
  }

  const removePair = (gifterId: string) => {
    const updated = editingResults.filter(pair => pair[0] !== gifterId)
    setEditingResults(updated)
  }

  const cleanupDuplicates = () => {
    const unique = editingResults.filter((prediction, index, array) => {
      return array.findIndex(p => p[0] === prediction[0] && p[1] === prediction[1]) === index
    })
    setEditingResults(unique)
    setStepMessage('✅ Duplicados eliminados. Revisa los resultados.')
  }

  const handleClearAll = () => {
    setEditingResults([])
    setStepMessage('Todos los resultados han sido eliminados. Puedes empezar de nuevo.')
  }

  const handleCancel = () => {
    setEditingResults(results)
    setCurrentStep('overview')
    setCurrentGifter(null)
    setStepMessage('')
  }

  const handleSaveResults = async () => {
    if (isSubmitting) return

    if (!validateResults(editingResults)) {
      setStepMessage('❌ Error: Hay parejas duplicadas. Revisa y elimina duplicados.')
      return
    }

    const allParticipantIds = participants.map(p => p.id)
    const allGifters = editingResults.map(pair => pair[0])
    const allGiftees = editingResults.map(pair => pair[1])
    if (allGifters.length !== allParticipantIds.length || allGiftees.length !== allParticipantIds.length) {
      setStepMessage('❌ Error: Todos los participantes deben tener una pareja asignada.')
      return
    }

    try {
      setIsSubmitting(true)
      setIsLoading(true)
      const res = await fetch('/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: editingResults })
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al guardar resultados')
      }
      setResults(editingResults)
      setCurrentStep('overview')
      setStepMessage('✅ ¡Resultados guardados exitosamente!')
      router.push('/admin')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error al guardar los resultados.'
      setStepMessage(message)
    } finally {
      setIsSubmitting(false)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Resultados oficiales</h1>
        <p className="mt-2 text-muted-foreground">Asigna quién regaló a quién para calcular las puntuaciones.</p>
      </div>

      {stepMessage && (
        <Alert className="bg-primary/10 border-primary/20">
          <AlertDescription className="text-primary">{stepMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-6">
        <div className={cn(
          'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border w-full sm:w-auto justify-center',
          currentStep === 'overview' ? 'bg-primary/20 border-primary text-primary' : 'bg-background border-primary/30 text-primary/60'
        )}>
          <Users className="h-4 w-4" />
          <span className="text-xs sm:text-sm font-medium">1. Vista General</span>
        </div>
        <ArrowRight className="h-4 w-4 text-primary/60 hidden sm:block" />
        <div className={cn(
          'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border w-full sm:w-auto justify-center',
          currentStep === 'selecting' ? 'bg-primary/20 border-primary text-primary' : 'bg-background border-primary/30 text-primary/60'
        )}>
          <Sparkles className="h-4 w-4" />
          <span className="text-xs sm:text-sm font-medium">2. Seleccionar</span>
        </div>
        <ArrowRight className="h-4 w-4 text-primary/60 hidden sm:block" />
        <div className={cn(
          'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border w-full sm:w-auto justify-center',
          currentStep === 'summary' ? 'bg-primary/20 border-primary text-primary' : 'bg-background border-primary/30 text-primary/60'
        )}>
          <CheckCircle className="h-4 w-4" />
          <span className="text-xs sm:text-sm font-medium">3. Confirmar</span>
        </div>
      </div>

      {currentStep === 'overview' && (
        <Card className="border-border/60 bg-card/85 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl">Vista General</CardTitle>
            <CardDescription className="text-muted-foreground">
              {editingResults.length > 0 ? 'Visualiza los resultados actuales.' : 'Ve quiénes participaron en el intercambio de regalos.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editingResults.length > 0 ? (
              <div className="space-y-3">
                {editingResults.map((pair, index) => {
                  const gifter = participants.find(p => p.id === pair[0])
                  const giftee = participants.find(p => p.id === pair[1])
                  if (!gifter || !giftee) return null

                  return (
                    <div key={index} className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl border border-primary/20 bg-background">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1">
                        <div className="relative h-10 w-10 sm:h-14 sm:w-14 overflow-hidden rounded-full border-2 border-primary/30 bg-background flex-shrink-0">
                          <Image src={gifter.profilePic} alt={gifter.name} fill className="object-cover" />
                        </div>
                        <div className="flex flex-col items-start flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-semibold">{gifter.name}</p>
                          <Badge variant="secondary" className="gap-1 bg-primary/20 text-primary border-primary/30 mt-1 text-xs">
                            <Sparkles className="h-3 w-3" />
                            <span className="hidden sm:inline">Regaló</span>
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center flex-1 px-2 sm:px-4">
                        <div className="flex-1 h-px bg-primary/40"></div>
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-primary mx-2 sm:mx-3 flex-shrink-0" />
                        <div className="flex-1 h-px bg-primary/40"></div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
                        <div className="flex flex-col items-end flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-semibold">{giftee.name}</p>
                          <Badge className="gap-1 bg-primary text-black mt-1 text-xs">
                            <Gift className="h-3 w-3" />
                            <span className="hidden sm:inline">Recibió</span>
                          </Badge>
                        </div>
                        <div className="relative h-10 w-10 sm:h-14 sm:w-14 overflow-hidden rounded-full border-2 border-primary bg-background flex-shrink-0">
                          <Image src={giftee.profilePic} alt={giftee.name} fill className="object-cover" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex flex-col items-center gap-2 sm:gap-3 rounded-xl border border-primary/20 bg-background p-3 sm:p-4 text-center">
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full border-2 border-primary/30 bg-muted">
                      <Image src={participant.profilePic} alt={participant.name} fill className="object-cover" />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-sm sm:text-base font-semibold">{participant.name}</p>
                      <Badge variant="outline" className="gap-1 border-primary/30 text-primary/60 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        <span className="hidden sm:inline">Sin pareja</span>
                        <span className="sm:hidden">Sin par</span>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 'selecting' && currentGifter && (
        <Card className="border-border/60 bg-card/85 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Seleccionar Pareja</CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">{stepMessage}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full border-2 border-primary bg-primary/10">
                    <Image src={participants.find(p => p.id === currentGifter)?.profilePic || ''} alt={participants.find(p => p.id === currentGifter)?.name || ''} fill className="object-cover" />
                  </div>
                  <p className="text-sm sm:text-base font-semibold">
                    {participants.find(p => p.id === currentGifter)?.name}
                  </p>
                  <Badge className="gap-1 bg-primary text-black text-xs">
                    <Sparkles className="h-3 w-3" />
                    Regaló
                  </Badge>
                </div>
                <div className="flex items-center flex-1 px-4">
                  <div className="flex-1 h-px bg-primary/40"></div>
                  <ArrowRight className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-3 flex-shrink-0" />
                  <div className="flex-1 h-px bg-primary/40"></div>
                </div>
                <div className="text-center flex-shrink-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Regaló a...</p>
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
                      'group relative flex flex-col items-center gap-2 sm:gap-3 rounded-xl border border-primary/20 bg-background p-3 sm:p-4 text-center transition-all hover:border-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20 active:scale-95',
                      isSelecting && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-full border-2 border-primary/30 bg-muted">
                      <Image src={giftee.profilePic} alt={giftee.name} fill className="object-cover" />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-sm sm:text-base font-semibold">{giftee.name}</p>
                      <Badge variant="secondary" className="gap-1 bg-primary/20 text-primary border-primary/30 text-xs">
                        <Gift className="h-3 w-3" />
                        Recibió
                      </Badge>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'summary' && (
        <Card className="border-border/60 bg-card/85 backdrop-blur">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-xl sm:text-2xl">Resumen de Resultados</CardTitle>
                <CardDescription className="text-sm sm:text-base text-muted-foreground">{stepMessage}</CardDescription>
              </div>
              {editingResults.length > 0 && (
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
              {editingResults.map((pair, index) => {
                const gifter = participants.find(p => p.id === pair[0])
                const giftee = participants.find(p => p.id === pair[1])
                if (!gifter || !giftee) return null
                return (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-lg border border-primary/20 bg-background">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full">
                      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full border border-primary/30 flex-shrink-0">
                          <Image src={gifter.profilePic} alt={gifter.name} fill className="object-cover" />
                        </div>
                        <span className="text-sm sm:text-base font-semibold">{gifter.name}</span>
                        <Badge className="gap-1 bg-primary/20 text-primary border-primary/30 text-xs ml-auto sm:ml-0">
                          <Sparkles className="h-3 w-3" />
                          <span className="hidden sm:inline">Regaló</span>
                        </Badge>
                      </div>
                      <div className="hidden sm:flex items-center flex-1 px-4">
                        <div className="flex-1 h-px bg-primary/40"></div>
                        <ArrowRight className="h-4 w-4 text-primary/60 mx-3 flex-shrink-0" />
                        <div className="flex-1 h-px bg-primary/40"></div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto pl-12 sm:pl-0">
                        <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full border border-primary/30 flex-shrink-0">
                          <Image src={giftee.profilePic} alt={giftee.name} fill className="object-cover" />
                        </div>
                        <span className="text-sm sm:text-base font-semibold">{giftee.name}</span>
                        <Badge className="gap-1 bg-primary text-black text-xs ml-auto sm:ml-0">
                          <Gift className="h-3 w-3" />
                          <span className="hidden sm:inline">Recibió</span>
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removePair(pair[0])}
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

      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
        {currentStep === 'overview' && (
          <>
            {results.length > 0 ? (
              <Button
                onClick={() => {
                  setCurrentStep('summary')
                  setStepMessage('¡Perfecto! Revisa los resultados antes de guardar:')
                }}
                className="w-full sm:min-w-[200px] sm:w-auto"
              >
                Editar resultados
              </Button>
            ) : (
              <Button
                onClick={startSelection}
                className="w-full sm:min-w-[200px] sm:w-auto"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Comenzar captura
              </Button>
            )}
          </>
        )}

        {currentStep === 'selecting' && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep('overview')}
            className="w-full sm:min-w-[200px] sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        )}

        {currentStep === 'summary' && (
          <>
            <Button
              onClick={handleSaveResults}
              disabled={isSubmitting}
              className="w-full sm:min-w-[200px] sm:w-auto"
            >
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
            <Button
              variant="outline"
              onClick={goBackToSelection}
              className="w-full sm:min-w-[200px] sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ajustar
            </Button>
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="w-full sm:min-w-[200px] sm:w-auto border-orange-500/50 text-orange-400 bg-orange-500/5 hover:bg-orange-500/20 hover:border-orange-500"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Limpiar todos
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="w-full sm:min-w-[200px] sm:w-auto border-red-500/50 text-red-400 bg-red-500/5 hover:bg-red-500/20 hover:border-red-500"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </>
        )}
      </div>
    </div>
  )
}


