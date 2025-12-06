"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import type { TimeAxisData, TimeAxisTick } from "@/lib/gallery/types";
import { trackTimelineNavigation } from "@/lib/analytics";

interface TimeAxisProps {
  data: TimeAxisData;
  currentDate: string | null;
  onJumpToPhoto: (photoId: string, photoIndex: number) => void;
}

/**
 * Desktop vertical time axis for gallery navigation
 * Shows years only as horizontal line segments
 * Positioned to align horizontally with the waterfall grid
 * Hidden on narrow screens (below lg breakpoint)
 * Vertically centered in the viewport
 */
export function TimeAxis({ data, currentDate, onJumpToPhoto }: TimeAxisProps) {
  const [hoveredTick, setHoveredTick] = useState<string | null>(null);
  const [leftPosition, setLeftPosition] = useState<number | null>(null);
  const axisRef = useRef<HTMLDivElement>(null);

  // Get current year from the current date
  const currentYear = currentDate
    ? new Date(currentDate).getFullYear()
    : null;

  // Only show years (not months)
  const yearTicks = data.years;

  // Calculate left position based on grid container
  useEffect(() => {
    const calculatePosition = () => {
      // Get the grid width from CSS variable
      const gridWidth = 1296; // --grid-width
      const gridPadding = 48; // --grid-container-inline-padding
      const totalGridWidth = gridWidth + 2 * gridPadding;
      
      const viewportWidth = window.innerWidth;
      
      // Calculate where the grid starts
      const gridLeft = Math.max(0, (viewportWidth - totalGridWidth) / 2);
      
      // Position time axis to the left of the grid with some gap
      const axisPosition = gridLeft - 8; // 8px gap from grid edge
      
      // Only show if there's enough space (at least 48px for the axis)
      if (axisPosition >= 48) {
        setLeftPosition(axisPosition);
      } else {
        setLeftPosition(null);
      }
    };

    calculatePosition();
    window.addEventListener("resize", calculatePosition);
    return () => window.removeEventListener("resize", calculatePosition);
  }, []);

  const handleTickClick = useCallback(
    (tick: TimeAxisTick) => {
      trackTimelineNavigation({
        year: tick.year,
        device: "desktop",
      });
      onJumpToPhoto(tick.photoId, tick.photoIndex);
    },
    [onJumpToPhoto]
  );

  // Don't render if no years or not enough space
  if (yearTicks.length === 0 || leftPosition === null) {
    return null;
  }

  return (
    <div
      ref={axisRef}
      className="fixed top-0 bottom-0 z-40 hidden items-center justify-end lg:flex"
      style={{ 
        left: 0,
        width: `${leftPosition}px`,
        paddingTop: "48px", // Header height
      }}
      role="navigation"
      aria-label="Time navigation"
    >
      <div className="flex flex-col items-end gap-4 pr-2">
        {yearTicks.map((tick) => {
          const tickKey = `y-${tick.year}`;
          const isActive = currentYear === tick.year;
          const isHovered = hoveredTick === tickKey;

          return (
            <div key={tickKey} className="relative flex items-center">
              {/* Custom tooltip - positioned to the right of the line */}
              {isHovered && (
                <div className="absolute left-full ml-2 whitespace-nowrap rounded bg-white px-2 py-1 text-xs font-medium text-zinc-700 shadow-md border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
                  {tick.year}
                </div>
              )}
              
              <button
                className={`
                  h-0.5 w-7 rounded-sm transition-colors duration-150
                  ${isActive 
                    ? "bg-zinc-900 dark:bg-zinc-100" 
                    : "bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-500"
                  }
                `}
                onClick={() => handleTickClick(tick)}
                onMouseEnter={() => setHoveredTick(tickKey)}
                onMouseLeave={() => setHoveredTick(null)}
                aria-label={`Jump to year ${tick.year}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
