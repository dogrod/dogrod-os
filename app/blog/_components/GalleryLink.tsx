"use client";

import Link from "next/link";

const SCROLL_POSITION_KEY = "gallery-scroll-position";
const PHOTOS_STATE_KEY = "gallery-photos-state";

export function GalleryLink() {
  const handleClick = () => {
    // Clear saved scroll position so gallery starts from top
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(SCROLL_POSITION_KEY);
      sessionStorage.removeItem(PHOTOS_STATE_KEY);
    }
  };

  return (
    <Link
      href="/gallery"
      onClick={handleClick}
      className="text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-900"
    >
      check out amazing photos captured by Brian
    </Link>
  );
}
