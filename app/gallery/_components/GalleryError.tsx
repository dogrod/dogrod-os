"use client";

import { Button } from "@heroui/react";
import Link from "next/link";

interface GalleryErrorProps {
  message?: string;
}

export function GalleryError({ message = "Failed to load gallery" }: GalleryErrorProps) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          {message}
        </h2>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          There was an error loading the photos. Please try again.
        </p>
        <Button
          as={Link}
          href="/gallery"
          className="mt-4"
          color="default"
          variant="flat"
        >
          Retry
        </Button>
      </div>
    </div>
  );
}





