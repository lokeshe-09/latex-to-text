"use client"

import MarkdownWithMath from "@/components/markdown-with-math"
import { Badge } from "@/components/ui/badge"
import { parseSolutionSteps } from "@/lib/parse-solutions"
import { parseConcepts } from "@/lib/parse-concepts"

type Row = {
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

export default function QuestionsList({ rows }: { rows: Row[] }) {
  if (!rows?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Upload a CSV/TSV to see questions here. You can also try the sample data.
      </p>
    )
  }

  return (
    <ul className="space-y-6">
      {rows.map((r, idx) => {
        const meta = [
          r.class_code ? `Class ${r.class_code}` : "",
          r.subject_code ? `Subject ${r.subject_code}` : "",
          r.topic_code ? `Topic ${r.topic_code}` : "",
          r.sub_topic_code ? `Sub-topic ${r.sub_topic_code}` : "",
        ]
          .filter(Boolean)
          .join(" · ")

        const steps = parseSolutionSteps(r.step_by_step_solution || "")
        const concepts = parseConcepts(r.concepts || "")

        return (
          <li key={idx} className="rounded-lg border border-border/60 p-5 bg-card/80 backdrop-blur space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {r.id ? (
                  <Badge variant="outline" className="text-xs font-mono">
                    ID: {r.id}
                  </Badge>
                ) : null}
                <p className="text-xs text-muted-foreground">{meta || "—"}</p>
              </div>
              {r.typed ? (
                <Badge variant="secondary" className="text-xs">
                  {r.typed}
                </Badge>
              ) : null}
            </div>

            {r.context ? (
              <div className="p-3 rounded-md bg-muted/50 border border-border/40">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Context</p>
                <MarkdownWithMath content={r.context} />
              </div>
            ) : null}

            {r.question_image ? (
              <div>
                <img
                  src={r.question_image || "/placeholder.svg"}
                  alt="Question related"
                  className="max-h-64 rounded-md border border-border/50 object-contain"
                  crossOrigin="anonymous"
                />
              </div>
            ) : null}

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Question</p>
              <MarkdownWithMath content={r.question || ""} />
            </div>

            {steps.length > 0 ? (
              <div className="p-3 rounded-md bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-3">Step-by-Step Solution</p>
                <div className="space-y-3">
                  {steps.map((step, stepIdx) => (
                    <div key={stepIdx} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                        <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">{stepIdx + 1}</span>
                      </div>
                      <div className="flex-1 pt-0.5">
                        <MarkdownWithMath content={step.content} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {concepts.length > 0 ? (
              <div className="p-3 rounded-md bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/50">
                <p className="text-xs font-semibold text-purple-900 dark:text-purple-200 mb-3">Concepts</p>
                <div className="space-y-4">
                  {concepts.map((concept, conceptIdx) => (
                    <div key={conceptIdx} className="border-l-2 border-purple-300 dark:border-purple-700 pl-3">
                      {concept.concept && (
                        <p className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-1">
                          {concept.concept}
                        </p>
                      )}
                      {concept.explanation && (
                        <div className="text-sm text-muted-foreground mb-2">
                          <p className="font-medium text-xs mb-1">Explanation:</p>
                          <MarkdownWithMath content={concept.explanation} />
                        </div>
                      )}
                      {concept.example && (
                        <div className="text-sm text-muted-foreground mb-2">
                          <p className="font-medium text-xs mb-1">Example:</p>
                          <MarkdownWithMath content={concept.example} />
                        </div>
                      )}
                      {concept.application && (
                        <div className="text-sm text-muted-foreground mb-2">
                          <p className="font-medium text-xs mb-1">Application:</p>
                          <MarkdownWithMath content={concept.application} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
