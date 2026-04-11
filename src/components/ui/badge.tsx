import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold tracking-[0.01em] transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)]",
        strength: "bg-[var(--strength-light)] text-[var(--strength-dark)]",
        running: "bg-[var(--running-light)] text-[var(--running-dark)]",
        recovery: "bg-[var(--recovery-light)] text-[var(--recovery-dark)]",
        success: "bg-emerald-50 text-emerald-700",
        warning: "bg-orange-50 text-orange-700",
        danger: "bg-red-50 text-red-700",
        muted: "bg-[var(--bg-warm)] text-[var(--text-secondary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
