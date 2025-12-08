'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Calendar, MapPin, Sparkles, Loader2, Gift, Star, Crown, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import SantaChat from '@/components/SantaChat'

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-4 text-center">
      <div className="flex flex-col items-center justify-center rounded-lg bg-amber-500/10 p-2 sm:p-3 border border-amber-500/20 backdrop-blur-sm min-w-[70px] sm:min-w-[80px]">
        <span className="text-2xl sm:text-3xl font-bold text-amber-400 tabular-nums">{timeLeft.days}</span>
        <span className="text-[10px] sm:text-xs uppercase tracking-wider text-amber-200/70">Días</span>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg bg-amber-500/10 p-2 sm:p-3 border border-amber-500/20 backdrop-blur-sm min-w-[70px] sm:min-w-[80px]">
        <span className="text-2xl sm:text-3xl font-bold text-amber-400 tabular-nums">{timeLeft.hours}</span>
        <span className="text-[10px] sm:text-xs uppercase tracking-wider text-amber-200/70">Hrs</span>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg bg-amber-500/10 p-2 sm:p-3 border border-amber-500/20 backdrop-blur-sm min-w-[70px] sm:min-w-[80px]">
        <span className="text-2xl sm:text-3xl font-bold text-amber-400 tabular-nums">{timeLeft.minutes}</span>
        <span className="text-[10px] sm:text-xs uppercase tracking-wider text-amber-200/70">Min</span>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg bg-amber-500/10 p-2 sm:p-3 border border-amber-500/20 backdrop-blur-sm min-w-[70px] sm:min-w-[80px]">
        <span className="text-2xl sm:text-3xl font-bold text-amber-400 tabular-nums">{timeLeft.seconds}</span>
        <span className="text-[10px] sm:text-xs uppercase tracking-wider text-amber-200/70">Seg</span>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { status } = useSession()
  const router = useRouter()
  const [showPredictionsButton] = useState(true)

  // 3D Tilt Effect Logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    const card = document.getElementById(id);
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg rotation
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.setProperty('--card-rotate-x', `${rotateX}deg`);
    card.style.setProperty('--card-rotate-y', `${rotateY}deg`);
  };

  const handleMouseLeave = (id: string) => {
    const card = document.getElementById(id);
    if (card) {
      card.style.setProperty('--card-rotate-x', '0deg');
      card.style.setProperty('--card-rotate-y', '0deg');
    }
  };

  // Calendar Date/Times
  const eventStart = '20251220T200000'
  const eventEnd = '20251221T020000'
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Velada+SKToxqui+2025&dates=${eventStart}/${eventEnd}&details=Un+evento+exclusivo+que+promete+ser+inolvidable.+Piñata,+comida,+regalos+y+mucha+diversión!&location=Casa+de+Martín&ctz=America/Mexico_City`
  const outlookStart = '2025-12-20T20:00:00-06:00'
  const outlookEnd = '2025-12-21T02:00:00-06:00'
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=Velada+SKToxqui+2025&startdt=${encodeURIComponent(outlookStart)}&enddt=${encodeURIComponent(outlookEnd)}&body=Un+evento+exclusivo+que+promete+ser+inolvidable.+Piñata,+comida,+regalos+y+mucha+diversión!&location=Casa+de+Martín`

  function generateICS() {
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Velada SKToxqui//ES
BEGIN:VTIMEZONE
TZID:America/Mexico_City
BEGIN:STANDARD
DTSTART:20241027T020000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
TZOFFSETFROM:-0500
TZOFFSETTO:-0600
TZNAME:CST
END:STANDARD
BEGIN:DAYLIGHT
DTSTART:20240407T020000
RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SU
TZOFFSETFROM:-0600
TZOFFSETTO:-0500
TZNAME:CDT
END:DAYLIGHT
END:VTIMEZONE
BEGIN:VEVENT
DTSTART;TZID=America/Mexico_City:20251220T200000
DTEND;TZID=America/Mexico_City:20251221T020000
SUMMARY:Velada SKToxqui 2025
DESCRIPTION:Un evento exclusivo que promete ser inolvidable. Piñata, comida, regalos y mucha diversión!
LOCATION:Casa de Martín
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100 selection:bg-amber-500/30">
      {/* Luxurious Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-zinc-950 to-zinc-950" />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600/10 via-transparent to-transparent" />
        <div className="pattern-bg absolute inset-0 opacity-[0.15]" />
      </div>

      <div className="container relative px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="mb-20 text-center">
          <div className="animate-fade-in-sm inline-flex items-center justify-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-300 backdrop-blur-sm mb-6">
            <Crown className="h-4 w-4" />
            <span>EVENTO EXCLUSIVO</span>
          </div>

          <h1 className="animate-slide-up relative mx-auto max-w-4xl font-serif text-5xl font-black tracking-tighter text-transparent md:text-7xl lg:text-8xl">
            <span className="bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text drop-shadow-2xl">
              VELADA SKTOXQUI
            </span>
            <span className="absolute -top-8 right-[10%] animate-pulse text-4xl text-amber-400 opacity-50">✨</span>
          </h1>

          <div className="animate-slide-up mt-6 flex items-center justify-center gap-4" style={{ animationDelay: '0.2s' }}>
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/50" />
            <span className="font-serif text-2xl text-amber-100/80 tracking-[0.2em]">2025</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/50" />
          </div>
          <div className="inline-block rounded-full border-2 border-amber-500/50 bg-amber-500/10 px-6 py-2 backdrop-blur-sm animate-[fadeIn_1s_ease-out_0.5s_both]">
            <span className="text-2xl font-bold text-amber-300">2025</span>
          </div>

          <div className="mt-8 flex justify-center animate-[fadeIn_1s_ease-out_0.7s_both]">
            <Countdown targetDate="2025-12-20T20:00:00-06:00" />
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-16">
          {/* Main Invitation Card - Metal Effect */}
          <div
            id="invite-card"
            className="metal-card-container group relative mx-auto max-w-3xl"
            onMouseMove={(e) => handleMouseMove(e, 'invite-card')}
            onMouseLeave={() => handleMouseLeave('invite-card')}
          >
            <div className="metal-card metal-gold relative overflow-hidden rounded-2xl border border-amber-500/20 bg-zinc-900/90 p-8 shadow-2xl md:p-12">
              <div className="metal-card-inner" />

              <p className="text-base leading-relaxed">
                Nos complace extenderles una cordial invitación a la{' '}
                <span className="font-bold text-amber-400">Velada SKToxqui 2025</span>,
                un evento exclusivo que promete ser inolvidable. Empezando por, nuestra tradicional
                Wishlist, están cordialmente invitados a la planeación, donde elegiremos el día del evento, la comida y
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
              
              {/* Wishlist Button - Moved to bottom */}

                <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:gap-12 my-8">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                      <Calendar className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-amber-200/60 font-semibold">Fecha</p>
                      <p className="font-medium text-zinc-100">20 de Diciembre, 2025</p>
                      <p className="text-sm text-zinc-400">8:00 PM</p>
                    </div>
                  </div>

                  <div className="h-px w-full bg-amber-500/20 md:h-12 md:w-px" />

                  <div className="flex items-center gap-3 text-left">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                      <MapPin className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-amber-200/60 font-semibold">Ubicación</p>
                      <p className="font-medium text-zinc-100">Casa de Martín</p>
                      <p className="text-sm text-zinc-400">Acceso Exclusivo</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                  <Button
                    className="group relative w-full overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.05] hover:shadow-purple-500/50 hover:shadow-2xl active:scale-[0.98]"
                    asChild
                  >
                    <a 
                      href="https://www.notion.so/noerl/Wishlist-Reuni-n-28276c7ee2d9808fa902f6b3a6e5f398?source=copy_link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="relative z-10 inline-flex items-center gap-2">
                        <span className="animate-[wiggle_1s_ease-in-out_infinite]">✨</span>
                        VER WISHLIST EN NOTION
                      </span>
                      <div className="absolute inset-0 -z-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </a>
                  </Button>

                  <SantaChat 
                    className="w-full"
                    trigger={
                      <Button
                        className="group relative w-full overflow-hidden bg-gradient-to-r from-red-600 to-red-500 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.05] hover:shadow-red-500/50 hover:shadow-2xl active:scale-[0.98]"
                      >
                        <span className="relative z-10 inline-flex items-center gap-2">
                          <span className="animate-[bounce_2s_ease-in-out_infinite]">🎅</span>
                          PREGÚNTALE A SANTA
                        </span>
                        <div className="absolute inset-0 -z-0 bg-gradient-to-r from-red-500 to-red-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </Button>
                    }
                  />
                </div>
            </div>
          </div>

          {/* Experience Grid */}
          <div>
            <h2 className="mb-10 text-center font-serif text-3xl text-amber-100/90">
              <span className="border-b-2 border-amber-500/30 pb-2">La Experiencia</span>
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'Piñata', img: '/images/estebanpiso.png', desc: 'Tradición y diversión' },
                { title: 'Gastronomía', img: '/images/comida.png', desc: 'Sabores exquisitos' },
                { title: 'Obsequios', img: '/images/regalos.png', desc: 'Sorpresas exclusivas' },
                { title: 'Momentos', img: '/images/locura.jpeg', desc: 'Memorias eternas' },
              ].map((item, i) => (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition-all hover:-translate-y-2 hover:border-amber-500/30 hover:shadow-xl"
                >
                  <div className="aspect-[4/5] w-full overflow-hidden">
                    <Image
                      src={item.img}
                      alt={item.title}
                      width={400}
                      height={500}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-serif text-xl font-bold text-amber-100">{item.title}</h3>
                    <p className="text-sm text-zinc-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions Section */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Calendar Actions */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-sm">
              <h3 className="mb-6 flex items-center gap-2 font-serif text-2xl text-zinc-200">
                <Calendar className="h-6 w-6 text-amber-500" />
                Reserva la Fecha
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-amber-400" asChild>
                  <a href={googleUrl} target="_blank" rel="noopener noreferrer">
                    Google Calendar
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-amber-400" asChild>
                  <a href={outlookUrl} target="_blank" rel="noopener noreferrer">
                    Outlook Calendar
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-amber-400" asChild>
                  <a href={`data:text/calendar;charset=utf-8,${encodeURIComponent(generateICS())}`} download="velada-sktoxqui-2025.ics">
                    Apple Calendar (.ics)
                  </a>
                </Button>
              </div>
            </div>

            {/* Gift Exchange Action */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-sm">
              <h3 className="mb-6 flex items-center gap-2 font-serif text-2xl text-zinc-200">
                <Gift className="h-6 w-6 text-amber-500" />
                Intercambio
              </h3>
              <p className="mb-6 text-zinc-400">
                Participa en nuestra dinámica de regalos. Una tradición que nos une y sorprende cada año.
              </p>
              <Button
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg hover:from-emerald-500 hover:to-emerald-400"
                asChild
              >
                <a href="https://www.drawnames.com.mx/" target="_blank" rel="noopener noreferrer">
                  <Ticket className="mr-2 h-4 w-4" />
                  Unirse en DrawNames
                </a>
              </Button>
            </div>
          </div>

          {/* Footer / Predictions */}
          <div className="text-center pb-12">
            <div className="mb-8 inline-block rounded-full border border-amber-500/20 bg-amber-500/5 px-6 py-3 backdrop-blur-md">
              <p className="text-sm italic text-amber-200/80">
                &quot;Prepárense para una velada de elegancia y distinción...&quot;
              </p>
            </div>

            {showPredictionsButton && (
              <div>
                <Button
                  variant="ghost"
                  className="text-zinc-500 hover:text-amber-400 hover:bg-transparent transition-colors"
                  onClick={() => router.push('/login')}
                >
                  Acceso a Predicciones &rarr;
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

