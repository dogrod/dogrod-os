"use client";

import Link from "next/link";
import { BlurhashImage } from "./BlurhashImage";
import type { PhotoWithRenditions } from "@/lib/gallery/types";
import { getRenditionUrl } from "@/lib/gallery/types";

interface PhotoCardProps {
  photo: PhotoWithRenditions;
  priority?: boolean;
  onNavigate?: () => void;
}

/**
 * Photo card for the gallery grid
 * Shows the photo with blurhash placeholder and hover effects
 */
export function PhotoCard({ photo, priority = false, onNavigate }: PhotoCardProps) {
  // Get the list variant URL, fallback to thumb
  const imageUrl = getRenditionUrl(photo.renditions, "list", "thumb");

  // Get rendition dimensions or fallback to photo dimensions
  const listRendition = photo.renditions.find((r) => r.variant_name === "list");
  const imageWidth = listRendition?.width || photo.width;
  const imageHeight = listRendition?.height || photo.height;

  if (!imageUrl) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800"
        style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
      >
        <span className="text-sm text-zinc-400">Image unavailable</span>
      </div>
    );
  }

  return (
    <Link
      href={`/gallery/${photo.id}`}
      onClick={onNavigate}
      className="group relative block overflow-hidden rounded-lg bg-zinc-100 shadow-sm transition-all duration-200 hover:shadow-lg hover:ring-2 hover:ring-zinc-300 dark:bg-zinc-800 dark:hover:ring-zinc-600"
      data-photo-id={photo.id}
      data-captured-at={photo.captured_at || photo.uploaded_at}
    >
      <BlurhashImage
        src={imageUrl}
        alt={photo.title || photo.description || "Photo"}
        width={imageWidth}
        height={imageHeight}
        blurhash={photo.blurhash}
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="transition-transform duration-200 group-hover:scale-[1.02]"
      />

      {/* Optional: Show title on hover */}
      {photo.title && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <p className="truncate text-sm font-medium text-white">{photo.title}</p>
        </div>
      )}
    </Link>
  );
}

