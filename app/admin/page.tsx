'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Clock, Gift, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export default function AdminPage() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/')
    }
  })

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
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              No tienes permisos para acceder al panel administrativo.
            </p>
            <Button onClick={() => router.push('/')} className="mt-4 w-full">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tiles = [
    {
      title: 'Fecha límite',
      description: 'Define el último día para enviar predicciones.',
      icon: Clock,
      action: () => router.push('/admin/cutoff'),
      cta: 'Configurar cutoff'
    },
    {
      title: 'Resultados',
      description: 'Registra quién regaló a quién en la realidad.',
      icon: Gift,
      action: () => router.push('/admin/results'),
      cta: 'Capturar resultados'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted px-6 py-12 text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight">Panel administrativo</h1>
          <p className="mt-2 text-muted-foreground">
            Gestiona la dinámica de predicciones y actualiza los resultados oficiales.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {tiles.map(({ title, description, icon: Icon, action, cta }) => (
            <Card key={title} className="border-border/60 bg-card/80 backdrop-blur">
              <CardHeader className="flex flex-col items-center space-y-4">
                <span className="rounded-full bg-primary/10 p-4 text-primary">
                  <Icon className="h-10 w-10" />
                </span>
                <CardTitle>{title}</CardTitle>
                <CardDescription className="text-center text-base leading-relaxed">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button onClick={action} className="w-full max-w-xs">
                  {cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
