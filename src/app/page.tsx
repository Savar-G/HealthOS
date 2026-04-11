import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"

export default function OverviewPage() {
  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Your health at a glance"
      >
        <div className="flex gap-2">
          <Badge variant="strength">Strength</Badge>
          <Badge variant="running">Running</Badge>
          <Badge variant="recovery">Recovery</Badge>
        </div>
      </PageHeader>

      <div className="space-y-6">
        {/* Health Score */}
        <section className="section-animate animate-fade-in-up">
          <div className="flex items-center justify-center py-12 border border-dashed border-[rgba(0,0,0,0.15)] rounded-lg animate-pulse-border">
            <div className="text-center">
              <div className="text-[48px] font-bold tracking-[-0.03em] text-display">5.0</div>
              <div className="text-[13px] font-medium text-[var(--text-secondary)]">Health Score / 10</div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="section-animate animate-fade-in-up grid grid-cols-4 gap-4">
          {[
            { label: "Runs This Month", value: "0" },
            { label: "Strength Sessions (Apr)", value: "0" },
            { label: "Avg HRV (7-day)", value: "68 ms" },
            { label: "Active Days This Week", value: "0" },
          ].map((stat) => (
            <div key={stat.label} className="border border-[rgba(0,0,0,0.1)] rounded-lg p-5 text-center shadow-[var(--shadow-card)]">
              <div className="text-[24px] font-bold tracking-[-0.02em] font-mono">{stat.value}</div>
              <div className="text-[12px] text-[var(--text-secondary)] mt-1">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* What You're Doing Well */}
        <section className="section-animate animate-fade-in-up border-l-4 border-l-[var(--success)] border border-[rgba(0,0,0,0.1)] rounded-lg p-6 shadow-[var(--shadow-card)]">
          <h3 className="text-[15px] font-bold mb-3">What You&apos;re Doing Well</h3>
          <p className="text-[14px] text-[var(--text-secondary)]">
            Real data will populate here once the data layer is connected.
          </p>
        </section>

        {/* What Needs Attention */}
        <section className="section-animate animate-fade-in-up border-l-4 border-l-[var(--warning)] border border-[rgba(0,0,0,0.1)] rounded-lg p-6 shadow-[var(--shadow-card)]">
          <h3 className="text-[15px] font-bold mb-3">What Needs Attention</h3>
          <p className="text-[14px] text-[var(--text-secondary)]">
            Flags and alerts will appear here.
          </p>
        </section>
      </div>
    </>
  )
}
