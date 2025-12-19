"use client";

import Link from "next/link";
import type { TagInfo } from "@/lib/tags/types";

interface TagListProps {
  tags: TagInfo[];
  /** Display variant: "inline" for header, "pills" for footer */
  variant?: "inline" | "pills";
}

/**
 * Tag list component with two display variants:
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
            className="text-sm font-medium hover:underline underline-offset-4 transition-colors"
            style={{ color: tag.color || undefined }}
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    );
  }

  // Pills variant for footer
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/tag/${tag.slug}`}
          className="px-3 py-1 rounded-full text-sm font-medium transition-colors hover:opacity-80"
          style={{
            backgroundColor: tag.color ? `${tag.color}15` : "rgb(244 244 245)", // 15 = ~9% opacity
            color: tag.color || "rgb(113 113 122)",
          }}
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
