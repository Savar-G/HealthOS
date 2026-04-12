interface EmptyStateProps {
  icon: string
  title: string
  description?: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="border-2 border-dashed border-[rgba(0,0,0,0.12)] rounded-lg p-12 text-center animate-pulse-border">
      <div className="text-2xl mb-2 opacity-50">{icon}</div>
      <p className="text-[14px] text-[var(--text-tertiary)] font-medium mb-1">{title}</p>
      {description && (
        <p className="text-[12px] text-[var(--text-tertiary)]">{description}</p>
      )}
    </div>
  )
}
