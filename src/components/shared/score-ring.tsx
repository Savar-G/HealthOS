"use client"

import { useEffect, useState, useRef } from "react"

interface ScoreRingProps {
  score: number
  maxScore?: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
}

export function ScoreRing({
  score,
  maxScore = 10,
  size = 140,
  strokeWidth = 10,
  color = "var(--notion-blue)",
  label = "Health Score",
}: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [offset, setOffset] = useState(0)
  const ref = useRef<SVGCircleElement>(null)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const targetOffset = circumference - (score / maxScore) * circumference

  useEffect(() => {
    // Animate the ring
    const timer = setTimeout(() => {
      setOffset(targetOffset)
    }, 200)

    // Animate the number
    const duration = 800
    const start = performance.now()
    let rafId: number

    function animate(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setAnimatedScore(eased * score)
      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      }
    }

    const startTimer = setTimeout(() => {
      rafId = requestAnimationFrame(animate)
    }, 300)

    return () => {
      clearTimeout(timer)
      clearTimeout(startTimer)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [score, targetOffset, circumference])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--bg-warm)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            ref={ref}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset === 0 ? circumference : offset}
            style={{
              transition: "stroke-dashoffset 1.2s ease-out",
            }}
          />
        </svg>
        {/* Score number */}
        <div
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center">
            <span className="text-[32px] font-bold tracking-[-0.03em]">
              {animatedScore.toFixed(1)}
            </span>
            <span className="text-[16px] font-medium text-[var(--text-tertiary)]">
              /{maxScore}
            </span>
          </div>
        </div>
      </div>
      <span className="text-[13px] font-medium text-[var(--text-secondary)]">
        {label}
      </span>
    </div>
  )
}
