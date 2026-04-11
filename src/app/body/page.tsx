import { PageHeader } from "@/components/layout/page-header"

export default function BodyPage() {
  return (
    <>
      <PageHeader
        title="Body"
        subtitle="Weight tracking and body composition"
      />

      <div className="space-y-6">
        <div className="border border-dashed border-[rgba(0,0,0,0.15)] rounded-lg p-12 text-center animate-pulse-border">
          <div className="text-2xl mb-2">⚖️</div>
          <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">
            No weight data yet
          </p>
          <p className="text-[var(--text-tertiary)] text-xs">
            Add entries to <code className="font-mono bg-[var(--bg-warm)] px-1.5 py-0.5 rounded text-[11px]">data/weight.csv</code> with format: date,weight_lbs
          </p>
        </div>
      </div>
    </>
  )
}
