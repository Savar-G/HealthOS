"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Dumbbell,
  Moon,
  Scale,
  Sparkles,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/training", label: "Training", icon: Dumbbell },
  { href: "/sleep", label: "Sleep", icon: Moon },
  { href: "/body", label: "Body", icon: Scale },
  { href: "/insights", label: "Insights", icon: Sparkles },
]

const domainStatus = [
  { label: "Strength", status: "23-Day Gap", color: "var(--strength)", bgColor: "var(--strength-light)" },
  { label: "Running", status: "Starts Apr 12", color: "var(--running)", bgColor: "var(--running-light)" },
  { label: "Recovery", status: "Active", color: "var(--recovery)", bgColor: "var(--recovery-light)" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[240px] border-r border-[rgba(0,0,0,0.1)] bg-white flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[rgba(0,0,0,0.95)] flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-[15px] font-bold tracking-[-0.01em]">HealthOS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-[14px] font-medium transition-colors",
                  isActive
                    ? "bg-[var(--bg-warm)] text-[rgba(0,0,0,0.95)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-warm)] hover:text-[rgba(0,0,0,0.95)]"
                )}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Domain Status Pills */}
      <div className="px-4 py-4 border-t border-[rgba(0,0,0,0.06)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)] mb-2.5 px-1">
          Domains
        </p>
        <div className="space-y-1.5">
          {domainStatus.map((domain) => (
            <div
              key={domain.label}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md"
              style={{ backgroundColor: domain.bgColor }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: domain.color }} />
                <span className="text-[12px] font-semibold" style={{ color: domain.color }}>{domain.label}</span>
              </div>
              <span className="text-[11px] font-medium" style={{ color: domain.color, opacity: 0.7 }}>
                {domain.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[rgba(0,0,0,0.06)]">
        <p className="text-[11px] text-[var(--text-tertiary)]">
          Updated Apr 8, 2026
        </p>
      </div>
    </aside>
  )
}
