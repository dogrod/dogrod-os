"use client";

import Link from "next/link";
import type { TagInfo } from "@/lib/tags/types";

interface TagListProps {
  tags: TagInfo[];
  /** Display variant: "inline" for header, "pills" for footer */
  variant?: "inline" | "pills";
}

/**
 * Tag list component with two display variants (monochrome style):
 * - inline: Minimal hashtags for header metadata
 * - pills: Badge-style pills for footer/topics section
 */
export function TagList({ tags, variant = "inline" }: TagListProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  if (variant === "inline") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tag/${tag.slug}`}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:underline underline-offset-4 transition-colors duration-200"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    );
  }

  // Pills variant for footer - monochrome style
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/tag/${tag.slug}`}
          className="px-3 py-1 rounded-full text-sm font-medium bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 transition-colors duration-200"
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
