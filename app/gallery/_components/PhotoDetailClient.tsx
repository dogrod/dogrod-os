"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { PhotoViewer } from "./PhotoViewer";
import { PhotoMetaInfo } from "./PhotoMetaInfo";
import { ExifInfo } from "./ExifInfo";
import { HistogramTooltip } from "./HistogramTooltip";
import type { PhotoWithDetails } from "@/lib/gallery/types";
import { getRenditionUrl } from "@/lib/gallery/types";

interface PhotoDetailClientProps {
  photo: PhotoWithDetails;
  prevPhotoId?: string | null;
  nextPhotoId?: string | null;
}

/**
 * Client component for photo detail page
 * Handles navigation and displays the photo with metadata, EXIF, and histogram
 */
export function PhotoDetailClient({
  photo,
  prevPhotoId,
  nextPhotoId,
}: PhotoDetailClientProps) {
  const router = useRouter();

  // Get the detail variant URL
  const imageUrl = getRenditionUrl(photo.renditions, "detail", "list");
  const detailRendition = photo.renditions.find((r) => r.variant_name === "detail");
  const imageWidth = detailRendition?.width || photo.width;
  const imageHeight = detailRendition?.height || photo.height;

  const handleBack = () => {
    // Try to go back in history, fallback to gallery list
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/gallery");
    }
  };

  if (!imageUrl) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-zinc-500">Image unavailable</p>
          <Button
            className="mt-4"
            variant="flat"
            onClick={handleBack}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Check if we have any EXIF data to show
  const hasExifData = photo.exif && (
    photo.exif.iso ||
    photo.exif.focal_length_mm ||
    photo.exif.aperture ||
    photo.exif.shutter_s
  );

  return (
    <div className="flex h-[calc(100vh-48px)] flex-col">
      {/* Photo viewer with navigation zones */}
      <div className="min-h-0 flex-1">
        <PhotoViewer
          src={imageUrl}
          alt={photo.title || photo.description || "Photo"}
          width={imageWidth}
          height={imageHeight}
          blurhash={photo.blurhash}
          prevPhotoId={prevPhotoId}
          nextPhotoId={nextPhotoId}
        />
      </div>

      {/* Bottom zone: Two-row info layout */}
      <div className="shrink-0 border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-3">
          {/* Row 1: Date, Location, Device with icons */}
          <PhotoMetaInfo photo={photo} />

          {/* Row 2: EXIF tokens + Histogram tooltip */}
          {(hasExifData || photo.histogram) && (
            <div className="flex flex-wrap items-center gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              {/* EXIF tokens */}
              {hasExifData && photo.exif && (
                <>
                  <ExifInfo exif={photo.exif} />
                  {photo.histogram && (
                    <span className="px-2 text-zinc-300 dark:text-zinc-600">·</span>
                  )}
                </>
              )}

              {/* Histogram tooltip button */}
              {photo.histogram && (
                <HistogramTooltip histogram={photo.histogram} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
