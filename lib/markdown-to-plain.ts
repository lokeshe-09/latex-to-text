import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import remarkStringify from "remark-stringify"
import strip from "strip-markdown"

export async function markdownToPlain(input: string): Promise<string> {
  // This will strip Markdown formatting while preserving readable text content,
  // including math as inline text where possible.
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(strip, {
      // keep some whitespace structure
      remove: ["blockquote", "html", "image"],
    })
    .use(remarkStringify)
    .process(input)

  // Normalize whitespace a bit for display
  return String(file)
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
