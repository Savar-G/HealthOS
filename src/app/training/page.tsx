import { PageHeader } from "@/components/layout/page-header"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function TrainingPage() {
  return (
    <>
      <PageHeader
        title="Training"
        subtitle="Strength, running, steps, and recovery"
      />

      <Tabs defaultValue="strength" className="w-full">
        <TabsList>
          <TabsTrigger value="strength">Strength</TabsTrigger>
          <TabsTrigger value="running">Running</TabsTrigger>
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="recovery">Recovery</TabsTrigger>
        </TabsList>

        <TabsContent value="strength">
          <div className="border border-dashed border-[rgba(0,0,0,0.15)] rounded-lg p-12 text-center animate-pulse-border">
            <p className="text-[var(--text-secondary)] text-sm">
              Strength data with lifts table, volume chart, and PR history will load here.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="running">
          <div className="border border-dashed border-[rgba(0,0,0,0.15)] rounded-lg p-12 text-center animate-pulse-border">
            <p className="text-[var(--text-secondary)] text-sm">
              Your first run logs will appear here. Phase 1 starts April 12.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="steps">
          <div className="border border-dashed border-[rgba(0,0,0,0.15)] rounded-lg p-12 text-center animate-pulse-border">
            <p className="text-[var(--text-secondary)] text-sm">
              Daily steps chart from Oura will load here.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="recovery">
          <div className="border border-dashed border-[rgba(0,0,0,0.15)] rounded-lg p-12 text-center animate-pulse-border">
            <p className="text-[var(--text-secondary)] text-sm">
              Readiness gauge, HRV trend, and training recommendations will load here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
