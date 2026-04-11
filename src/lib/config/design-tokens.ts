export const DOMAIN_COLORS = {
  strength: { primary: "#E8590C", light: "#FFF4E6", dark: "#D9480F" },
  running: { primary: "#2B8A3E", light: "#EBFBEE", dark: "#1B7A2E" },
  recovery: { primary: "#1971C2", light: "#E7F5FF", dark: "#1864AB" },
} as const

export const STATUS_COLORS = {
  success: "#2B8A3E",
  warning: "#E8590C",
  danger: "#C92A2A",
} as const

export const CHART_THEME = {
  fontFamily: "Inter, -apple-system, sans-serif",
  gridColor: "rgba(0,0,0,0.05)",
  tooltipStyle: {
    backgroundColor: "#ffffff",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: "8px",
    boxShadow: "rgba(0,0,0,0.04) 0px 4px 18px",
    fontSize: "13px",
    fontFamily: "Inter, -apple-system, sans-serif",
  },
} as const
