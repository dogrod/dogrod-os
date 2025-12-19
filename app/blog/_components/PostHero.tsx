"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BlurhashImage } from "@/app/gallery/_components/BlurhashImage";
import { ExifOverlay } from "@/components/blog";
import type { PostWithDetails } from "@/lib/blog/types";
import {
  getAssetRenditionUrl,
  formatPublishedDate,
} from "@/lib/blog/types";

interface PostHeroProps {
  post: PostWithDetails;
}

/**
 * Hero section for blog detail page
 * Medium-style layout: Image → Title → Excerpt → Meta (with tags)
 * EXIF info shown as ghost overlay on image hover
 * Language switcher integrated inline with metadata
 */
export function PostHero({ post }: PostHeroProps) {
  // Request "detail" variant first, with smart fallback chain
  const coverUrl = getAssetRenditionUrl(
    post.assets?.asset_rendition,
    "detail",
    "large"
  );
  const blurhash = post.assets?.blurhash;

  // Get first valid sibling translation
  const siblingPost = post.siblings?.find((s) => s.language != null) || null;
  const hasSibling = siblingPost !== null;

  // Check for tags
  const hasTags = post.tags && post.tags.length > 0;

  // Get translation link text based on current language
  const getTranslationText = () => {
    if (!siblingPost) return "";
    // If current is Chinese, offer English; if English, offer Chinese
    if (post.language === "zh-CN") {
      return "Read in English";
    }
    return "阅读中文版";
  };

  return (
    <header className="mb-10">
      {/* 1. Cover Image with Ghost EXIF Overlay */}
      {coverUrl && (
        <div className="mb-6">
          {/* Image container with group for hover state */}
          <div className="relative group rounded-lg overflow-hidden bg-zinc-100 max-h-[400px]">
            <BlurhashImage
              src={coverUrl}
              alt={post.title}
              width={680}
              height={400}
              blurhash={blurhash}
              className="w-full h-full object-cover"
              priority
              sizes="(max-width: 680px) 100vw, 680px"
            />

            {/* Ghost EXIF Overlay - appears on hover */}
            <ExifOverlay photo={post.photos} />
          </div>
        </div>
      )}

      {/* 2. Title (H1) */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 leading-[1.2] font-sans">
        {post.title}
      </h1>

      {/* 3. Excerpt - Subtitle style */}
      {post.excerpt && (
        <p className="mt-4 mb-6 text-lg sm:text-xl text-zinc-500 leading-relaxed font-serif">
          {post.excerpt}
        </p>
      )}

      {/* 4. Metadata Row (Date + Tags + Language Switcher) */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-400 font-sans">
        <time dateTime={post.published_at || undefined}>
          {formatPublishedDate(post.published_at)}
        </time>

        {/* Inline Tags */}
        {hasTags && (
          <>
            <span className="text-zinc-300">·</span>
            <div className="flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="font-medium hover:underline underline-offset-4 transition-colors"
                  style={{ color: tag.color || "rgb(113 113 122)" }}
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Language Switcher - Only if translation exists */}
        {hasSibling && siblingPost && (
          <>
            <span className="text-zinc-300">·</span>
            <Link
              href={`/blog/${siblingPost.slug}`}
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-900 hover:underline underline-offset-4 transition-colors"
            >
              <span>{getTranslationText()}</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </>
        )}
      </div>

      {/* 5. Separator */}
      <div className="mt-8 border-b border-zinc-200" />
    </header>
  );
}
