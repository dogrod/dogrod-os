"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import type { PhotoHistogram } from "@/lib/gallery/types";

interface HistogramProps {
  histogram: PhotoHistogram;
}

type HistogramMode = "rgb" | "luma";

/**
 * Histogram visualization component
 * Shows RGB or Luma histogram with clipping indicators
 */
export function Histogram({ histogram }: HistogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<HistogramMode>("rgb");

  const drawHistogram = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const bins = histogram.bins;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, width, height);

    // Calculate bar width
    const barWidth = width / bins;

    // Find max value for normalization
    let maxValue = 0;
    if (mode === "rgb") {
      maxValue = Math.max(
        ...histogram.counts_red,
        ...histogram.counts_green,
        ...histogram.counts_blue
      );
    } else {
      maxValue = Math.max(...histogram.counts_luma);
    }

    if (maxValue === 0) return;

    // Draw histogram
    if (mode === "rgb") {
      // Draw RGB overlaid with transparency
      const channels = [
        { data: histogram.counts_red, color: "rgba(255, 80, 80, 0.5)" },
        { data: histogram.counts_green, color: "rgba(80, 255, 80, 0.5)" },
        { data: histogram.counts_blue, color: "rgba(80, 80, 255, 0.5)" },
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
    } else {
      // Draw Luma as white/gray
      ctx.fillStyle = "rgba(200, 200, 200, 0.7)";
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let i = 0; i < bins; i++) {
        const barHeight = (histogram.counts_luma[i] / maxValue) * height;
        const x = i * barWidth;
        ctx.lineTo(x, height - barHeight);
      }

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    }

    // Draw clipping indicators
    const shadowThreshold = 10; // Left side
    const highlightThreshold = bins - 10; // Right side

    // Shadow clipping indicator (left)
    if (histogram.shadows_pct && histogram.shadows_pct > 1) {
      ctx.fillStyle = "rgba(0, 100, 255, 0.3)";
      ctx.fillRect(0, 0, barWidth * shadowThreshold, height);
    }

    // Highlight clipping indicator (right)
    if (histogram.highlights_pct && histogram.highlights_pct > 1) {
      ctx.fillStyle = "rgba(255, 100, 0, 0.3)";
      ctx.fillRect(width - barWidth * (bins - highlightThreshold), 0, barWidth * (bins - highlightThreshold), height);
    }
  }, [histogram, mode]);

  // Redraw when mode changes or data changes
  useEffect(() => {
    drawHistogram();
  }, [drawHistogram]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
      drawHistogram();
    });

    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [drawHistogram]);

  const toggleMode = () => {
    setMode((m) => (m === "rgb" ? "luma" : "rgb"));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Histogram
        </span>
        <Button
          size="sm"
          variant="light"
          className="h-6 min-w-0 px-2 text-xs"
          onClick={toggleMode}
        >
          {mode === "rgb" ? "RGB" : "Luma"}
        </Button>
      </div>
      <div className="relative h-16 w-40 overflow-hidden rounded-md">
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ width: "100%", height: "100%" }}
          aria-label={`${mode === "rgb" ? "RGB" : "Luminance"} histogram`}
        />
      </div>
      {/* Clipping info */}
      <div className="flex justify-between text-xs text-zinc-400">
        {histogram.shadows_pct !== null && histogram.shadows_pct > 0 && (
          <span className="text-blue-400">
            Shadows: {histogram.shadows_pct.toFixed(1)}%
          </span>
        )}
        {histogram.highlights_pct !== null && histogram.highlights_pct > 0 && (
          <span className="text-orange-400">
            Highlights: {histogram.highlights_pct.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}





