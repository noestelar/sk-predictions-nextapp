'use client'

import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Facebook, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

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

export default function HomePage() {
  const { status } = useSession()
  const router = useRouter()
  const [selectedName, setSelectedName] = useState('')

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
          <CardTitle className="text-3xl">Predicciones SKToxqui</CardTitle>
          <CardDescription>Selecciona tu nombre para comenzar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-left">
            <label htmlFor="name" className="text-sm font-medium text-muted-foreground">
              Escribe tu nombre
            </label>
            <input
              id="name"
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              list="valid-names"
              placeholder="Ingresa tu nombre"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <datalist id="valid-names">
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
