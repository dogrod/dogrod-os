"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { PhotoViewer } from "./PhotoViewer";
import { ExifInfo } from "./ExifInfo";
import { Histogram } from "./Histogram";
import type { PhotoWithDetails } from "@/lib/gallery/types";
import { getRenditionUrl, formatPhotoDate, getLocationString } from "@/lib/gallery/types";

interface PhotoDetailClientProps {
  photo: PhotoWithDetails;
}

/**
 * Client component for photo detail page
 * Handles navigation and displays the photo with EXIF and histogram
 */
export function PhotoDetailClient({ photo }: PhotoDetailClientProps) {
  const router = useRouter();

  // Get the detail variant URL
  const imageUrl = getRenditionUrl(photo.renditions, "detail", "list");
  const detailRendition = photo.renditions.find((r) => r.variant_name === "detail");
  const imageWidth = detailRendition?.width || photo.width;
  const imageHeight = detailRendition?.height || photo.height;

  // Format date and location
  const dateString = formatPhotoDate(photo);
  const locationString = getLocationString(photo);

  // Build the header info string
  const headerInfo = [dateString, locationString].filter(Boolean).join(" · ");

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

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top zone: Back button and date/location */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <Button
          variant="light"
          className="text-zinc-600 dark:text-zinc-400"
          onClick={handleBack}
          startContent={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          }
        >
          Back
        </Button>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          {headerInfo}
        </div>
      </div>

      {/* Middle zone: Photo viewer */}
      <div className="flex-1">
        <PhotoViewer
          src={imageUrl}
          alt={photo.title || photo.description || "Photo"}
          width={imageWidth}
          height={imageHeight}
          blurhash={photo.blurhash}
        />
      </div>

      {/* Bottom zone: EXIF and Histogram */}
      <div className="border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-4 md:flex-row md:items-start md:justify-between">
          {/* EXIF Info */}
          <div className="flex-1">
            {photo.exif ? (
              <ExifInfo exif={photo.exif} />
            ) : (
              <p className="text-sm text-zinc-400">No EXIF data available</p>
            )}
          </div>

          {/* Histogram */}
          <div className="flex-shrink-0">
            {photo.histogram ? (
              <Histogram histogram={photo.histogram} />
            ) : (
              <p className="text-sm text-zinc-400">Histogram unavailable</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

