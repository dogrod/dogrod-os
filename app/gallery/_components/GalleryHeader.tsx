"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export function GalleryHeader() {
  const pathname = usePathname();
  const router = useRouter();

  // Detect if we're on a detail page (has photoId in path)
  const isDetailPage = pathname !== "/gallery" && pathname.startsWith("/gallery/");

  const handleLogoClick = (e: React.MouseEvent) => {
    if (isDetailPage) {
      // On detail page, navigate back to gallery list
      e.preventDefault();
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/gallery");
      }
    }
    // On list page, do nothing (keeps state)
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between px-4">
        {/* Left: Logo/Title */}
        <Link
          href="/gallery"
          onClick={handleLogoClick}
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
        >
          <span className="text-zinc-400 dark:text-zinc-500">dogrodOS</span>
          <span className="text-zinc-300 dark:text-zinc-600">|</span>
          <span>Gallery</span>
        </Link>

        {/* Right: Reserved space for future module switcher */}
        <div className="flex items-center gap-2">
          {/* Placeholder for future controls */}
        </div>
      </div>
    </header>
  );
}

