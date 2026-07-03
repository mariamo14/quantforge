import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

/** Shared markdown renderer: GitHub tables/lists + KaTeX math ($...$ and $$...$$). */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-qf">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
