'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Save, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function CutoffPage() {
  const [cutoffDate, setCutoffDate] = useState('')
  const [showWinners, setShowWinners] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/')
    }
  })

  useEffect(() => {
    const fetchCurrentSettings = async () => {
      try {
        const res = await fetch('/api/admin/cutoff')
        if (res.ok) {
          const data = await res.json()
          if (data.cutoffTime) {
            // Format datetime for input type="datetime-local"
            // The format required is YYYY-MM-DDThh:mm
            const date = new Date(data.cutoffTime.datetime)
            // Adjust for local timezone offset
            const offset = date.getTimezoneOffset() * 60000
            const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16)
            setCutoffDate(localISOTime)
            setShowWinners(data.cutoffTime.showWinners || false)
          }
        }
      } catch (error) {
        console.error('Error fetching current settings:', error)
      }
    }

    if (status === 'authenticated') {
      fetchCurrentSettings()
    }
  }, [status])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleString())
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  if (status === 'loading') {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const response = await fetch('/api/admin/cutoff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ datetime: cutoffDate, showWinners }),
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'No se pudo actualizar la fecha límite')
      }

      router.push('/admin')
    } catch (error) {
      console.error('Error setting cutoff date:', error)
      const message = error instanceof Error ? error.message : 'No se pudo establecer la fecha límite. Intenta de nuevo.'
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted px-4 py-12 text-foreground">
      <div className="mx-auto w-full max-w-lg">
        <Card className="border-border/60 bg-card/90 backdrop-blur">
          <CardHeader className="space-y-3 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Clock className="h-8 w-8" />
            </span>
            <CardTitle className="text-3xl">Configurar fecha límite</CardTitle>
            <CardDescription>
              Define el último momento para que las personas envíen sus predicciones.
            </CardDescription>
            <p className="text-sm text-muted-foreground">Hora actual: {currentTime}</p>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>No se pudo guardar</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2 text-left">
                <label htmlFor="cutoff" className="text-sm font-medium text-muted-foreground">
                  Fecha y hora límite
                </label>
                <input
                  id="cutoff"
                  type="datetime-local"
                  value={cutoffDate}
                  onChange={(e) => setCutoffDate(e.target.value)}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="showWinners"
                  type="checkbox"
                  checked={showWinners}
                  onChange={(e) => setShowWinners(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="showWinners" className="text-sm font-medium text-muted-foreground">
                  Mostrar botón "Ver ganadores" (activar solo cuando haya ganadores registrados)
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || status !== 'authenticated'}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar fecha límite
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
