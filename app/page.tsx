'use client'

import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Facebook, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export default function HomePage() {
  const { status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (status === 'authenticated') {
    router.push('/predictions')
    return null
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted px-4 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,191,41,0.12),_transparent_70%)]" />
      <Card className="w-full max-w-md border-border/60 bg-card/90 shadow-xl backdrop-blur">
        <CardHeader>
          <CardTitle className="text-3xl">Predicciones SKToxqui</CardTitle>
          <CardDescription>Accede con tu cuenta de Facebook para comenzar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Continúa con tu cuenta de Facebook para ingresar a la plataforma de predicciones.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn('facebook', { callbackUrl: '/predictions' })}
          >
            <Facebook className="mr-2 h-4 w-4" />
            Iniciar sesión con Facebook
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
