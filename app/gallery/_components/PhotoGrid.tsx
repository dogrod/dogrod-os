"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { PhotoCard } from "./PhotoCard";
import { fetchMorePhotosAction } from "@/lib/gallery/actions";
import type { PhotoWithRenditions, TimeAxisData } from "@/lib/gallery/types";
import { Spinner } from "@heroui/react";

interface PhotoGridProps {
  initialPhotos: PhotoWithRenditions[];
  initialCursor: string | null;
  initialHasMore: boolean;
  timeAxisData: TimeAxisData;
  onScrollChange?: (topPhotoDate: string | null) => void;
}

const SCROLL_POSITION_KEY = "gallery-scroll-position";
const PHOTOS_STATE_KEY = "gallery-photos-state";

/**
 * Masonry photo grid with infinite scroll
 * Uses CSS columns for masonry layout with flexbox fallback
 */
export function PhotoGrid({
  initialPhotos,
  initialCursor,
  initialHasMore,
  onScrollChange,
}: PhotoGridProps) {
  const [photos, setPhotos] = useState<PhotoWithRenditions[]>(initialPhotos);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();
  const [isInitialized, setIsInitialized] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const lastScrollReport = useRef<string | null>(null);

  // Save scroll position before navigation
  const saveScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SCROLL_POSITION_KEY, String(window.scrollY));
      // Also save current photos state for restoration
      sessionStorage.setItem(
        PHOTOS_STATE_KEY,
        JSON.stringify({
          photos,
          cursor,
          hasMore,
        })
      );
    }
  }, [photos, cursor, hasMore]);

  // Restore scroll position on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
      const savedState = sessionStorage.getItem(PHOTOS_STATE_KEY);

      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          // Only restore if we have more photos than initial
          if (state.photos && state.photos.length > initialPhotos.length) {
            setPhotos(state.photos);
            setCursor(state.cursor);
            setHasMore(state.hasMore);
          }
        } catch (e) {
          console.warn("Failed to restore photos state:", e);
        }
      }

      if (savedPosition) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedPosition, 10));
        });
      }

      setIsInitialized(true);
    }
  }, [initialPhotos.length, isInitialized]);

  // Load more photos when intersection observer triggers
  const loadMore = useCallback(async () => {
    if (!cursor || !hasMore || isPending) return;

    startTransition(async () => {
      try {
        const result = await fetchMorePhotosAction(cursor);
        setPhotos((prev) => [...prev, ...result.photos]);
        setCursor(result.nextCursor);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error("Failed to load more photos:", error);
      }
    });
  }, [cursor, hasMore, isPending]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isPending) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMore, hasMore, isPending]);

  // Track scroll position and report top visible photo
  useEffect(() => {
    if (!onScrollChange) return;

    const handleScroll = () => {
      const photoElements = document.querySelectorAll("[data-photo-id]");
      let topPhotoElement: Element | null = null;
      let topPhotoTop = Infinity;

      for (const el of photoElements) {
        const rect = el.getBoundingClientRect();
        // Find the photo closest to the top of the viewport
        if (rect.top >= -rect.height / 2 && rect.top < topPhotoTop) {
          topPhotoTop = rect.top;
          topPhotoElement = el;
        }
      }

      if (topPhotoElement) {
        const date = topPhotoElement.getAttribute("data-captured-at");
        if (date && date !== lastScrollReport.current) {
          lastScrollReport.current = date;
          onScrollChange(date);
        }
      }
    };

    // Throttled scroll handler
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", scrollListener, { passive: true });
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", scrollListener);
    };
  }, [onScrollChange, photos]);

  if (photos.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-zinc-500 dark:text-zinc-400">No photos yet</p>
          <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
            Check back later for new content
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={gridRef} className="w-full">
      {/* Masonry grid using CSS columns */}
      <div className="columns-1 gap-5 sm:columns-2 md:columns-3">
        {photos.map((photo, index) => (
          <div key={photo.id} className="mb-5 break-inside-avoid">
            <PhotoCard
              photo={photo}
              priority={index < 8}
              onNavigate={saveScrollPosition}
            />
          </div>
        ))}
      </div>

      {/* Load more trigger */}
      <div
        ref={loadMoreRef}
        className="flex h-20 items-center justify-center"
      >
        {isPending && (
          <Spinner size="lg" color="default" />
        )}
        {!hasMore && photos.length > 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            You&apos;ve seen all photos
          </p>
        )}
      </div>
    </div>
  );
}

