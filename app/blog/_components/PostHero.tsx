"use client";

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
 * Shows title, date, cover image, and optional camera info
 */
export function PostHero({ post }: PostHeroProps) {
  const coverUrl = getAssetRenditionUrl(
    post.assets?.asset_rendition,
    "large",
    "xl"
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
          className="block text-sm text-zinc-500 mb-4"
        >
          {formatPublishedDate(post.published_at)}
        </time>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 leading-tight">
          {post.title}
        </h1>

        {/* Excerpt as subtitle */}
        {post.excerpt && (
          <p className="mt-4 text-xl text-zinc-600 leading-relaxed">
            {post.excerpt}
          </p>
        )}
      </div>

      {/* Cover Image */}
      {coverUrl && (
        <div className="relative w-full max-w-4xl mx-auto px-6">
          <div className="rounded-lg overflow-hidden bg-zinc-100">
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

          {/* Camera Info (if linked to gallery photo) */}
          {cameraInfo && (
            <p className="mt-3 text-center text-sm text-zinc-500">
              Shot on {cameraInfo}
            </p>
          )}
        </div>
      )}
    </header>
  );
}
