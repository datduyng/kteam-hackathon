import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { forwardRef } from 'react'
import Link from 'next/link'

const MarkdownRender = forwardRef((props, ref) => {
  const linkProperties = {
    target: '_blank',
    style: 'color: #8ab4f8;',
    rel: 'nofollow noopener noreferrer',
  };

  return (
    <div dir="auto">
      <ReactMarkdown
        // @ts-ignore
        ref={ref as any}
        remarkPlugins={[remarkMath, remarkGfm, remarkBreaks]}
        rehypePlugins={[
          rehypeKatex,
          rehypeRaw,
          [
            rehypeHighlight,
            {
              detect: true,
              ignoreMissing: true,
            },
          ],
        ]}
        components={{
          a: (props) => (
            // @ts-ignore
            <Link href={(props).href} {...linkProperties}>
              {props.children}
            </Link>
          ),
        }}
        {...props}
      >
        {/* @ts-ignore */}
        {props.children}
      </ReactMarkdown>
    </div>
  );
});

MarkdownRender.displayName = 'MarkdownRender'

export default MarkdownRender