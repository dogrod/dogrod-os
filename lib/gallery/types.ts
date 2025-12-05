/**
 * Gallery module type definitions
 * These types match the database schema from Supabase
 */

// Database enum types
export type PhotoStatus = "draft" | "scheduled" | "published" | "archived";
export type Visibility = "public" | "unlisted" | "private";
export type Orientation = "landscape" | "portrait" | "square";

/**
 * Main photo entity from the `photos` table
 */
export interface Photo {
  id: string;
  title: string | null;
  description: string | null;
  captured_at: string | null;
  uploaded_at: string;
  asset_original_id: string | null;
  width: number;
  height: number;
  aspect_ratio: number | null;
  orientation: Orientation | null;
  place_name: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  dominant_color: string | null;
  blurhash: string | null;
  megapixels: number | null;
  dynamic_range_usage: number | null;
  is_visible: boolean;
  status: PhotoStatus;
  visibility: Visibility;
  created_at: string;
  updated_at: string;
}

/**
 * Photo rendition/variant from the `photo_rendition` table
 */
export interface PhotoRendition {
  photo_id: string;
  variant_name: string;
  url: string;
  width: number | null;
  height: number | null;
  file_size: number | null;
  checksum: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * EXIF metadata from the `photo_exif` table
 */
export interface PhotoExif {
  photo_id: string;
  camera_make: string | null;
  camera_model: string | null;
  lens_model: string | null;
  focal_length_mm: number | null;
  aperture: number | null;
  shutter_s: number | null;
  iso: number | null;
  exposure_compensation_ev: number | null;
  metering_mode: string | null;
  white_balance_mode: string | null;
  shooting_mode: string | null;
  exif_datetime_original: string | null;
  color_space: string | null;
  bit_depth: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Histogram data from the `photo_histogram` table
 */
export interface PhotoHistogram {
  photo_id: string;
  bins: number;
  counts_luma: number[];
  counts_red: number[];
  counts_green: number[];
  counts_blue: number[];
  highlights_pct: number | null;
  shadows_pct: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Photo with renditions for list page
 */
export interface PhotoWithRenditions extends Photo {
  renditions: PhotoRendition[];
}

/**
 * Complete photo with all details for detail page
 */
export interface PhotoWithDetails extends Photo {
  renditions: PhotoRendition[];
  exif: PhotoExif | null;
  histogram: PhotoHistogram | null;
}

/**
 * Time axis data structure for navigation
 */
export interface TimeAxisTick {
  year: number;
  month?: number; // 1-12, only present for month ticks
  photoId: string; // ID of the first photo in this period
  photoIndex: number; // Index in the photo list for scrolling
}

export interface TimeAxisData {
  years: TimeAxisTick[];
  currentYearMonths: TimeAxisTick[]; // Months for the most recent year
}

/**
 * Gallery list page response
 */
export interface GalleryPhotosResponse {
  photos: PhotoWithRenditions[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Helper type for getting a specific rendition variant
 */
export type RenditionVariant = "thumb" | "list" | "detail" | "xl";

/**
 * Get the URL for a specific rendition variant
 */
export function getRenditionUrl(
  renditions: PhotoRendition[],
  variant: RenditionVariant,
  fallbackVariant?: RenditionVariant
): string | null {
  const rendition = renditions.find((r) => r.variant_name === variant);
  if (rendition) return rendition.url;

  if (fallbackVariant) {
    const fallback = renditions.find((r) => r.variant_name === fallbackVariant);
    if (fallback) return fallback.url;
  }

  // Return any available rendition as last resort
  return renditions[0]?.url ?? null;
}

/**
 * Get location string from photo data
 */
export function getLocationString(photo: Photo): string | null {
  const parts: string[] = [];

  if (photo.place_name) parts.push(photo.place_name);
  else if (photo.city) parts.push(photo.city);

  if (photo.region && photo.region !== photo.city) parts.push(photo.region);
  if (photo.country && parts.length === 0) parts.push(photo.country);

  return parts.length > 0 ? parts.join(", ") : null;
}

/**
 * Get display date from photo (captured_at or uploaded_at fallback)
 */
export function getDisplayDate(photo: Photo): Date {
  return new Date(photo.captured_at || photo.uploaded_at);
}

/**
 * Format date for display
 */
export function formatPhotoDate(photo: Photo): string {
  const date = getDisplayDate(photo);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}



