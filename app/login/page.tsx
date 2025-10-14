'use client'

import { signIn } from 'next-auth/react'
import { useMemo, useState } from 'react'

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
  const devAuthEnabled = useMemo(() => {
    if (typeof window === 'undefined') return false
    // Expose via env at build time when available; also allow toggle by localStorage for dev
    const fromEnv = process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true'
    const fromLs = typeof window !== 'undefined' && localStorage.getItem('ENABLE_DEV_AUTH') === 'true'
    return fromEnv || fromLs
  }, [])

  const [devSecret, setDevSecret] = useState('')

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

          {devAuthEnabled && (
            <div className="mt-6 space-y-3 border-t border-border/60 pt-4">
              <div className="text-xs text-muted-foreground">Solo desarrollo: iniciar sesión como usuario de prueba</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Ana Tester', email: 'ana@test.local' },
                  { name: 'Ben Tester', email: 'ben@test.local' },
                  { name: 'Caro Tester', email: 'caro@test.local' },
                  { name: 'Diego Tester', email: 'diego@test.local' },
                ].map(u => (
                  <Button key={u.email} variant="secondary" className="w-full" onClick={() => signIn('credentials', { name: u.name, email: u.email, admin: false, secret: devSecret, callbackUrl: '/predictions' })}>
                    {u.name}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="default" className="w-full" onClick={() => signIn('credentials', { name: 'Admin Tester', email: 'admin@test.local', admin: true, secret: devSecret, callbackUrl: '/admin' })}>
                  Admin Tester
                </Button>
                <input
                  type="password"
                  placeholder="Dev secret (opcional)"
                  value={devSecret}
                  onChange={(e) => setDevSecret(e.target.value)}
                  className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
