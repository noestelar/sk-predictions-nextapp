import * as React from "react"
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"

const icons = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  destructive: AlertCircle
}

type AlertVariant = keyof typeof icons

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ className, variant = "default", children, ...props }, ref) => {
  const Icon = icons[variant] ?? icons.default
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4 text-sm",
        variant === "destructive" && "border-destructive/50 text-destructive",
        variant === "success" && "border-emerald-500/40 text-emerald-500",
        variant === "warning" && "border-amber-500/40 text-amber-500",
        variant === "info" && "border-sky-500/40 text-sky-500",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5" />
        <div className="grid gap-1 text-sm text-foreground/80" data-content>{children}</div>
      </div>
    </div>
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("font-medium leading-none tracking-tight", className)} {...props} />
  )
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
