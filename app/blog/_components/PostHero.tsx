"use client";

import { Camera } from "lucide-react";
import { BlurhashImage } from "@/app/gallery/_components/BlurhashImage";
import type { PostWithDetails } from "@/lib/blog/types";
import {
  getAssetRenditionUrl,
  formatPublishedDate,
  getCameraInfoString,
} from "@/lib/blog/types";

interface PostHeroProps {
  post: PostWithDetails;
}

/**
 * Hero section for blog detail page
 * Medium-style layout: Image → EXIF → Title → Excerpt → Meta
 * All elements aligned to same max-width for visual consistency
 */
export function PostHero({ post }: PostHeroProps) {
  // Request "detail" variant first, with smart fallback chain
  const coverUrl = getAssetRenditionUrl(
    post.assets?.asset_rendition,
    "detail",
    "large"
  );
  const blurhash = post.assets?.blurhash;

  // Get camera info if linked to gallery photo
  const cameraInfo = post.photos?.photo_exif
    ? getCameraInfoString(post.photos.photo_exif)
    : null;

  return (
    <header className="mb-10">
      {/* 1. Cover Image (Top) - Aligned to content width */}
      {coverUrl && (
        <div className="mb-6">
          {/* Height-constrained image for fold optimization */}
          <div className="relative rounded-lg overflow-hidden bg-zinc-100 max-h-[400px]">
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
          </div>

          {/* 2. EXIF Info - Caption style, de-emphasized */}
          {cameraInfo && (
            <p className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 mt-2 font-sans">
              <Camera className="w-3 h-3" />
              <span>Shot on {cameraInfo}</span>
            </p>
          )}
        </div>
      )}

      {/* 3. Title (H1) */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 leading-[1.2] font-sans">
        {post.title}
      </h1>

      {/* 4. Excerpt - Subtitle style */}
      {post.excerpt && (
        <p className="mt-4 mb-6 text-lg sm:text-xl text-zinc-500 leading-relaxed font-serif">
          {post.excerpt}
        </p>
      )}

      {/* 5. Metadata (Date) */}
      <div className="flex items-center gap-3 text-sm text-zinc-400 font-sans">
        <time dateTime={post.published_at || undefined}>
          {formatPublishedDate(post.published_at)}
        </time>
      </div>

      {/* 6. Separator */}
      <div className="mt-8 border-b border-zinc-200" />
    </header>
  );
}
