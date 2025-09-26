import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export default function PrivacyPolicy() {
  const lastUpdated = new Date().toLocaleDateString()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted px-4 py-12 text-foreground">
      <Card className="mx-auto max-w-4xl border-border/60 bg-card/90 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-3xl">Política de privacidad</CardTitle>
          <CardDescription>
            Cómo SKToxqui Predictions recopila, protege y utiliza tu información dentro del juego de predicciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Introducción</h2>
            <p>Esta política describe cómo SKToxqui Predictions (&quot;nosotros&quot;, &quot;nuestro&quot;) recopila, usa y comparte tu información cuando utilizas el servicio en https://sk-predictions-nextapp.vercel.app. Aplica para todas las personas que participan en la dinámica.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Información que recopilamos</h2>
            <p>Recibimos información que proporcionas directamente cuando:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Inicias sesión con tu nombre asignado (Noé, Miriam, Martín, Iris, Ilse, Alex, Esteban Cesar, Brenda, Queso)</li>
              <li>Registras o actualizas tus predicciones</li>
              <li>Te comunicas con nosotros para soporte</li>
            </ul>
            <p className="mt-2">Al iniciar sesión registramos:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>El nombre seleccionado de la lista preaprobada</li>
              <li>Datos básicos de uso necesarios para operar el juego</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Cómo usamos tu información</h2>
            <p>Utilizamos la información recopilada para:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Operar, mantener y mejorar la dinámica</li>
              <li>Autenticarte utilizando tu nombre asignado</li>
              <li>Gestionar las predicciones y calcular los resultados</li>
              <li>Enviar avisos técnicos o mensajes de soporte relacionados con el juego</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Compartir y divulgar información</h2>
            <p>No vendemos ni rentamos tu información personal. Solo la compartimos cuando:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Contamos con tu consentimiento explícito</li>
              <li>Debemos cumplir con obligaciones legales</li>
              <li>Necesitamos proteger nuestros derechos y prevenir fraude</li>
              <li>Trabajamos con proveedores que nos ayudan a operar el servicio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Almacenamiento y seguridad</h2>
            <p>Aplicamos medidas técnicas y organizacionales para proteger tu información personal. Los datos se almacenan de forma segura y utilizamos cifrado estándar para proteger la transmisión.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Tus derechos y opciones</h2>
            <p>Puedes solicitarnos en cualquier momento:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Acceder a tu información personal</li>
              <li>Eliminar los datos almacenados</li>
              <li>Oponerte al uso de tu información</li>
              <li>Dejar de recibir comunicaciones sobre el juego</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Conservación de datos</h2>
            <p>Mantenemos tu información únicamente durante el tiempo necesario para operar el juego festivo y cumplir con obligaciones legales. Puedes solicitar su eliminación cuando lo desees.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Contacto</h2>
            <p>Si tienes dudas sobre esta política o cómo manejamos los datos, escríbenos:</p>
            <ul className="mt-2 space-y-1">
              <li>Correo: sktoxqui@gmail.com</li>
              <li>Sitio: https://sk-predictions-nextapp.vercel.app</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Cambios a esta política</h2>
            <p>Podemos actualizar este documento ocasionalmente. Publicaremos cualquier cambio importante en esta página y actualizaremos la fecha de revisión.</p>
            <p className="mt-2 font-medium text-foreground">Última actualización: {lastUpdated}</p>
          </section>
        </div>
      </Card>
    </div>
  )
}
