"use client";

import Link from "next/link";

interface BrandNavProps {
  /** Module name to display (e.g., "Blog", "Gallery") */
  moduleName?: string;
  /** Module homepage href (e.g., "/blog", "/gallery") */
  moduleHref?: string;
}

/**
 * Breadcrumb-style brand navigation
 * Format: dogrodOS / ModuleName
 * 
 * - Click "dogrodOS" → navigates to / (global homepage)
 * - Click "ModuleName" → navigates to module homepage
 * - Each segment highlights independently on hover
 */
export function BrandNav({ moduleName, moduleHref }: BrandNavProps) {
  return (
    <nav className="flex items-center text-lg tracking-tight select-none">
      {/* 1. Global Home Link */}
      <Link
        href="/"
        className="font-bold text-zinc-900 hover:opacity-70 transition-opacity"
      >
        dogrodOS
      </Link>

      {/* 2. Optional Module Link */}
      {moduleName && (
        <>
          <span className="mx-2 text-zinc-300 font-light">/</span>
          {moduleHref ? (
            <Link
              href={moduleHref}
              className="font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              {moduleName}
            </Link>
          ) : (
            // Fallback if no link (current page indicator)
            <span className="font-medium text-zinc-900">{moduleName}</span>
          )}
        </>
      )}
    </nav>
  );
}
