"use client";

import ReactMarkdown from "react-markdown";
import Image from "next/image";
import type { Components } from "react-markdown";

interface PostContentProps {
  content: string;
}

/**
 * Markdown renderer with custom styles for blog posts
 * Uses Lora serif font for body text
 */
export function PostContent({ content }: PostContentProps) {
  // Custom components for markdown rendering
  const components: Components = {
    // Headings use sans-serif
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mt-12 mb-6 font-sans">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 mt-10 mb-4 font-sans">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold text-zinc-900 mt-8 mb-3 font-sans">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-semibold text-zinc-900 mt-6 mb-2 font-sans">
        {children}
      </h4>
    ),

    // Paragraphs use serif (Lora)
    p: ({ children }) => (
      <p className="text-lg leading-[1.75] text-zinc-800 mb-6 font-serif">
        {children}
      </p>
    ),

    // Links
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-zinc-900 underline underline-offset-2 hover:text-zinc-600 transition-colors"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),

    // Lists
    ul: ({ children }) => (
      <ul className="list-disc list-outside pl-6 mb-6 space-y-2 font-serif text-lg text-zinc-800">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-outside pl-6 mb-6 space-y-2 font-serif text-lg text-zinc-800">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-[1.75]">{children}</li>,

    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-zinc-300 pl-6 py-1 my-6 text-zinc-600 italic font-serif text-lg">
        {children}
      </blockquote>
    ),

    // Code blocks
    code: ({ className, children }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono text-zinc-800">
            {children}
          </code>
        );
      }
      return (
        <code className="block bg-zinc-50 border border-zinc-200 rounded-lg p-4 overflow-x-auto text-sm font-mono text-zinc-800">
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre className="mb-6 overflow-x-auto">{children}</pre>
    ),

    // Horizontal rule
    hr: () => <hr className="my-12 border-zinc-200" />,

    // Images - use Next.js Image component for optimization
    img: ({ src, alt }) => {
      if (!src || typeof src !== "string") return null;

      // For external images, use standard img tag
      if (src.startsWith("http")) {
        return (
          <span className="block my-8">
            <Image
              src={src}
              alt={alt || ""}
              width={680}
              height={400}
              className="rounded-lg w-full h-auto"
              unoptimized
            />
            {alt && (
              <span className="block text-center text-sm text-zinc-500 mt-2">
                {alt}
              </span>
            )}
          </span>
        );
      }

      return (
        <span className="block my-8">
          <Image
            src={src}
            alt={alt || ""}
            width={680}
            height={400}
            className="rounded-lg w-full h-auto"
          />
          {alt && (
            <span className="block text-center text-sm text-zinc-500 mt-2">
              {alt}
            </span>
          )}
        </span>
      );
    },

    // Strong and emphasis
    strong: ({ children }) => (
      <strong className="font-semibold text-zinc-900">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
  };

  return (
    <article className="mx-auto max-w-[680px] px-6">
      <div className="prose-blog">
        <ReactMarkdown components={components}>{content}</ReactMarkdown>
      </div>
    </article>
  );
}
