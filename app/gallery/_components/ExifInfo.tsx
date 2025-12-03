"use client";

import type { PhotoExif } from "@/lib/gallery/types";
import {
  formatShutterSpeed,
  formatAperture,
  formatISO,
  formatFocalLength,
  formatDevice,
} from "@/lib/gallery/utils";

interface ExifInfoProps {
  exif: PhotoExif;
}

/**
 * EXIF information display for photo detail page
 * Shows camera, lens, ISO, focal length, aperture, and shutter speed
 */
export function ExifInfo({ exif }: ExifInfoProps) {
  const device = formatDevice(exif.camera_make, exif.camera_model, exif.lens_model);
  const iso = formatISO(exif.iso);
  const focalLength = formatFocalLength(exif.focal_length_mm);
  const aperture = formatAperture(exif.aperture);
  const shutter = formatShutterSpeed(exif.shutter_s);

  // Collect all non-null values
  const parts: string[] = [];
  if (device) parts.push(device);
  if (iso) parts.push(iso);
  if (focalLength) parts.push(focalLength);
  if (aperture) parts.push(aperture);
  if (shutter) parts.push(shutter);

  if (parts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
      {parts.map((part, index) => (
        <span key={index} className="flex items-center">
          <span className="whitespace-nowrap">{part}</span>
          {index < parts.length - 1 && (
            <span className="ml-2 text-zinc-300 dark:text-zinc-600">·</span>
          )}
        </span>
      ))}
    </div>
  );
}

