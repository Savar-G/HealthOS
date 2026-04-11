import { PageHeader } from "@/components/layout/page-header"

export default function SleepPage() {
  return (
    <>
      <PageHeader
        title="Sleep"
        subtitle="Sleep quality, stages, and recovery correlation"
      />

      <div className="space-y-6">
        <div className="border border-dashed border-[rgba(0,0,0,0.15)] rounded-lg p-12 text-center animate-pulse-border">
          <div className="text-2xl mb-2">🌙</div>
          <p className="text-[var(--text-secondary)] text-sm">
            Sleep score, stages breakdown, duration trends, and HRV data from Oura will load here.
          </p>
        </div>
      </div>
    </>
  )
}
