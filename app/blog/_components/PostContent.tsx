"use client";

import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";

interface PostContentProps {
  content: string;
}

/**
 * Markdown renderer with custom styles for blog posts
 * - Serif font (Lora) for body text
 * - Sans-serif for headings (hierarchy fix: markdown H1 renders as H2 visually)
 * - Dark theme syntax highlighting for code blocks
 */
export function PostContent({ content }: PostContentProps) {
  // Custom components for markdown rendering
  const components: Components = {
    // Headings use sans-serif
    // H1 in markdown renders as H2 visually (smaller than page title)
    h1: ({ children }) => (
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mt-12 mb-6 font-sans">
        {children}
      </h2>
    ),
    h2: ({ children }) => (
      <h3 className="text-xl font-semibold tracking-tight text-zinc-900 mt-10 mb-4 font-sans">
        {children}
      </h3>
    ),
    h3: ({ children }) => (
      <h4 className="text-lg font-semibold text-zinc-900 mt-8 mb-3 font-sans">
        {children}
      </h4>
    ),
    h4: ({ children }) => (
      <h5 className="text-base font-semibold text-zinc-900 mt-6 mb-2 font-sans">
        {children}
      </h5>
    ),
    h5: ({ children }) => (
      <h6 className="text-sm font-semibold text-zinc-900 mt-4 mb-2 font-sans uppercase tracking-wide">
        {children}
      </h6>
    ),
    h6: ({ children }) => (
      <h6 className="text-sm font-medium text-zinc-600 mt-4 mb-2 font-sans uppercase tracking-wide">
        {children}
      </h6>
    ),

    // Paragraphs use serif (Lora) - prose-lg size
    p: ({ children }) => (
      <p className="text-lg leading-[1.8] text-zinc-800 mb-6 font-serif">
        {children}
      </p>
    ),

    // Links
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-zinc-900 underline underline-offset-4 decoration-zinc-400 hover:decoration-zinc-900 transition-colors font-serif"
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
    li: ({ children }) => <li className="leading-[1.8]">{children}</li>,

    // Blockquotes - editorial style
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-zinc-300 pl-6 py-2 my-8 text-zinc-600 italic font-serif text-xl">
        {children}
      </blockquote>
    ),

    // Code blocks with syntax highlighting
    code: ({ className, children }) => {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "";
      const codeString = String(children).replace(/\n$/, "");

      // Inline code (no language class)
      if (!className) {
        return (
          <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded text-[0.9em] font-mono">
            {children}
          </code>
        );
      }

      // Code block with syntax highlighting
      return (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language || "text"}
          PreTag="div"
          customStyle={{
            margin: 0,
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      );
    },
    pre: ({ children }) => (
      <pre className="mb-6 overflow-hidden rounded-lg">{children}</pre>
    ),

    // Horizontal rule
    hr: () => (
      <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent" />
    ),

    // Images - use Next.js Image component for optimization
    img: ({ src, alt }) => {
      if (!src || typeof src !== "string") return null;

      // For external images, use standard img tag
      if (src.startsWith("http")) {
        return (
          <figure className="my-10">
            <Image
              src={src}
              alt={alt || ""}
              width={680}
              height={400}
              className="rounded-lg w-full h-auto"
              unoptimized
            />
            {alt && (
              <figcaption className="text-center text-sm text-zinc-500 mt-3 font-sans">
                {alt}
              </figcaption>
            )}
          </figure>
        );
      }

      return (
        <figure className="my-10">
          <Image
            src={src}
            alt={alt || ""}
            width={680}
            height={400}
            className="rounded-lg w-full h-auto"
          />
          {alt && (
            <figcaption className="text-center text-sm text-zinc-500 mt-3 font-sans">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    },

    // Strong and emphasis
    strong: ({ children }) => (
      <strong className="font-semibold text-zinc-900">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,

    // Tables
    table: ({ children }) => (
      <div className="my-8 overflow-x-auto">
        <table className="w-full border-collapse text-base font-sans">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="border-b-2 border-zinc-200">{children}</thead>
    ),
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr className="border-b border-zinc-100">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="text-left py-3 px-4 font-semibold text-zinc-900">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="py-3 px-4 text-zinc-700">{children}</td>
    ),
  };

  return (
    <article className="mx-auto max-w-[680px] px-6">
      <div className="prose-blog">
        <ReactMarkdown components={components}>{content}</ReactMarkdown>
      </div>
    </article>
  );
}
