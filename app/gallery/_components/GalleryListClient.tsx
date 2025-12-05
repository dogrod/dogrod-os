"use client";

import { useCallback, useState } from "react";
import { PhotoGrid } from "./PhotoGrid";
import { TimeAxis } from "./TimeAxis";
import { TimeAxisMobile } from "./TimeAxisMobile";
import type { PhotoWithRenditions, TimeAxisData } from "@/lib/gallery/types";

interface GalleryListClientProps {
  initialPhotos: PhotoWithRenditions[];
  initialCursor: string | null;
  initialHasMore: boolean;
  timeAxisData: TimeAxisData;
}

/**
 * Client component that combines the photo grid and time axis
 * Handles scroll synchronization and navigation
 */
export function GalleryListClient({
  initialPhotos,
  initialCursor,
  initialHasMore,
  timeAxisData,
}: GalleryListClientProps) {
  const [currentDate, setCurrentDate] = useState<string | null>(null);

  const handleScrollChange = useCallback((topPhotoDate: string | null) => {
    setCurrentDate(topPhotoDate);
  }, []);

  const handleJumpToPhoto = useCallback((photoId: string, photoIndex: number) => {
    // Find the photo element and scroll to it
    const photoElement = document.querySelector(`[data-photo-id="${photoId}"]`);
    if (photoElement) {
      const headerHeight = 48; // 12 * 4 = 48px (h-12)
      const rect = photoElement.getBoundingClientRect();
      const absoluteTop = window.scrollY + rect.top - headerHeight - 16; // 16px padding

      window.scrollTo({
        top: absoluteTop,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <div className="relative">
      {/* Desktop time axis - fixed positioned, aligned with grid */}
      <TimeAxis
        data={timeAxisData}
        currentDate={currentDate}
        onJumpToPhoto={handleJumpToPhoto}
      />

      {/* Photo grid container - centered with max-width */}
      <div
        className="mx-auto pb-20"
        style={{
          maxWidth: "calc(var(--grid-width) + 2 * var(--grid-container-inline-padding))",
          paddingInline: "var(--grid-container-inline-padding)",
        }}
      >
        <PhotoGrid
          initialPhotos={initialPhotos}
          initialCursor={initialCursor}
          initialHasMore={initialHasMore}
          timeAxisData={timeAxisData}
          onScrollChange={handleScrollChange}
        />
      </div>

      {/* Mobile time axis */}
      <TimeAxisMobile
        data={timeAxisData}
        currentDate={currentDate}
        onJumpToPhoto={handleJumpToPhoto}
      />
    </div>
  );
}
