'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Calendar, Clock, MapPin, Sparkles, Loader2, Star, PartyPopper, UtensilsCrossed, Gift, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function HomePage() {
  const { status } = useSession()
  const router = useRouter()
  const [showPredictionsButton] = useState(false) // Hidden for now

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-4 py-12 text-zinc-100">
      {/* Animated background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,191,41,0.15),_transparent_50%)] animate-pulse" />
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/5 blur-3xl animate-pulse delay-1000" />

        {/* Festive sparkle dots scattered across background */}
        <div className="absolute top-[15%] left-[25%] h-1 w-1 rounded-full bg-amber-300/70 animate-ping" style={{animationDuration: '2s'}} />
        <div className="absolute top-[60%] left-[8%] h-1.5 w-1.5 rounded-full bg-amber-400/60 animate-ping" style={{animationDuration: '3s', animationDelay: '0.8s'}} />
        <div className="absolute top-[35%] right-[20%] h-1 w-1 rounded-full bg-amber-300/80 animate-ping" style={{animationDuration: '2.5s', animationDelay: '1.2s'}} />
        <div className="absolute bottom-[25%] right-[35%] h-1.5 w-1.5 rounded-full bg-amber-400/70 animate-ping" style={{animationDuration: '3.5s', animationDelay: '0.3s'}} />
        <div className="absolute top-[45%] left-[45%] h-1 w-1 rounded-full bg-amber-300/60 animate-ping" style={{animationDuration: '4s', animationDelay: '1.8s'}} />
        <div className="absolute bottom-[40%] left-[70%] h-1.5 w-1.5 rounded-full bg-amber-400/75 animate-ping" style={{animationDuration: '2.8s', animationDelay: '0.5s'}} />
        <div className="absolute top-[70%] right-[12%] h-1 w-1 rounded-full bg-amber-300/65 animate-ping" style={{animationDuration: '3.2s', animationDelay: '2s'}} />
        <div className="absolute top-[25%] left-[60%] h-1.5 w-1.5 rounded-full bg-amber-400/55 animate-ping" style={{animationDuration: '3.8s', animationDelay: '1s'}} />
        <div className="absolute bottom-[15%] left-[40%] h-1 w-1 rounded-full bg-amber-300/70 animate-ping" style={{animationDuration: '2.3s', animationDelay: '1.5s'}} />
        <div className="absolute top-[80%] right-[45%] h-1.5 w-1.5 rounded-full bg-amber-400/60 animate-ping" style={{animationDuration: '4.2s', animationDelay: '0.7s'}} />
      </div>

      {/* Floating sparkles decoration with subtle shimmer */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Star className="absolute top-20 left-[10%] h-4 w-4 text-amber-400/30 animate-pulse" />
        <Star className="absolute top-40 right-[15%] h-3 w-3 text-amber-400/40 animate-pulse delay-500" />
        <Star className="absolute bottom-32 left-[20%] h-3 w-3 text-amber-400/30 animate-pulse delay-1000" />
        <Star className="absolute top-60 right-[25%] h-4 w-4 text-amber-400/20 animate-pulse delay-700" />
        <Sparkles className="absolute bottom-20 right-[30%] h-5 w-5 text-amber-400/25 animate-pulse delay-300" />
        <Sparkles className="absolute top-1/3 left-[5%] h-4 w-4 text-amber-400/30 animate-pulse delay-1200" />

        {/* Subtle shimmer effects */}
        <div className="absolute top-10 left-[30%] h-2 w-2 rounded-full bg-amber-300/40 animate-ping" style={{animationDuration: '3s'}} />
        <div className="absolute top-1/4 right-[10%] h-1.5 w-1.5 rounded-full bg-amber-400/50 animate-ping" style={{animationDuration: '4s', animationDelay: '1s'}} />
        <div className="absolute bottom-1/3 left-[15%] h-1 w-1 rounded-full bg-amber-300/60 animate-ping" style={{animationDuration: '5s', animationDelay: '2s'}} />
        <div className="absolute top-1/2 right-[40%] h-1.5 w-1.5 rounded-full bg-amber-400/40 animate-ping" style={{animationDuration: '3.5s', animationDelay: '0.5s'}} />
        <div className="absolute bottom-20 left-[35%] h-1 w-1 rounded-full bg-amber-300/50 animate-ping" style={{animationDuration: '4.5s', animationDelay: '1.5s'}} />
      </div>

      <div className="mx-auto max-w-3xl">
        {/* Header with animated stars */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex items-center justify-center gap-4">
            <Sparkles className="h-10 w-10 animate-pulse text-amber-400" />
            <h1 className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-6xl">
              VELADA SKTOXQUI
            </h1>
            <Sparkles className="h-10 w-10 animate-pulse text-amber-400" />
          </div>
          <div className="inline-block rounded-full border-2 border-amber-500/50 bg-amber-500/10 px-6 py-2 backdrop-blur-sm">
            <span className="text-2xl font-bold text-amber-300">2025</span>
          </div>
        </div>

        {/* Main content card with enhanced styling */}
        <div className="rounded-2xl border border-amber-500/30 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-md md:p-10">
          <div className="space-y-8 text-zinc-200">
            {/* Introduction with enhanced typography */}
            <div className="space-y-4">
              <p className="text-lg leading-relaxed text-amber-100/90">
                Estimados invitados,
              </p>

              <p className="text-base leading-relaxed">
                Nos complace extenderles una cordial invitación a la{' '}
                <span className="font-bold text-amber-400">Velada SKToxqui 2025</span>,
                un evento exclusivo que promete ser inolvidable. Empezando por, nuestra tradicional{' '}
                <span className="font-bold text-amber-400">Wishlist</span>, están cordialmente
                invitados a la planeación, donde elegiremos el día del evento, la comida y
                haremos el llenado de la wishlist. 
                Que será llevada a cabo en{' '}
                <span className="text-lg font-medium">
                  nuestro selecto canal de{' '}
                  <a
                    href="https://discord.com/channels/188896334424702977/897672392405557278"
                    className="text-amber-300 underline decoration-amber-400/40 transition-all hover:text-amber-200 hover:decoration-amber-400"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Discord
                  </a>
                </span>
              </p>
            </div>

            {/* Event details box with enhanced design */}
            <div className="rounded-xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-950/40 to-zinc-900/60 p-6 shadow-xl backdrop-blur-sm">
              <div className="space-y-5">
                <div className="flex items-start gap-4 transition-all hover:translate-x-1">
                  <div className="rounded-lg bg-amber-500/20 p-2">
                    <Calendar className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold uppercase tracking-wide text-amber-400">Fecha</span>
                    <span className="text-lg font-medium">Por definir</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 transition-all hover:translate-x-1">
                  <div className="rounded-lg bg-amber-500/20 p-2">
                    <Clock className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold uppercase tracking-wide text-amber-400">Hora</span>
                    <span className="text-lg font-medium">Por definir</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 transition-all hover:translate-x-1">
                  <div className="rounded-lg bg-amber-500/20 p-2">
                    <MapPin className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold uppercase tracking-wide text-amber-400">Ubicación</span>
                    <span className="text-lg font-medium">Pues también por definir... a ver qué sale</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar buttons with enhanced styling */}
            {/* <div className="space-y-4">
              <p className="text-center text-sm text-zinc-300">
                Para asegurar su asistencia, hemos preparado un archivo para que agreguen este
                distinguido evento a sus calendarios:
              </p>

              <div className="space-y-3">
                <Button
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-amber-600 to-amber-500 py-6 text-base font-bold text-zinc-950 shadow-lg transition-all hover:scale-[1.02] hover:shadow-amber-500/50"
                  asChild
                >
                  <a href="#">
                    <span className="relative z-10">📅 AGREGAR A GOOGLE CALENDAR</span>
                    <div className="absolute inset-0 -z-0 bg-gradient-to-r from-amber-500 to-amber-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </Button>

                <Button
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-amber-600 to-amber-500 py-6 text-base font-bold text-zinc-950 shadow-lg transition-all hover:scale-[1.02] hover:shadow-amber-500/50"
                  asChild
                >
                  <a href="#">
                    <span className="relative z-10">📅 AGREGAR A OUTLOOK</span>
                    <div className="absolute inset-0 -z-0 bg-gradient-to-r from-amber-500 to-amber-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </Button>

                <Button
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-amber-600 to-amber-500 py-6 text-base font-bold text-zinc-950 shadow-lg transition-all hover:scale-[1.02] hover:shadow-amber-500/50"
                  asChild
                >
                  <a href="#">
                    <span className="relative z-10">📅 AGREGAR A OTRO CALENDARIO</span>
                    <div className="absolute inset-0 -z-0 bg-gradient-to-r from-amber-500 to-amber-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </Button>
              </div>
            </div> */}

            {/* What to expect section */}
            <div className="space-y-6">
              <h2 className="text-center text-2xl font-bold text-amber-400">
                ¿Qué te espera en la Velada?
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Piñata Card */}
                <Card className="group overflow-hidden border-amber-500/30 bg-zinc-800/50 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/20 min-h-[320px]">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="mb-4 flex items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 overflow-hidden" style={{ height: '160px' }}>
                      <Image 
                        src="/images/estebanpiso.png" 
                        alt="Piñata activity" 
                        width={160}
                        height={160}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        style={{ height: '100%' }}
                      />
                    </div>
                    <h3 className="text-center text-xl font-bold text-amber-400">Piñata</h3>
                    <p className="mt-2 text-center text-sm text-zinc-300">
                      Diversión asegurada con nuestra tradicional piñata
                    </p>
                  </CardContent>
                </Card>

                {/* Comida Card */}
                <Card className="group overflow-hidden border-amber-500/30 bg-zinc-800/50 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/20 min-h-[320px]">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="mb-4 flex items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 overflow-hidden" style={{ height: '160px' }}>
                      <Image 
                        src="/images/comida.png" 
                        alt="Comida activity" 
                        width={160}
                        height={160}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        style={{ height: '100%' }}
                      />
                    </div>
                    <h3 className="text-center text-xl font-bold text-amber-400">Comida</h3>
                    <p className="mt-2 text-center text-sm text-zinc-300">
                      Exquisitos platillos seleccionados especialmente para la ocasión
                    </p>
                  </CardContent>
                </Card>

                {/* Regalos Card */}
                <Card className="group overflow-hidden border-amber-500/30 bg-zinc-800/50 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/20 min-h-[320px]">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="mb-4 flex items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 overflow-hidden" style={{ height: '160px' }}>
                      <Image 
                        src="/images/regalos.png" 
                        alt="Regalos activity" 
                        width={160}
                        height={160}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        style={{ height: '100%' }}
                      />
                    </div>
                    <h3 className="text-center text-xl font-bold text-amber-400">Regalos</h3>
                    <p className="mt-2 text-center text-sm text-zinc-300">
                      Sorpresas y premios para todos los asistentes
                    </p>
                  </CardContent>
                </Card>

                {/* Locura Card */}
                <Card className="group overflow-hidden border-amber-500/30 bg-zinc-800/50 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/20 min-h-[320px]">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="mb-4 flex items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 overflow-hidden" style={{ height: '160px' }}>
                      <Image 
                        src="/images/locura.jpeg" 
                        alt="Locura activity" 
                        width={160}
                        height={160}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        style={{ height: '100%' }}
                      />
                    </div>
                    <h3 className="text-center text-xl font-bold text-amber-400">Locura</h3>
                    <p className="mt-2 text-center text-sm text-zinc-300">
                      Momentos inolvidables y risas sin parar
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Closing message with enhanced styling */}
            <div className="space-y-6 pt-4">
              <p className="text-base leading-relaxed text-center">
                Manténganse atentos, pues pronto revelaremos más detalles sobre el emocionante
                sorteo y las sofisticadas predicciones que hemos preparado para ustedes.
              </p>

              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-6 text-center backdrop-blur-sm">
                <p className="text-base font-medium italic leading-relaxed text-amber-300">
                  <Sparkles className="mb-1 inline h-5 w-5 animate-pulse" />
                  {' '}Prepárense para una velada de elegancia y distinción en la PARTIDA DE MADRE
                  ANUAL, Digo... La Velada SKToxqui 2025{' '}
                  <Sparkles className="mb-1 inline h-5 w-5 animate-pulse" />
                </p>
              </div>
            </div>

            {/* Hidden predictions button */}
            {showPredictionsButton && (
              <div className="pt-8">
                <Button
                  className="w-full bg-primary py-6 text-base font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:bg-primary/90"
                  onClick={() => router.push('/predictions')}
                >
                  Ir a Predicciones
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
