"use client"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import remarkGfm from "remark-gfm"

type Props = {
  content: string
  className?: string
}

export default function MarkdownWithMath({ content, className }: Props) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: (props) => <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-pretty" {...props} />,
          h2: (props) => <h2 className="text-xl md:text-2xl font-semibold mb-3 text-pretty" {...props} />,
          h3: (props) => <h3 className="text-lg md:text-xl font-semibold mb-2 text-pretty" {...props} />,
          p: (props) => <p className="leading-relaxed mb-3" {...props} />,
          ul: (props) => <ul className="list-disc ps-5 space-y-1 mb-3" {...props} />,
          ol: (props) => <ol className="list-decimal ps-5 space-y-1 mb-3" {...props} />,
          code: ({ inline, className, children, ...rest }) =>
            inline ? (
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm" {...rest}>
                {children}
              </code>
            ) : (
              <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm">
                <code className="font-mono">{children}</code>
              </pre>
            ),
          table: (props) => <table className="w-full text-left border-collapse mb-3" {...props} />,
          th: (props) => <th className="border-b border-border p-2 font-medium" {...props} />,
          td: (props) => <td className="border-b border-border p-2 align-top" {...props} />,
          a: (props) => <a className="underline decoration-dotted underline-offset-2 hover:text-primary" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
