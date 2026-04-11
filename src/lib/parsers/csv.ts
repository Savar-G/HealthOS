import Papa from "papaparse"
import fs from "fs"
import path from "path"

export function parseCSV<T extends Record<string, string>>(
  filePath: string,
  delimiter: string = ","
): T[] {
  const absolutePath = path.join(process.cwd(), filePath)

  if (!fs.existsSync(absolutePath)) {
    return []
  }

  const content = fs.readFileSync(absolutePath, "utf-8")

  const result = Papa.parse<T>(content, {
    header: true,
    delimiter,
    skipEmptyLines: true,
    dynamicTyping: false, // we handle type conversion ourselves
  })

  return result.data
}
