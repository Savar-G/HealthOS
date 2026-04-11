import { PageHeader } from "@/components/layout/page-header"

export default function InsightsPage() {
  return (
    <>
      <PageHeader
        title="Insights"
        subtitle="Cross-domain correlations and AI narrative"
      />

      <div className="space-y-6">
        <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-6 shadow-[var(--shadow-card)] bg-gradient-to-br from-white to-[var(--bg-warm)]">
          <h3 className="text-[15px] font-bold mb-3">What Your Body Is Saying</h3>
          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
            AI narrative synthesizing all domains will appear here once the data layer is connected.
          </p>
        </div>

        <div className="border border-dashed border-[rgba(0,0,0,0.15)] rounded-lg p-12 text-center animate-pulse-border">
          <div className="text-2xl mb-2">📊</div>
          <p className="text-[var(--text-secondary)] text-sm">
            Year-over-year lift comparisons and cross-domain correlation charts will load here.
          </p>
        </div>
      </div>
    </>
  )
}
