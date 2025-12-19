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
 * Shows title, date, cover image, and optional camera info badge
 */
export function PostHero({ post }: PostHeroProps) {
  // Request "detail" variant first (commonly used for detail pages),
  // with "large" as fallback. The function will also try xl, og_card, etc.
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
    <header className="mb-12">
      {/* Title and Meta */}
      <div className="mx-auto max-w-[680px] px-6 mb-8">
        {/* Date */}
        <time
          dateTime={post.published_at || undefined}
          className="block text-sm text-zinc-400 mb-4 font-sans tracking-wide uppercase"
        >
          {formatPublishedDate(post.published_at)}
        </time>

        {/* Title - Sans-serif, bold, larger */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.15] font-sans">
          {post.title}
        </h1>

        {/* Excerpt as lead - Serif, italic, muted, distinct from body */}
        {post.excerpt && (
          <p className="mt-6 mb-8 text-xl sm:text-2xl text-zinc-500 leading-relaxed font-serif italic">
            {post.excerpt}
          </p>
        )}
      </div>

      {/* Cover Image */}
      {coverUrl && (
        <div className="relative w-full max-w-4xl mx-auto px-6">
          <div className="rounded-xl overflow-hidden bg-zinc-100 shadow-sm">
            <BlurhashImage
              src={coverUrl}
              alt={post.title}
              width={1200}
              height={675}
              blurhash={blurhash}
              className="w-full"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 896px"
            />
          </div>

          {/* Camera Info Badge (if linked to gallery photo) */}
          {cameraInfo && (
            <div className="flex justify-center mt-4">
              <span className="inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-600 text-xs font-medium px-3 py-1.5 rounded-full font-sans">
                <Camera className="w-3.5 h-3.5" />
                <span>Shot on {cameraInfo}</span>
              </span>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
