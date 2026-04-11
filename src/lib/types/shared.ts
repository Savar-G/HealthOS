export type Domain = "strength" | "running" | "recovery"

export type TrendDirection = "up" | "down" | "flat"

export interface HealthScore {
  overall: number // 0-10
  breakdown: {
    strength: { score: number; weight: number; reason: string } | null
    running: { score: number; weight: number; reason: string } | null
    recovery: { score: number; weight: number; reason: string } | null
  }
}

export interface DomainStatus {
  domain: Domain
  label: string
  status: string
  hasData: boolean
}
