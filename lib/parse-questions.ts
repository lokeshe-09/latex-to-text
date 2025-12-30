import Papa from "papaparse"

export type QuestionRow = {
  id?: string
  class_code?: string
  subject_code?: string
  topic_code?: string
  sub_topic_code?: string
  question?: string
  question_image?: string
  typed?: string
  context?: string
  step_by_step_solution?: string
  concepts?: string
}

function toStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim()
}

function normalizeKeys<T extends Record<string, unknown>>(row: T) {
  const out: Record<string, unknown> = {}
  Object.keys(row).forEach((k) => {
    const nk = k
      .replace(/\s+/g, "_")
      .replace(/[^\w_]/g, "")
      .toLowerCase()
    out[nk] = row[k]
  })
  return out as Record<string, unknown>
}

function processQuestionImage(imageStr: string): string {
  if (!imageStr) return ""
  // if already a data URL, return as-is
  if (imageStr.startsWith("data:")) return imageStr
  // if it looks like base64, convert to data URL
  if (/^[A-Za-z0-9+/=]+$/.test(imageStr.trim())) {
    return `data:image/png;base64,${imageStr.trim()}`
  }
  // otherwise assume it's a URL
  return imageStr
}

function normalizeRows(rows: any[]): QuestionRow[] {
  return rows
    .map((r) => normalizeKeys(r))
    .map((r) => ({
      id: toStr(r.id),
      class_code: toStr(r.class_code),
      subject_code: toStr(r.subject_code),
      topic_code: toStr(r.topic_code),
      sub_topic_code: toStr(r.sub_topic_code),
      question: toStr(r.question),
      question_image: processQuestionImage(toStr(r.question_image)),
      typed: toStr(r.typed),
      context: toStr(r.context),
      step_by_step_solution: toStr(r.step_by_step_solution),
      concepts: toStr(r.concepts),
    }))
    .filter((r) => r.question) // require a question string
}

export async function parseCsvFile(file: File): Promise<QuestionRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      // delimiter: "" lets Papa autodetect comma/semicolon/tab
      delimiter: "",
      complete: (results) => {
        resolve(normalizeRows((results.data as any[]) || []))
      },
      error: (err) => reject(err),
    })
  })
}

export async function parseCsvText(text: string, explicitDelimiter?: string): Promise<QuestionRow[]> {
  const res = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    delimiter: explicitDelimiter || "", // autodetect or explicit (e.g. "\t")
  })
  return normalizeRows((res.data as any[]) || [])
}
