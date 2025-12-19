/**
 * Blog module type definitions
 * These types match the database schema from Supabase
 */

import type { Asset, AssetRendition, PhotoExif } from "@/lib/gallery/types";

// Database enum types (shared with other modules)
export type ContentStatus = "draft" | "scheduled" | "published" | "archived";
export type Visibility = "public" | "unlisted" | "private";

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
