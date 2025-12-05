import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Photo,
  PhotoRendition,
  PhotoExif,
  PhotoHistogram,
  PhotoWithRenditions,
  PhotoWithDetails,
  GalleryPhotosResponse,
  TimeAxisData,
  TimeAxisTick,
} from "./types";

const DEFAULT_PAGE_SIZE = 50;

/**
 * Base query conditions for public photos
 */
const PUBLIC_PHOTO_CONDITIONS = {
  is_visible: true,
  status: "published" as const,
  visibility: "public" as const,
};

/**
 * Fetch photos for the gallery list page with pagination
 * Returns photos with their renditions, sorted by captured_at DESC (with uploaded_at fallback)
 */
export async function getGalleryPhotos(
  cursor?: string,
  limit: number = DEFAULT_PAGE_SIZE
): Promise<GalleryPhotosResponse> {
  const supabase = await createSupabaseServerClient();

  // Build the query
  let query = supabase
    .from("photos")
    .select(
      `
      *,
      renditions:photo_rendition(*)
    `
    )
    .eq("is_visible", PUBLIC_PHOTO_CONDITIONS.is_visible)
    .eq("status", PUBLIC_PHOTO_CONDITIONS.status)
    .eq("visibility", PUBLIC_PHOTO_CONDITIONS.visibility)
    .order("captured_at", { ascending: false, nullsFirst: false })
    .order("uploaded_at", { ascending: false })
    .limit(limit + 1); // Fetch one extra to determine if there are more

  // Apply cursor-based pagination
  if (cursor) {
    // Cursor is the captured_at or uploaded_at of the last photo
    query = query.lt("captured_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching gallery photos:", error);
    throw new Error("Failed to fetch gallery photos");
  }

  const photos = (data || []) as (Photo & { renditions: PhotoRendition[] })[];

  // Check if there are more photos
  const hasMore = photos.length > limit;
  const photosToReturn = hasMore ? photos.slice(0, limit) : photos;

  // Determine next cursor
  const lastPhoto = photosToReturn[photosToReturn.length - 1];
  const nextCursor = hasMore && lastPhoto
    ? lastPhoto.captured_at || lastPhoto.uploaded_at
    : null;

  return {
    photos: photosToReturn,
    nextCursor,
    hasMore,
  };
}

/**
 * Fetch all photos for time axis data generation
 * Returns minimal data needed to build time axis
 */
export async function getTimeAxisData(): Promise<TimeAxisData> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("photos")
    .select("id, captured_at, uploaded_at")
    .eq("is_visible", PUBLIC_PHOTO_CONDITIONS.is_visible)
    .eq("status", PUBLIC_PHOTO_CONDITIONS.status)
    .eq("visibility", PUBLIC_PHOTO_CONDITIONS.visibility)
    .order("captured_at", { ascending: false, nullsFirst: false })
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Error fetching time axis data:", error);
    throw new Error("Failed to fetch time axis data");
  }

  const photos = data || [];

  // Build year and month maps
  const yearMap = new Map<number, { photoId: string; photoIndex: number }>();
  const monthMap = new Map<string, { photoId: string; photoIndex: number }>();

  photos.forEach((photo, index) => {
    const dateStr = photo.captured_at || photo.uploaded_at;
    if (!dateStr) return;

    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    // Track first photo for each year
    if (!yearMap.has(year)) {
      yearMap.set(year, { photoId: photo.id, photoIndex: index });
    }

    // Track first photo for each month
    const monthKey = `${year}-${month}`;
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { photoId: photo.id, photoIndex: index });
    }
  });

  // Convert to arrays sorted by year/month
  const years: TimeAxisTick[] = Array.from(yearMap.entries())
    .sort((a, b) => b[0] - a[0]) // Descending
    .map(([year, data]) => ({
      year,
      photoId: data.photoId,
      photoIndex: data.photoIndex,
    }));

  // Get months for the most recent year only
  const currentYear = years[0]?.year;
  const currentYearMonths: TimeAxisTick[] = currentYear
    ? Array.from(monthMap.entries())
        .filter(([key]) => key.startsWith(`${currentYear}-`))
        .sort((a, b) => {
          const monthA = parseInt(a[0].split("-")[1]);
          const monthB = parseInt(b[0].split("-")[1]);
          return monthB - monthA; // Descending
        })
        .map(([key, data]) => ({
          year: currentYear,
          month: parseInt(key.split("-")[1]),
          photoId: data.photoId,
          photoIndex: data.photoIndex,
        }))
    : [];

  return {
    years,
    currentYearMonths,
  };
}

/**
 * Fetch a single photo with all details by ID
 */
export async function getPhotoById(id: string): Promise<PhotoWithDetails | null> {
  const supabase = await createSupabaseServerClient();

  // Fetch photo with all related data
  const { data: photo, error: photoError } = await supabase
    .from("photos")
    .select(
      `
      *,
      renditions:photo_rendition(*),
      exif:photo_exif(*),
      histogram:photo_histogram(*)
    `
    )
    .eq("id", id)
    .eq("is_visible", PUBLIC_PHOTO_CONDITIONS.is_visible)
    .eq("status", PUBLIC_PHOTO_CONDITIONS.status)
    .eq("visibility", PUBLIC_PHOTO_CONDITIONS.visibility)
    .single();

  if (photoError) {
    if (photoError.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("Error fetching photo:", photoError);
    throw new Error("Failed to fetch photo");
  }

  if (!photo) return null;

  // Transform the response to match our types
  const photoData = photo as Photo & {
    renditions: PhotoRendition[];
    exif: PhotoExif | PhotoExif[] | null;
    histogram: PhotoHistogram | PhotoHistogram[] | null;
  };

  return {
    ...photoData,
    renditions: photoData.renditions || [],
    exif: Array.isArray(photoData.exif) ? photoData.exif[0] || null : photoData.exif,
    histogram: Array.isArray(photoData.histogram)
      ? photoData.histogram[0] || null
      : photoData.histogram,
  };
}

/**
 * Fetch adjacent photos for navigation (prev/next)
 * This is useful for implementing photo navigation in the detail view
 */
export async function getAdjacentPhotos(
  currentId: string,
  capturedAt: string | null,
  uploadedAt: string
): Promise<{ prev: string | null; next: string | null }> {
  const supabase = await createSupabaseServerClient();
  const dateRef = capturedAt || uploadedAt;

  // Get previous photo (newer)
  const { data: prevData } = await supabase
    .from("photos")
    .select("id")
    .eq("is_visible", PUBLIC_PHOTO_CONDITIONS.is_visible)
    .eq("status", PUBLIC_PHOTO_CONDITIONS.status)
    .eq("visibility", PUBLIC_PHOTO_CONDITIONS.visibility)
    .gt("captured_at", dateRef)
    .order("captured_at", { ascending: true })
    .limit(1)
    .single();

  // Get next photo (older)
  const { data: nextData } = await supabase
    .from("photos")
    .select("id")
    .eq("is_visible", PUBLIC_PHOTO_CONDITIONS.is_visible)
    .eq("status", PUBLIC_PHOTO_CONDITIONS.status)
    .eq("visibility", PUBLIC_PHOTO_CONDITIONS.visibility)
    .lt("captured_at", dateRef)
    .neq("id", currentId)
    .order("captured_at", { ascending: false })
    .limit(1)
    .single();

  return {
    prev: prevData?.id || null,
    next: nextData?.id || null,
  };
}

/**
 * Server action to load more photos (for infinite scroll)
 */
export async function loadMorePhotos(cursor: string): Promise<GalleryPhotosResponse> {
  return getGalleryPhotos(cursor, DEFAULT_PAGE_SIZE);
}



