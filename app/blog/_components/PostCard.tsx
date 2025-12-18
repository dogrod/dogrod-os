"use client";

import Link from "next/link";
import { BlurhashImage } from "@/app/gallery/_components/BlurhashImage";
import type { PostWithCover } from "@/lib/blog/types";
import { getAssetRenditionUrl, formatPublishedDate } from "@/lib/blog/types";

interface PostCardProps {
  post: PostWithCover;
}

/**
 * Minimalist post card for the blog index
 * Shows thumbnail, date, title, and excerpt
 */
export function PostCard({ post }: PostCardProps) {
  const thumbnailUrl = getAssetRenditionUrl(
    post.assets?.asset_rendition,
    "thumb",
    "list"
  );
  const blurhash = post.assets?.blurhash;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block py-8 border-b border-zinc-100 last:border-b-0 transition-colors hover:bg-zinc-50/50"
    >
      <article className="flex gap-6 items-start">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Date */}
          <time
            dateTime={post.published_at || undefined}
            className="block text-sm text-zinc-500 mb-2"
          >
            {formatPublishedDate(post.published_at)}
          </time>

          {/* Title */}
          <h2 className="text-xl font-semibold text-zinc-900 mb-2 group-hover:text-zinc-600 transition-colors line-clamp-2">
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-zinc-600 leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Thumbnail */}
        {thumbnailUrl && (
          <div className="flex-shrink-0 w-32 h-24 sm:w-40 sm:h-28 rounded-lg overflow-hidden bg-zinc-100">
            <BlurhashImage
              src={thumbnailUrl}
              alt={post.title}
              width={160}
              height={112}
              blurhash={blurhash}
              className="w-full h-full"
              sizes="(max-width: 640px) 128px, 160px"
            />
          </div>
        )}
      </article>
    </Link>
  );
}
