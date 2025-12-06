"use client";

import { useEffect, useRef, useState } from "react";
import { decode } from "blurhash";
import Image from "next/image";

interface BlurhashImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurhash?: string | null;
  className?: string;
  priority?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onClick?: () => void;
  /** Object fit mode for the image. Defaults to "cover" */
  objectFit?: "cover" | "contain";
}

/**
 * Image component with blurhash placeholder
 * Shows a blurry preview while the actual image loads
 */
export function BlurhashImage({
  src,
  alt,
  width,
  height,
  blurhash,
  className = "",
  priority = false,
  sizes,
  onLoad,
  onClick,
  objectFit = "cover",
}: BlurhashImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [blurhashDataUrl, setBlurhashDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Decode blurhash to data URL
  useEffect(() => {
    if (!blurhash) return;

    try {
      // Use a small canvas size for the blurhash (it's just a placeholder)
      const blurWidth = 32;
      const blurHeight = Math.round((32 * height) / width);

      const pixels = decode(blurhash, blurWidth, blurHeight);

      // Create a canvas to render the blurhash
      const canvas = document.createElement("canvas");
      canvas.width = blurWidth;
      canvas.height = blurHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        const imageData = ctx.createImageData(blurWidth, blurHeight);
        imageData.data.set(pixels);
        ctx.putImageData(imageData, 0, 0);
        setBlurhashDataUrl(canvas.toDataURL());
      }
    } catch (e) {
      console.warn("Failed to decode blurhash:", e);
    }
  }, [blurhash, width, height]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const isContain = objectFit === "contain";

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={isContain ? undefined : { aspectRatio: `${width} / ${height}` }}
      onClick={onClick}
    >
      {/* Blurhash placeholder */}
      {blurhashDataUrl && !isLoaded && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${blurhashDataUrl})`,
            backgroundSize: isContain ? "contain" : "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "blur(20px)",
            transform: "scale(1.1)",
          }}
        />
      )}

      {/* Fallback gradient if no blurhash */}
      {!blurhashDataUrl && !isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800" />
      )}

      {/* Actual image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`relative z-10 h-full w-full transition-opacity duration-300 ${
          isContain ? "object-contain" : "object-cover"
        } ${isLoaded ? "opacity-100" : "opacity-0"}`}
        priority={priority}
        sizes={sizes}
        onLoad={handleLoad}
      />
    </div>
  );
}





