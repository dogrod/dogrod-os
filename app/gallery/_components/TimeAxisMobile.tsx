"use client";

import { useCallback, useRef, useEffect } from "react";
import type { TimeAxisData, TimeAxisTick } from "@/lib/gallery/types";
import { formatMonth } from "@/lib/gallery/utils";

interface TimeAxisMobileProps {
  data: TimeAxisData;
  currentDate: string | null;
  onJumpToPhoto: (photoId: string, photoIndex: number) => void;
}

/**
 * Mobile horizontal time axis for gallery navigation
 * Shows recent months as a swipeable horizontal bar
 * Uses softer colors to match desktop time axis style
 */
export function TimeAxisMobile({ data, currentDate, onJumpToPhoto }: TimeAxisMobileProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get current year and month from the current date
  const currentYearMonth = currentDate
    ? (() => {
        const date = new Date(currentDate);
        return {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
        };
      })()
    : null;

  // Combine years and months into a single list for mobile
  // Show all months for recent years
  const allTicks: (TimeAxisTick & { label: string })[] = [];

  // Add current year months first
  data.currentYearMonths.forEach((tick) => {
    allTicks.push({
      ...tick,
      label: formatMonth(tick.month!),
    });
  });

  // Add year separators for other years
  data.years.slice(1).forEach((tick) => {
    allTicks.push({
      ...tick,
      label: String(tick.year),
    });
  });

  const handleTickClick = useCallback(
    (tick: TimeAxisTick) => {
      onJumpToPhoto(tick.photoId, tick.photoIndex);
    },
    [onJumpToPhoto]
  );

  const isTickActive = (tick: TimeAxisTick) => {
    if (!currentYearMonth) return false;

    if (tick.month) {
      return tick.year === currentYearMonth.year && tick.month === currentYearMonth.month;
    } else {
      return tick.year === currentYearMonth.year;
    }
  };

  // Scroll active tick into view
  useEffect(() => {
    if (!scrollRef.current || !currentYearMonth) return;

    const activeIndex = allTicks.findIndex((tick) => isTickActive(tick));
    if (activeIndex >= 0) {
      const tickElements = scrollRef.current.querySelectorAll("button");
      const activeElement = tickElements[activeIndex];
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentYearMonth, allTicks]);

  if (data.years.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md md:hidden dark:bg-zinc-950/90">
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto px-4 py-3 scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {allTicks.map((tick, index) => {
          const isActive = isTickActive(tick);
          const isYear = !tick.month;

          return (
            <button
              key={`${tick.year}-${tick.month || "y"}`}
              className={`
                flex-shrink-0 rounded-full px-3 py-1.5 text-sm transition-all
                ${
                  isActive
                    ? "bg-zinc-600 text-white dark:bg-zinc-300 dark:text-zinc-900 font-medium"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }
                ${isYear ? "font-semibold" : ""}
              `}
              onClick={() => handleTickClick(tick)}
              aria-label={
                tick.month
                  ? `Jump to ${formatMonth(tick.month)} ${tick.year}`
                  : `Jump to year ${tick.year}`
              }
            >
              {tick.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
