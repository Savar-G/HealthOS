import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Sidebar, type DomainStatusItem } from "@/components/layout/sidebar"
import { getStrengthData } from "@/lib/data/strength"
import { getRecoveryData } from "@/lib/data/oura"
import { getRunningData } from "@/lib/data/running"
import "@/styles/globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "HealthOS — Savar's Health Dashboard",
  description: "Personal health tracking across strength, running, sleep, and recovery.",
}

/** Format YYYY-MM-DD as "Mon D" (e.g., "May 10"). Returns "—" for null. */
function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  const d = new Date(`${dateStr}T00:00:00`)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

/** Format YYYY-MM-DD as "Mon D, YYYY" (e.g., "May 10, 2026"). */
function formatLongDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  const d = new Date(`${dateStr}T00:00:00`)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

/** Pick the most recent of a list of YYYY-MM-DD dates. */
function maxDate(dates: (string | null | undefined)[]): string | null {
  const valid = dates.filter((d): d is string => !!d)
  if (valid.length === 0) return null
  return valid.sort().slice(-1)[0]
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Server-side: compute the last update date for each domain from real data
  const strength = getStrengthData()
  const recovery = getRecoveryData()
  const running = getRunningData()

  const strengthDate = strength.lastWorkoutDate
  const recoveryDate = recovery.lastEntryDate
  // Most recent run with actual distance logged
  const runningDate = running.runs
    .filter((r) => r.actualDist !== null)
    .map((r) => r.date)
    .sort()
    .slice(-1)[0] ?? null

  const domainStatus: DomainStatusItem[] = [
    {
      label: "Strength",
      lastUpdated: formatShortDate(strengthDate),
      color: "var(--strength)",
      bgColor: "var(--strength-light)",
    },
    {
      label: "Running",
      lastUpdated: formatShortDate(runningDate),
      color: "var(--running)",
      bgColor: "var(--running-light)",
    },
    {
      label: "Recovery",
      lastUpdated: formatShortDate(recoveryDate),
      color: "var(--recovery)",
      bgColor: "var(--recovery-light)",
    },
  ]

  const globalLastUpdated = formatLongDate(
    maxDate([strengthDate, recoveryDate, runningDate])
  )

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Sidebar domainStatus={domainStatus} lastUpdated={globalLastUpdated} />
        <main className="md:ml-[240px] min-h-screen pt-14 md:pt-0">
          <div className="max-w-[1040px] mx-auto px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
