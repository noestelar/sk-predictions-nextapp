'use client'

import { signIn } from 'next-auth/react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Facebook } from 'lucide-react'

export default function LoginPage() {

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted px-4 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,191,41,0.12),_transparent_70%)]" />
      <Card className="w-full max-w-md border-border/60 bg-card/90 shadow-xl backdrop-blur">
        <CardHeader>
          <CardTitle className="text-3xl">Predicciones SK Toxqui 2024 ✨</CardTitle>
          <CardDescription>Únete a la diversión festiva con tus amigos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Para ingresar, utiliza tu cuenta de Facebook asociada a la dinámica.
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
