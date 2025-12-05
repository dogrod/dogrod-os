"use client";

import type { PhotoWithDetails } from "@/lib/gallery/types";
import { formatPhotoDate, getLocationString } from "@/lib/gallery/types";
import { formatDevice } from "@/lib/gallery/utils";

interface PhotoMetaInfoProps {
  photo: PhotoWithDetails;
}

/**
 * First row of photo detail info: date, location, device with icons
 * Items are separated by centered dots
 */
export function PhotoMetaInfo({ photo }: PhotoMetaInfoProps) {
  const dateString = formatPhotoDate(photo);
  const locationString = getLocationString(photo);
  const deviceString = photo.exif
    ? formatDevice(
        photo.exif.camera_make,
        photo.exif.camera_model,
        photo.exif.lens_model
      )
    : null;

  const items: { icon: React.ReactNode; text: string }[] = [];

  // Calendar icon + date
  if (dateString) {
    items.push({
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      text: dateString,
    });
  }

  // Location pin icon + location
  if (locationString) {
    items.push({
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      text: locationString,
    });
  }

  // Camera icon + device
  if (deviceString) {
    items.push({
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      ),
      text: deviceString,
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          <span className="flex items-center gap-1.5">
            {item.icon}
            <span className="whitespace-nowrap">{item.text}</span>
          </span>
          {index < items.length - 1 && (
            <span className="px-2 text-zinc-300 dark:text-zinc-600">·</span>
          )}
        </span>
      ))}
    </div>
  );
}

