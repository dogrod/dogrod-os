"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/react";

export function GalleryHeader() {
  const pathname = usePathname();
  const router = useRouter();

  // Detect if we're on a detail page (has photoId in path)
  const isDetailPage = pathname !== "/gallery" && pathname.startsWith("/gallery/");

  const handleLogoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/gallery");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-16 bg-zinc-50 min-[1800px]:bg-transparent dark:bg-zinc-950 dark:min-[1800px]:bg-transparent">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left: Logo/Title */}
        <Link
          href="/gallery"
          onClick={handleLogoClick}
          className="flex items-center gap-3 text-xl font-semibold tracking-tight text-zinc-900 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
        >
          <span className="text-zinc-400 dark:text-zinc-500">dogrodOS</span>
          <span className="text-zinc-300 dark:text-zinc-600">|</span>
          <span>Gallery</span>
        </Link>

        {/* Right: Close button on detail page */}
        <div className="flex items-center">
          {isDetailPage && (
            <Button
              isIconOnly
              variant="light"
              size="md"
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              onPress={handleClose}
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
