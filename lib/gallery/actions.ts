"use server";

import { getGalleryPhotos } from "./queries";
import type { GalleryPhotosResponse } from "./types";

/**
 * Server action to fetch more photos for infinite scroll
 */
export async function fetchMorePhotosAction(
  cursor: string
): Promise<GalleryPhotosResponse> {
  return getGalleryPhotos(cursor, 50);
}



