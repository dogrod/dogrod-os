"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BlurhashImage } from "./BlurhashImage";
import { Button } from "@heroui/react";

interface PhotoViewerProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurhash?: string | null;
  prevPhotoId?: string | null;
  nextPhotoId?: string | null;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_LEVEL = 2; // Fixed zoom level for click-to-zoom

/**
 * Photo viewer with click-to-zoom, pan, fullscreen, and prev/next navigation
 * Mouse wheel scrolls the page, not the zoom
 */
export function PhotoViewer({
  src,
  alt,
  width,
  height,
  blurhash,
  prevPhotoId,
  nextPhotoId,
}: PhotoViewerProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false); // Ref for immediate drag state
  const hasDraggedRef = useRef(false); // Track if user actually dragged (moved > threshold)
  const dragStartPosRef = useRef({ x: 0, y: 0 }); // Track initial mouse position for threshold
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const DRAG_THRESHOLD = 5; // Minimum pixels to move before considering it a drag
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPrevArrow, setShowPrevArrow] = useState(false);
  const [showNextArrow, setShowNextArrow] = useState(false);

  // Reset zoom and pan when image changes
  useEffect(() => {
    setZoom(MIN_ZOOM);
    setPan({ x: 0, y: 0 });
    setIsLoaded(false);
  }, [src]);

  // Clamp pan values to prevent showing empty space
  const clampPan = useCallback(
    (newPan: { x: number; y: number }, currentZoom: number) => {
      if (currentZoom <= MIN_ZOOM) {
        return { x: 0, y: 0 };
      }

      const container = containerRef.current;
      const image = imageRef.current;
      if (!container || !image) return newPan;

      const containerRect = container.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();

      // Calculate the actual rendered image size (scaled)
      const scaledWidth = imageRect.width;
      const scaledHeight = imageRect.height;

      // Calculate max pan values (how far we can move before showing empty space)
      const maxPanX = Math.max(0, (scaledWidth - containerRect.width) / 2);
      const maxPanY = Math.max(0, (scaledHeight - containerRect.height) / 2);

      return {
        x: Math.max(-maxPanX, Math.min(maxPanX, newPan.x)),
        y: Math.max(-maxPanY, Math.min(maxPanY, newPan.y)),
      };
    },
    []
  );

  // Handle single click to toggle zoom
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Don't zoom if we were dragging (check the ref for actual drag)
      if (hasDraggedRef.current) {
        hasDraggedRef.current = false;
        return;
      }

      // Don't zoom if clicking navigation zones
      const target = e.target as HTMLElement;
      if (target.closest("[data-nav-zone]")) return;

      if (zoom === MIN_ZOOM) {
        // Zoom in centered on click position
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          const newPan = { x: -x * (ZOOM_LEVEL - 1), y: -y * (ZOOM_LEVEL - 1) };
          setZoom(ZOOM_LEVEL);
          setPan(clampPan(newPan, ZOOM_LEVEL));
        }
      } else {
        // Reset to fit
        setZoom(MIN_ZOOM);
        setPan({ x: 0, y: 0 });
      }
    },
    [zoom, clampPan]
  );

  // Handle drag to pan
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Don't start drag on navigation zones
      const target = e.target as HTMLElement;
      if (target.closest("[data-nav-zone]")) return;

      // Only respond to left mouse button
      if (e.button !== 0) return;

      if (zoom > MIN_ZOOM) {
        isDraggingRef.current = true;
        hasDraggedRef.current = false;
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        e.preventDefault(); // Prevent text selection
      }
    },
    [zoom, pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Check if left mouse button is actually pressed (buttons bitmask: 1 = left button)
      if (!isDraggingRef.current || (e.buttons & 1) === 0) {
        // Mouse button is not pressed, stop dragging
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          setIsDragging(false);
        }
        return;
      }

      // Check if we've moved past the drag threshold
      const dx = e.clientX - dragStartPosRef.current.x;
      const dy = e.clientY - dragStartPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance >= DRAG_THRESHOLD) {
        hasDraggedRef.current = true;
      }

      const newPan = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };
      setPan(clampPan(newPan, zoom));
    },
    [dragStart, zoom, clampPan]
  );

  const handleMouseUp = useCallback(() => {
    // Immediately stop dragging
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const touchStartRef = useRef<{ x: number; y: number; distance?: number } | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1 && zoom > MIN_ZOOM) {
        touchStartRef.current = {
          x: e.touches[0].clientX - pan.x,
          y: e.touches[0].clientY - pan.y,
        };
      } else if (e.touches.length === 2) {
        // Pinch zoom (still allowed on touch)
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartRef.current = {
          x: pan.x,
          y: pan.y,
          distance: Math.sqrt(dx * dx + dy * dy),
        };
      }
    },
    [zoom, pan]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1 && touchStartRef.current && !touchStartRef.current.distance) {
        if (zoom > MIN_ZOOM) {
          const newPan = {
            x: e.touches[0].clientX - touchStartRef.current.x,
            y: e.touches[0].clientY - touchStartRef.current.y,
          };
          setPan(clampPan(newPan, zoom));
        }
      } else if (e.touches.length === 2 && touchStartRef.current?.distance) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const scale = distance / touchStartRef.current.distance;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * scale));

        setZoom(newZoom);
        touchStartRef.current.distance = distance;
      }
    },
    [zoom, clampPan]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Navigation handlers
  const navigateToPrev = useCallback(() => {
    if (prevPhotoId) {
      router.push(`/gallery/${prevPhotoId}`);
    }
  }, [prevPhotoId, router]);

  const navigateToNext = useCallback(() => {
    if (nextPhotoId) {
      router.push(`/gallery/${nextPhotoId}`);
    }
  }, [nextPhotoId, router]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        document.exitFullscreen();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "0") {
        setZoom(MIN_ZOOM);
        setPan({ x: 0, y: 0 });
      } else if (e.key === "ArrowLeft") {
        navigateToPrev();
      } else if (e.key === "ArrowRight") {
        navigateToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen, toggleFullscreen, navigateToPrev, navigateToNext]);

  return (
    <div
      ref={containerRef}
      className={`
        relative flex items-center justify-center overflow-hidden select-none
        ${isFullscreen ? "bg-black" : "bg-zinc-100 dark:bg-zinc-900"}
        ${zoom > MIN_ZOOM ? "cursor-grab" : "cursor-zoom-in"}
        ${isDragging ? "cursor-grabbing" : ""}
      `}
      style={{
        height: isFullscreen ? "100vh" : "100%",
        minHeight: "400px",
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Previous navigation zone - fixed position starting below header */}
      {prevPhotoId && (
        <div
          data-nav-zone="prev"
          className={`${isFullscreen ? "absolute top-0" : "fixed"} left-0 bottom-0 flex w-20 cursor-pointer items-center justify-center transition-opacity`}
          style={isFullscreen ? undefined : { top: "48px" }}
          onClick={(e) => {
            e.stopPropagation();
            navigateToPrev();
          }}
          onMouseEnter={() => setShowPrevArrow(true)}
          onMouseLeave={() => setShowPrevArrow(false)}
        >
          <div
            className={`
              rounded-full bg-black/40 p-2 backdrop-blur-sm transition-opacity duration-200
              ${showPrevArrow ? "opacity-100" : "opacity-0"}
            `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </div>
        </div>
      )}

      {/* Next navigation zone - fixed position starting below header */}
      {nextPhotoId && (
        <div
          data-nav-zone="next"
          className={`${isFullscreen ? "absolute top-0" : "fixed"} right-0 bottom-0 flex w-20 cursor-pointer items-center justify-center transition-opacity`}
          style={isFullscreen ? undefined : { top: "48px" }}
          onClick={(e) => {
            e.stopPropagation();
            navigateToNext();
          }}
          onMouseEnter={() => setShowNextArrow(true)}
          onMouseLeave={() => setShowNextArrow(false)}
        >
          <div
            className={`
              rounded-full bg-black/40 p-2 backdrop-blur-sm transition-opacity duration-200
              ${showNextArrow ? "opacity-100" : "opacity-0"}
            `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      )}

      {/* Image container */}
      <div
        ref={imageRef}
        className="relative transition-transform duration-100"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      >
        <BlurhashImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          blurhash={blurhash}
          className="max-h-full max-w-full object-contain"
          onLoad={() => setIsLoaded(true)}
        />
      </div>

      {/* Fullscreen button */}
      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
        {zoom > MIN_ZOOM && (
          <Button
            size="sm"
            variant="flat"
            className="bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
            onClick={(e) => {
              e.stopPropagation();
              setZoom(MIN_ZOOM);
              setPan({ x: 0, y: 0 });
            }}
          >
            Reset
          </Button>
        )}
        <Button
          size="sm"
          variant="flat"
          className="bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
          onClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
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
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            </svg>
          ) : (
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
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          )}
        </Button>
      </div>

      {/* Zoom indicator */}
      {zoom > MIN_ZOOM && (
        <div className="absolute left-4 bottom-4 z-20 rounded-md bg-black/50 px-2 py-1 text-sm text-white backdrop-blur-sm">
          {Math.round(zoom * 100)}%
        </div>
      )}
    </div>
  );
}
