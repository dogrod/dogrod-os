"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { usePhotoContext } from "./PhotoContext";
import { trackPhotoDownload } from "@/lib/analytics";
import { BrandNav } from "@/components/nav";

export function GalleryHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { photoId, downloadUrl } = usePhotoContext();

  // Detect if we're on a detail page (has photoId in path)
  const isDetailPage = pathname !== "/gallery" && pathname.startsWith("/gallery/");

  const handleClose = () => {
    router.push("/gallery");
  };

  const handleDownload = async () => {
    if (!downloadUrl || !photoId) return;

    // Track download event
    trackPhotoDownload({ photo_id: photoId });

    // Fetch image and trigger download
    try {
      const response = await fetch(downloadUrl, { mode: "cors" });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `photo-${photoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab
      window.open(downloadUrl, "_blank");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-16 bg-zinc-50 min-[1800px]:bg-transparent dark:bg-zinc-950 dark:min-[1800px]:bg-transparent">
      <div className="flex h-full items-center justify-between px-6">
        {/* Breadcrumb Brand Navigation */}
        <BrandNav moduleName="Gallery" moduleHref="/gallery" />

        {/* Right: Download & Close buttons on detail page */}
        <div className="flex items-center gap-1">
          {isDetailPage && downloadUrl && (
            <Button
              isIconOnly
              variant="light"
              size="md"
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              onPress={handleDownload}
              aria-label="Download"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </Button>
          )}
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
