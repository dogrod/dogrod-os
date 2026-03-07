/**
 * Tag module type definitions
 */

import type { PostWithCover } from "@/lib/blog/types";
import type { PhotoWithRenditions } from "@/lib/gallery/types";

/**
 * Tag entity from the `tags` table
 */
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null; // Hex color (e.g., "#FF5733")
  created_at: string;
  updated_at: string;
}

/**
 * Minimal tag info for display in articles
 */
export interface TagInfo {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

/**
 * Tag with all related content for the Tag Hub page
 */
export interface TagWithContent extends Tag {
  posts: PostWithCover[];
  photos: PhotoWithRenditions[];
}

/**
 * Tag Hub stats
 */
export interface TagStats {
  articleCount: number;
  photoCount: number;
}

/**
 * Get contrast color (black or white) based on background hex color
 */
export function getContrastColor(hexColor: string | null): string {
  if (!hexColor) return "inherit";
  
  // Remove # if present
  const hex = hexColor.replace("#", "");
  
  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
