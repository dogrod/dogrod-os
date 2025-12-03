"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Tooltip } from "@heroui/react";
import type { TimeAxisData, TimeAxisTick } from "@/lib/gallery/types";
import { formatMonth, formatMonthFull } from "@/lib/gallery/utils";

interface TimeAxisProps {
  data: TimeAxisData;
  currentDate: string | null;
  onJumpToPhoto: (photoId: string, photoIndex: number) => void;
}

/**
 * Desktop vertical time axis for gallery navigation
 * Shows years and months for the current year
 */
export function TimeAxis({ data, currentDate, onJumpToPhoto }: TimeAxisProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [hoveredTick, setHoveredTick] = useState<string | null>(null);
  const axisRef = useRef<HTMLDivElement>(null);

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

  // All ticks: years + current year months
  const allTicks: (TimeAxisTick & { type: "year" | "month" })[] = [
    ...data.currentYearMonths.map((t) => ({ ...t, type: "month" as const })),
    ...data.years.map((t) => ({ ...t, type: "year" as const })),
  ];

  const handleTickClick = useCallback(
    (tick: TimeAxisTick) => {
      onJumpToPhoto(tick.photoId, tick.photoIndex);
    },
    [onJumpToPhoto]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (allTicks.length === 0) return;

      let newIndex = focusedIndex;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          newIndex = Math.max(0, focusedIndex - 1);
          break;
        case "ArrowDown":
          e.preventDefault();
          newIndex = Math.min(allTicks.length - 1, focusedIndex + 1);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < allTicks.length) {
            handleTickClick(allTicks[focusedIndex]);
          }
          break;
        case "Home":
          e.preventDefault();
          newIndex = 0;
          break;
        case "End":
          e.preventDefault();
          newIndex = allTicks.length - 1;
          break;
        default:
          return;
      }

      setFocusedIndex(newIndex);
    },
    [allTicks, focusedIndex, handleTickClick]
  );

  const isTickActive = (tick: TimeAxisTick & { type: "year" | "month" }) => {
    if (!currentYearMonth) return false;

    if (tick.type === "year") {
      return tick.year === currentYearMonth.year;
    } else {
      return tick.year === currentYearMonth.year && tick.month === currentYearMonth.month;
    }
  };

  const getTickLabel = (tick: TimeAxisTick & { type: "year" | "month" }) => {
    if (tick.type === "year") {
      return `${tick.year}`;
    } else {
      return `${tick.year} · ${String(tick.month).padStart(2, "0")}`;
    }
  };

  const getAccessibleLabel = (tick: TimeAxisTick & { type: "year" | "month" }) => {
    if (tick.type === "year") {
      return `Jump to year ${tick.year}`;
    } else {
      return `Jump to ${formatMonthFull(tick.month!)} ${tick.year}`;
    }
  };

  if (data.years.length === 0) {
    return null;
  }

  return (
    <div
      ref={axisRef}
      className="fixed left-0 top-14 bottom-0 z-40 hidden w-14 flex-col items-center py-8 md:flex"
      role="navigation"
      aria-label="Time navigation"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={() => focusedIndex < 0 && setFocusedIndex(0)}
    >
      <div className="flex flex-col items-center gap-2">
        {allTicks.map((tick, index) => {
          const tickKey = tick.type === "year" ? `y-${tick.year}` : `m-${tick.year}-${tick.month}`;
          const isActive = isTickActive(tick);
          const isFocused = index === focusedIndex;
          const isMonth = tick.type === "month";

          return (
            <Tooltip
              key={tickKey}
              content={getTickLabel(tick)}
              placement="right"
              delay={0}
              closeDelay={0}
              isOpen={hoveredTick === tickKey || isFocused}
            >
              <button
                className={`
                  relative transition-all duration-150
                  ${isMonth ? "h-3 w-3" : "h-4 w-4"}
                  ${
                    isActive
                      ? "bg-zinc-900 dark:bg-zinc-100"
                      : "bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-500"
                  }
                  ${isMonth ? "rounded-sm" : "rounded-full"}
                  ${isFocused ? "ring-2 ring-blue-500 ring-offset-2" : ""}
                `}
                onClick={() => handleTickClick(tick)}
                onMouseEnter={() => setHoveredTick(tickKey)}
                onMouseLeave={() => setHoveredTick(null)}
                aria-label={getAccessibleLabel(tick)}
                tabIndex={-1}
              />
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

