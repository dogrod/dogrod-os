"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BlurhashImage } from "./BlurhashImage";
import { Button } from "@heroui/react";

interface PhotoViewerProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurhash?: string | null;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;

/**
 * Photo viewer with zoom, pan, and fullscreen capabilities
 */
export function PhotoViewer({ src, alt, width, height, blurhash }: PhotoViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset zoom and pan when image changes
  useEffect(() => {
    setZoom(MIN_ZOOM);
    setPan({ x: 0, y: 0 });
    setIsLoaded(false);
  }, [src]);

  // Handle double click to toggle zoom
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (zoom === MIN_ZOOM) {
        // Zoom in centered on click position
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          setZoom(2);
          setPan({ x: -x * 0.5, y: -y * 0.5 });
        }
      } else {
        // Reset to fit
        setZoom(MIN_ZOOM);
        setPan({ x: 0, y: 0 });
      }
    },
    [zoom]
  );

  // Handle mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));

      if (newZoom !== zoom) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          // Zoom centered on mouse position
          const mouseX = e.clientX - rect.left - rect.width / 2;
          const mouseY = e.clientY - rect.top - rect.height / 2;

          const zoomRatio = newZoom / zoom;
          const newPanX = mouseX - (mouseX - pan.x) * zoomRatio;
          const newPanY = mouseY - (mouseY - pan.y) * zoomRatio;

          setZoom(newZoom);
          setPan({ x: newPanX, y: newPanY });
        }
      }
    },
    [zoom, pan]
  );

  // Handle drag to pan
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom > MIN_ZOOM) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [zoom, pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
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
        // Pinch zoom
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
          setPan({
            x: e.touches[0].clientX - touchStartRef.current.x,
            y: e.touches[0].clientY - touchStartRef.current.y,
          });
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
    [zoom]
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

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        document.exitFullscreen();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "+" || e.key === "=") {
        setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
      } else if (e.key === "-") {
        setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
      } else if (e.key === "0") {
        setZoom(MIN_ZOOM);
        setPan({ x: 0, y: 0 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen, toggleFullscreen]);

  return (
    <div
      ref={containerRef}
      className={`
        relative flex items-center justify-center overflow-hidden
        ${isFullscreen ? "bg-black" : "bg-zinc-100 dark:bg-zinc-900"}
        ${zoom > MIN_ZOOM ? "cursor-grab" : "cursor-zoom-in"}
        ${isDragging ? "cursor-grabbing" : ""}
      `}
      style={{
        height: isFullscreen ? "100vh" : "calc(100vh - 200px)",
        minHeight: "400px",
      }}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image container */}
      <div
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
      <div className="absolute bottom-4 right-4 flex gap-2">
        {zoom > MIN_ZOOM && (
          <Button
            size="sm"
            variant="flat"
            className="bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
            onClick={() => {
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
          onClick={toggleFullscreen}
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
        <div className="absolute left-4 bottom-4 rounded-md bg-black/50 px-2 py-1 text-sm text-white backdrop-blur-sm">
          {Math.round(zoom * 100)}%
        </div>
      )}
    </div>
  );
}

