/**
 * Blog module type definitions
 * These types match the database schema from Supabase
 */

import type { Asset, AssetRendition, PhotoExif } from "@/lib/gallery/types";
import type { TagInfo } from "@/lib/tags/types";

// Database enum types (shared with other modules)
export type ContentStatus = "draft" | "scheduled" | "published" | "archived";
export type Visibility = "public" | "unlisted" | "private";

/**
 * Supported languages for blog posts
 */
export type Language = "zh-CN" | "en";

/**
 * Language configuration
 */
export const LANGUAGES: Record<Language, { flag: string; name: string; nativeName: string }> = {
  "zh-CN": { flag: "🇨🇳", name: "Chinese", nativeName: "中文" },
  "en": { flag: "🇺🇸", name: "English", nativeName: "English" },
};

/**
 * Default/preferred language for the site
 */
export const DEFAULT_LANGUAGE: Language = "zh-CN";

/**
 * Main post entity from the `posts` table
 */
export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null; // Markdown content
  cover_asset_id: string | null;
  gallery_photo_id: string | null;
  language: Language | null; // May be null in database
  translation_group_id: string | null;
  status: ContentStatus;
  visibility: Visibility;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Post with cover asset for list page
 */
export interface PostWithCover extends Post {
  assets: Asset | null;
}

/**
 * Sibling translation (minimal info for switcher)
 */
export interface TranslationSibling {
  id: string;
  slug: string;
  title: string;
  language: Language | null;
}

/**
 * Photo with EXIF data for gallery-linked posts
 */
export interface PhotoWithExif {
  id: string;
  photo_exif: PhotoExif | null;
}

/**
 * Complete post with all details for detail page
 */
export interface PostWithDetails extends Post {
  assets: Asset | null;
  photos: PhotoWithExif | null;
  siblings: TranslationSibling[];
  tags: TagInfo[];
}

/**
 * Grouped post for list display (with available translations)
 */
export interface PostGroup {
  /** The post to display (in preferred language) */
  post: PostWithCover;
  /** Available languages in this translation group (excludes null) */
  availableLanguages: (Language | null)[];
  /** Whether the displayed post is in the preferred language */
  isPreferredLanguage: boolean;
}

/**
 * Blog list page response
 */
export interface BlogPostsResponse {
  posts: PostWithCover[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Preferred rendition order for cover/hero images (largest first)
 */
const COVER_IMAGE_VARIANT_PREFERENCE = [
  "xl",
  "large",
  "detail",
  "og_card",
  "medium",
  "list",
  "thumb",
];

/**
 * Get the URL for a specific rendition variant from an asset
 * Falls back through a preference list for cover images
 */
export function getAssetRenditionUrl(
  renditions: AssetRendition[] | undefined | null,
  variant: string,
  fallbackVariant?: string
): string | null {
  if (!renditions || renditions.length === 0) return null;

  // Try the requested variant first
  const rendition = renditions.find((r) => r.variant_name === variant);
  if (rendition) return rendition.url;

  // Try the explicit fallback variant
  if (fallbackVariant) {
    const fallback = renditions.find((r) => r.variant_name === fallbackVariant);
    if (fallback) return fallback.url;
  }

  // Smart fallback: try variants in preference order (prefer larger images)
  for (const preferredVariant of COVER_IMAGE_VARIANT_PREFERENCE) {
    const preferred = renditions.find((r) => r.variant_name === preferredVariant);
    if (preferred) return preferred.url;
  }

  // Last resort: return any available rendition
  return renditions[0]?.url ?? null;
}

/**
 * Format published date for display
 */
export function formatPublishedDate(dateString: string | null): string {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Get camera info string from EXIF data
 */
export function getCameraInfoString(exif: PhotoExif | null): string | null {
  if (!exif) return null;

  const parts: string[] = [];

  // Camera model (clean up make if it's in model)
  if (exif.camera_model) {
    let model = exif.camera_model;
    if (exif.camera_make && model.toLowerCase().startsWith(exif.camera_make.toLowerCase())) {
      model = model.slice(exif.camera_make.length).trim();
    }
    parts.push(exif.camera_make ? `${exif.camera_make} ${model}` : model);
  } else if (exif.camera_make) {
    parts.push(exif.camera_make);
  }

  // Lens model (clean up camera info if present)
  if (exif.lens_model) {
    let lens = exif.lens_model;
    if (exif.camera_make) {
      lens = lens.replace(new RegExp(exif.camera_make, "gi"), "").trim();
    }
    if (exif.camera_model) {
      lens = lens.replace(new RegExp(exif.camera_model, "gi"), "").trim();
    }
    // Clean up any leading/trailing separators
    lens = lens.replace(/^[\s·\-]+|[\s·\-]+$/g, "").trim();
    if (lens) {
      parts.push(lens);
    }
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * Group posts by translation_group_id and select preferred language version
 * @param posts - All posts to group
 * @param preferredLang - Preferred language (default: zh-CN)
 * @returns Array of PostGroups with deduplication
 */
export function groupPostsByTranslation(
  posts: PostWithCover[],
  preferredLang: Language = DEFAULT_LANGUAGE
): PostGroup[] {
  // Group posts by translation_group_id
  const groups = new Map<string, PostWithCover[]>();
  const standalone: PostWithCover[] = [];

  for (const post of posts) {
    if (post.translation_group_id) {
      const existing = groups.get(post.translation_group_id) || [];
      existing.push(post);
      groups.set(post.translation_group_id, existing);
    } else {
      // Posts without translation_group_id are standalone
      standalone.push(post);
    }
  }

  const result: PostGroup[] = [];

  // Process grouped posts
  for (const [, groupPosts] of groups) {
    const availableLanguages = groupPosts.map((p) => p.language);
    
    // Try to find preferred language version
    const preferredPost = groupPosts.find((p) => p.language === preferredLang);
    const displayPost = preferredPost || groupPosts[0];
    
    result.push({
      post: displayPost,
      availableLanguages,
      isPreferredLanguage: displayPost.language === preferredLang,
    });
  }

  // Add standalone posts
  for (const post of standalone) {
    result.push({
      post,
      availableLanguages: [post.language],
      isPreferredLanguage: post.language === preferredLang,
    });
  }

  // Sort by published_at descending
  result.sort((a, b) => {
    const dateA = a.post.published_at ? new Date(a.post.published_at).getTime() : 0;
    const dateB = b.post.published_at ? new Date(b.post.published_at).getTime() : 0;
    return dateB - dateA;
  });

  return result;
}

/**
 * Get language display info
 */
export function getLanguageInfo(lang: Language | null | undefined) {
  if (!lang || !(lang in LANGUAGES)) {
    return LANGUAGES["en"]; // Default fallback
  }
  return LANGUAGES[lang];
}

/**
 * Check if a value is a valid Language
 */
export function isValidLanguage(lang: unknown): lang is Language {
  return typeof lang === "string" && lang in LANGUAGES;
}
