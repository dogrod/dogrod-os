"use client";

import Link from "next/link";
import { BlurhashImage } from "@/app/gallery/_components/BlurhashImage";
import type { PostGroup, Language } from "@/lib/blog/types";
import {
  getAssetRenditionUrl,
  formatPublishedDate,
  LANGUAGES,
} from "@/lib/blog/types";

interface PostCardProps {
  group: PostGroup;
}

/**
 * Get badge info for available translations
 */
function getTranslationBadge(
  availableLanguages: Language[],
  displayedLanguage: Language,
  isPreferredLanguage: boolean
): { text: string; flag: string } | null {
  // If only one language, check if it's not the preferred one
  if (availableLanguages.length === 1) {
    if (!isPreferredLanguage) {
      const langInfo = LANGUAGES[displayedLanguage];
      return { text: `${langInfo.name} Only`, flag: langInfo.flag };
    }
    return null;
  }

  // Multiple languages available - show the other language(s)
  const otherLanguages = availableLanguages.filter((lang) => lang !== displayedLanguage);
  if (otherLanguages.length > 0) {
    const otherLang = otherLanguages[0];
    const langInfo = LANGUAGES[otherLang];
    return { text: `${langInfo.nativeName} available`, flag: langInfo.flag };
  }

  return null;
}

/**
 * Minimalist post card for the blog index
 * Shows thumbnail, date, title, excerpt, and language badges
 */
export function PostCard({ group }: PostCardProps) {
  const { post, availableLanguages, isPreferredLanguage } = group;

  const thumbnailUrl = getAssetRenditionUrl(
    post.assets?.asset_rendition,
    "thumb",
    "list"
  );
  const blurhash = post.assets?.blurhash;

  // Get translation badge info
  const badge = getTranslationBadge(
    availableLanguages,
    post.language,
    isPreferredLanguage
  );

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block py-8 border-b border-zinc-100 last:border-b-0 transition-colors hover:bg-zinc-50/50"
    >
      <article className="flex gap-6 items-start">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Date and Language Badge */}
          <div className="flex items-center gap-2 mb-2">
            <time
              dateTime={post.published_at || undefined}
              className="text-sm text-zinc-500"
            >
              {formatPublishedDate(post.published_at)}
            </time>

            {/* Language Badge */}
            {badge && (
              <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                <span className="text-[10px]">{badge.flag}</span>
                <span>{badge.text}</span>
              </span>
            )}
          </div>

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
