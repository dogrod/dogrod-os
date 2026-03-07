"use client";

import Link from "next/link";
import { Tooltip } from "@heroui/react";
import { Camera, Aperture, ArrowUpRight } from "lucide-react";
import type { PhotoWithExif } from "@/lib/blog/types";

interface ExifOverlayProps {
  photo: PhotoWithExif | null;
}

/**
 * Ghost EXIF overlay that appears on hover over the cover image
 * Shows camera/lens info in a tooltip with a link to the gallery
 */
export function ExifOverlay({ photo }: ExifOverlayProps) {
  // Don't render if no photo or EXIF data
  if (!photo?.photo_exif) {
    return null;
  }

  const exif = photo.photo_exif;

  // Build camera string
  const getCameraString = () => {
    if (!exif.camera_model && !exif.camera_make) return null;
    
    let model = exif.camera_model || "";
    // Remove make from model if duplicated
    if (exif.camera_make && model.toLowerCase().startsWith(exif.camera_make.toLowerCase())) {
      model = model.slice(exif.camera_make.length).trim();
    }
    
    return exif.camera_make ? `${exif.camera_make} ${model}`.trim() : model;
  };

  // Build lens string (clean up camera info if present)
  const getLensString = () => {
    if (!exif.lens_model) return null;
    
    let lens = exif.lens_model;
    if (exif.camera_make) {
      lens = lens.replace(new RegExp(exif.camera_make, "gi"), "").trim();
    }
    if (exif.camera_model) {
      lens = lens.replace(new RegExp(exif.camera_model, "gi"), "").trim();
    }
    // Clean up any leading/trailing separators
    lens = lens.replace(/^[\s·\-]+|[\s·\-]+$/g, "").trim();
    
    return lens || null;
  };

  const cameraString = getCameraString();
  const lensString = getLensString();

  // Don't render if no useful EXIF data
  if (!cameraString && !lensString) {
    return null;
  }

  const tooltipContent = (
    <div className="p-3 min-w-[200px]">
      {/* Camera Row */}
      {cameraString && (
        <div className="flex items-center gap-2 text-xs text-zinc-300">
          <Camera className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
          <span>{cameraString}</span>
        </div>
      )}

      {/* Lens Row */}
      {lensString && (
        <div className="flex items-center gap-2 text-xs text-zinc-300 mt-1.5">
          <Aperture className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
          <span>{lensString}</span>
        </div>
      )}

      {/* Separator */}
      <div className="border-t border-zinc-700 my-2" />

      {/* Gallery Link */}
      <Link
        href={`/gallery/${photo.id}`}
        target="_blank"
        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
      >
        <span>View in Gallery</span>
        <ArrowUpRight className="w-3 h-3" />
      </Link>
    </div>
  );

  return (
    <Tooltip
      content={tooltipContent}
      placement="top-end"
      delay={0}
      closeDelay={100}
      classNames={{
        content: "bg-zinc-900/95 backdrop-blur-sm rounded-lg shadow-lg p-0",
      }}
    >
      <button
        type="button"
        className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 backdrop-blur-sm p-1.5 rounded-full hover:bg-black/50"
        aria-label="View camera info"
      >
        <Camera className="w-4 h-4 text-white/80" />
      </button>
    </Tooltip>
  );
}
