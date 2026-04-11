import fs from "fs"
import path from "path"

/**
 * Read a markdown file from a path relative to project root.
 */
export function readMarkdownFile(filePath: string): string {
  const absolutePath = path.join(process.cwd(), filePath)
  if (!fs.existsSync(absolutePath)) return ""
  return fs.readFileSync(absolutePath, "utf-8")
}

/**
 * Parse all markdown tables following H3 date headers (### YYYY-MM-DD).
 * Returns an array of objects keyed by the Metric column.
 */
export function parseDatedTables(
  content: string
): { date: string; metrics: Record<string, { value: string; trend: string }> }[] {
  if (!content) return []

  const entries: { date: string; metrics: Record<string, { value: string; trend: string }> }[] = []
  const datePattern = /^###\s+(\d{4}-\d{2}-\d{2})/gm
  let match

  while ((match = datePattern.exec(content)) !== null) {
    const date = match[1]
    const startIdx = match.index + match[0].length
    const nextDateMatch = content.indexOf("\n### ", startIdx)
    const block = nextDateMatch === -1 ? content.slice(startIdx) : content.slice(startIdx, nextDateMatch)

    const metrics: Record<string, { value: string; trend: string }> = {}
    const rowPattern = /\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.*?)\s*\|/g
    let rowMatch
    let skipHeader = 0

    while ((rowMatch = rowPattern.exec(block)) !== null) {
      const col1 = rowMatch[1].trim()
      const col2 = rowMatch[2].trim()
      const col3 = rowMatch[3].trim()

      // Skip table header and separator rows
      if (col1 === "Metric" || col1.startsWith("--")) {
        skipHeader++
        continue
      }

      metrics[col1] = { value: col2, trend: col3 }
    }

    if (Object.keys(metrics).length > 0) {
      entries.push({ date, metrics })
    }
  }

  return entries
}

/**
 * Parse a simple key-value table from markdown.
 * Looks for tables with | Key | Value | format.
 */
export function parseKeyValueTable(content: string, afterHeader?: string): Record<string, string> {
  const result: Record<string, string> = {}
  if (!content) return result

  let searchContent = content
  if (afterHeader) {
    const headerIdx = content.indexOf(afterHeader)
    if (headerIdx === -1) return result
    searchContent = content.slice(headerIdx)
  }

  const rowPattern = /\|\s*\*?\*?(.+?)\*?\*?\s*\|\s*(.+?)\s*\|/g
  let match

  while ((match = rowPattern.exec(searchContent)) !== null) {
    const key = match[1].replace(/\*\*/g, "").trim()
    const value = match[2].trim()

    if (key.startsWith("--") || key === "Metric" || key === "Field") continue
    result[key] = value
  }

  return result
}
