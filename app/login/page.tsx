'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Facebook } from 'lucide-react'

const VALID_NAMES = [
  'Noé',
  'Miriam',
  'Martín',
  'Iris',
  'Ilse',
  'Alex',
  'Esteban Cesar',
  'Brenda',
  'Queso'
]

export default function LoginPage() {
  const [selectedName, setSelectedName] = useState('')

  const handleLogin = async () => {
    if (!selectedName) return
    await signIn('credentials', {
      name: selectedName,
      callbackUrl: '/predictions'
    })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted px-4 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,191,41,0.12),_transparent_70%)]" />
      <Card className="w-full max-w-md border-border/60 bg-card/90 shadow-xl backdrop-blur">
        <CardHeader>
          <CardTitle className="text-3xl">Predicciones SK Toxqui 2024 ✨</CardTitle>
          <CardDescription>Únete a la diversión festiva con tus amigos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-left">
            <label htmlFor="login-name" className="text-sm font-medium text-muted-foreground">
              Escribe tu nombre
            </label>
            <input
              id="login-name"
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              list="login-valid-names"
              placeholder="Ingresa tu nombre"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <datalist id="login-valid-names">
              {VALID_NAMES.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <div className="relative py-2 text-center text-sm text-muted-foreground">
            <span className="px-2 bg-card">o continúa con</span>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn('facebook', { callbackUrl: '/predictions' })}
          >
            <Facebook className="mr-2 h-4 w-4" />
            Iniciar sesión con Facebook
          </Button>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin} disabled={!selectedName}>
            Iniciar sesión
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
