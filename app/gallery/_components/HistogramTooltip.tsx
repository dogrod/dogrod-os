"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Tooltip } from "@heroui/react";
import type { PhotoHistogram } from "@/lib/gallery/types";

interface HistogramTooltipProps {
  histogram: PhotoHistogram;
}

/**
 * Compact histogram displayed in a tooltip
 * Shows RGB histogram on hover over the "Histogram" text button
 */
export function HistogramTooltip({ histogram }: HistogramTooltipProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const drawHistogram = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size for high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const bins = histogram.bins;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate bar width
    const barWidth = width / bins;

    // Find max value for normalization (RGB mode)
    const maxValue = Math.max(
      ...histogram.counts_red,
      ...histogram.counts_green,
      ...histogram.counts_blue
    );

    if (maxValue === 0) return;

    // Draw RGB overlaid with transparency
    const channels = [
      { data: histogram.counts_red, color: "rgba(255, 100, 100, 0.6)" },
      { data: histogram.counts_green, color: "rgba(100, 255, 100, 0.6)" },
      { data: histogram.counts_blue, color: "rgba(100, 100, 255, 0.6)" },
    ];

    channels.forEach(({ data, color }) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let i = 0; i < bins; i++) {
        const barHeight = (data[i] / maxValue) * height;
        const x = i * barWidth;
        ctx.lineTo(x, height - barHeight);
      }

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    });
  }, [histogram]);

  // Draw when tooltip opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure canvas is mounted and sized
      requestAnimationFrame(() => {
        drawHistogram();
      });
    }
  }, [isOpen, drawHistogram]);

  const histogramContent = (
    <div className="p-3">
      <div className="relative h-32 w-64 overflow-hidden rounded-md bg-zinc-800">
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ width: "256px", height: "128px" }}
          aria-label="RGB histogram"
        />
      </div>
    </div>
  );

  return (
    <Tooltip
      content={histogramContent}
      placement="top"
      delay={0}
      closeDelay={100}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      classNames={{
        content: "bg-zinc-900/95 dark:bg-zinc-800/95 backdrop-blur-sm rounded-lg shadow-lg p-0",
      }}
    >
      <button
        className="text-sm text-zinc-600 underline decoration-zinc-400 underline-offset-2 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:decoration-zinc-500 dark:hover:text-zinc-200"
        type="button"
      >
        Histogram
      </button>
    </Tooltip>
  );
}
