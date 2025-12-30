export type Concept = {
  concept?: string
  chapter?: string
  explanation?: string
  example?: string
  application?: string
}

export function parseConcepts(input: string): Concept[] {
  if (!input) return []
  const trimmed = input.trim()

  // Try parsing as JSON array first
  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) {
      return parsed.map((item) => {
        if (typeof item === "object" && item !== null) {
          return {
            concept: item.concept || "",
            chapter: item.chapter || "",
            explanation: item.explanation || "",
            example: item.example || "",
            application: item.application || "",
          }
        }
        return { concept: String(item) }
      })
    }
  } catch (e) {
    // Not JSON, treat as plain text
  }

  // Fallback: treat as plain text
  return [{ concept: trimmed }]
}
