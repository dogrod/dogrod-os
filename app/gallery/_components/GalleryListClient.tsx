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
      const headerHeight = 56; // 14 * 4 = 56px (h-14)
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
      {/* Desktop time axis */}
      <TimeAxis
        data={timeAxisData}
        currentDate={currentDate}
        onJumpToPhoto={handleJumpToPhoto}
      />

      {/* Photo grid with left margin for time axis on desktop */}
      <div className="px-4 pb-20 md:pl-16 md:pr-4">
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

