import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "success"
    | "warning"
    | "info"
    | "neutral"
    | "destructive"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80": variant === "default",
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
          "border border-success/30 bg-success/15 text-success-foreground": variant === "success",
          "border border-warning/30 bg-warning/15 text-warning-foreground": variant === "warning",
          "border border-info/30 bg-info/15 text-info-foreground": variant === "info",
          "border border-muted/50 bg-muted/80 text-foreground": variant === "neutral",
          "border border-danger/40 bg-danger/20 text-danger-foreground": variant === "destructive",
          "text-foreground border border-border/60": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
