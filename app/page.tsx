"use client"

import { useMemo, useState } from "react"
import MarkdownWithMath from "@/components/markdown-with-math"
import { markdownToPlain } from "@/lib/markdown-to-plain"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import QuestionsList from "@/components/questions-list"
import { parseCsvFile, parseCsvText, type QuestionRow } from "@/lib/parse-questions"
import { cn } from "@/lib/utils"

const SAMPLE = `# LaTeX + Markdown Preview

Inline math like $a^2 + b^2 = c^2$ and block math:

$$
\\int_0^{\\infty} e^{-x^2} \\, dx = \\frac{\\sqrt{\\pi}}{2}
$$

- Supports **bold**, _italics_, and tables:

| Symbol | Meaning        |
|-------:|----------------|
|  $\\alpha$ | Alpha letter   |
|  $\\sum$   | Summation sign |

> Tip: Edit the text above to see changes below.

Code:
\`\`\`ts
const area = (r: number) => Math.PI * r ** 2
\`\`\`
`

export default function Page() {
  const [content, setContent] = useState<string>(SAMPLE)
  const [plainText, setPlainText] = useState<string>("")
  const [rows, setRows] = useState<QuestionRow[]>([])
  const [q, setQ] = useState("")
  const [typedFilter, setTypedFilter] = useState<"all" | "Exercise" | "Solved">("all")
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  useMemo(() => {
    // Fire and forget; update when content changes
    markdownToPlain(content).then(setPlainText)
  }, [content])

  const filteredRows = useMemo(() => {
    const t = q.toLowerCase().trim()
    return rows.filter((r) => {
      const typedOk = typedFilter === "all" ? true : (r.typed || "").toLowerCase() === typedFilter.toLowerCase()
      const queryOk = !t
        ? true
        : [r.question, r.class_code, r.subject_code, r.topic_code, r.sub_topic_code, r.typed]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(t)
      return typedOk && queryOk
    })
  }, [rows, q, typedFilter])

  async function onFileChange(file?: File | null) {
    if (!file) return
    setParsing(true)
    setParseError(null)
    try {
      const parsed = await parseCsvFile(file)
      setRows(parsed)
    } catch (err: any) {
      setParseError(err?.message || "Failed to parse file")
    } finally {
      setParsing(false)
    }
  }

  async function loadSample() {
    setParsing(true)
    setParseError(null)
    try {
      const text = await fetch("/data/sample-questions.tsv").then((r) => r.text())
      const parsed = await parseCsvText(text, "\t")
      setRows(parsed)
    } catch (err: any) {
      setParseError(err?.message || "Failed to load sample")
    } finally {
      setParsing(false)
    }
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // no-op
    }
  }

  return (
    <main className="min-h-dvh relative">
      <div className="pointer-events-none absolute inset-0 bg-soft-gradient" aria-hidden />

      <section className="relative z-10">
        <header className="max-w-5xl mx-auto px-4 md:px-6 pt-14 md:pt-20 pb-8 text-center">
          <h1 className="text-balance text-3xl md:text-5xl font-semibold tracking-tight">
            LaTeX to Text — with Markdown Preview
          </h1>
          <p className="text-pretty mt-3 md:mt-4 text-muted-foreground leading-relaxed">
            Type Markdown and LaTeX, preview beautifully with KaTeX, and extract clean plain text below.
          </p>
        </header>

        <div className="max-w-5xl mx-auto px-4 md:px-6 pb-16">
          {/* Editor */}
          <Card className="mb-6 border-border/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <CardHeader>
              <CardTitle className="text-xl">Editor</CardTitle>
              <CardDescription>Write Markdown + LaTeX here</CardDescription>
            </CardHeader>
            <CardContent>
              <label htmlFor="editor" className="sr-only">
                Markdown + LaTeX Editor
              </label>
              <textarea
                id="editor"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={cn(
                  "w-full resize-y min-h-[180px] md:min-h-[220px] rounded-md",
                  "bg-card text-foreground placeholder:text-muted-foreground/70",
                  "border border-input focus:outline-none focus:ring-2 focus:ring-ring/60",
                  "p-4 leading-relaxed font-mono text-sm",
                )}
                placeholder="Type your Markdown + LaTeX here..."
                aria-label="Markdown and LaTeX input"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setContent((prev) => prev + "\n\n" + "$$\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$")}
                >
                  Insert Quadratic Formula
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setContent((prev) => prev + "\n\n" + "`E = mc^2` and $F = ma$")}
                >
                  Insert Physics
                </Button>
                <Button variant="default" onClick={() => copy(content)}>
                  Copy Input
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 border-border/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <CardHeader>
              <CardTitle className="text-xl">Upload Questions (CSV / TSV)</CardTitle>
              <CardDescription>We autodetect comma or tab separated. Headers recommended.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <label htmlFor="csv-upload" className="sr-only">
                    Upload CSV or TSV file
                  </label>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv,.tsv,text/csv,text/tab-separated-values"
                    onChange={(e) => onFileChange(e.target.files?.[0])}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={loadSample} disabled={parsing}>
                    {parsing ? "Loading..." : "Load Sample Data"}
                  </Button>
                  <Button variant="outline" onClick={() => setRows([])} disabled={parsing || rows.length === 0}>
                    Clear
                  </Button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search questions or metadata…"
                    aria-label="Search questions"
                  />
                </div>
                <div className="w-full md:w-56">
                  <Select value={typedFilter} onValueChange={(v: any) => setTypedFilter(v)}>
                    <SelectTrigger aria-label="Filter by type">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="Exercise">Exercise</SelectItem>
                      <SelectItem value="Solved">Solved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {parseError ? (
                  <span className="text-destructive-foreground">Error: {parseError}</span>
                ) : (
                  <span>
                    Loaded <strong className="text-foreground">{rows.length}</strong> row{rows.length === 1 ? "" : "s"}.
                    Showing <strong className="text-foreground">{filteredRows.length}</strong>.
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Outputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl">Rendered Preview</CardTitle>
                  <CardDescription>Math via KaTeX + GFM</CardDescription>
                </div>
                <Button variant="outline" onClick={() => copy(content)}>
                  Copy Source
                </Button>
              </CardHeader>
              <CardContent>
                <MarkdownWithMath content={content} />
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl">Plain Text</CardTitle>
                  <CardDescription>Markdown + LaTeX stripped</CardDescription>
                </div>
                <Button variant="outline" onClick={() => copy(plainText)}>
                  Copy Text
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap leading-relaxed text-sm">{plainText || "…"}</pre>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 border-border/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <CardHeader>
              <CardTitle className="text-xl">Questions</CardTitle>
              <CardDescription>Rendered with LaTeX support via KaTeX</CardDescription>
            </CardHeader>
            <CardContent>
              <QuestionsList rows={filteredRows} />
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
