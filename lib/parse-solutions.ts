export type SolutionStep = {
  content: string
}

export function parseSolutionSteps(input: string): SolutionStep[] {
  if (!input) return []
  const trimmed = input.trim()

  // Try parsing as JSON array first
  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) {
      return parsed.map((item, idx) => ({
        content: typeof item === "string" ? item : JSON.stringify(item),
      }))
    }
  } catch (e) {
    // Not JSON, treat as plain text
  }

  // Fallback: treat as plain text
  return [{ content: trimmed }]
}
