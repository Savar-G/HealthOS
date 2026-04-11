import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <h1 className="text-[28px] font-bold tracking-[-0.02em] text-display">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[15px] text-[var(--text-secondary)] mt-1">
          {subtitle}
        </p>
      )}
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}
