'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib-packages/ui/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="text-xl md:text-2xl font-heading font-medium text-amethyst mt-6 mb-3 first:mt-0">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h3 className="text-lg md:text-xl font-heading font-medium text-amethyst mt-5 mb-2 first:mt-0">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="text-base md:text-lg font-heading font-medium text-lavenderGlow mt-4 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-ghostWhite/90 font-oracle font-light text-base md:text-lg leading-[1.8]">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-medium text-ghostWhite">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-paleOrchid/80 italic">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2 ml-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 ml-1 list-decimal list-inside">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-ghostWhite/90 font-oracle font-light text-base md:text-lg leading-[1.8] pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-amethyst">
              {children}
            </li>
          ),
          hr: () => <hr className="border-darkPurple/50 my-4" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
