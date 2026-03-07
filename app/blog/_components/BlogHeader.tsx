"use client";

import { BrandNav } from "@/components/nav";

/**
 * Blog module header with breadcrumb navigation
 * dogrodOS / Blog
 */
export function BlogHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-16 bg-white">
      <div className="flex h-full items-center justify-between px-6">
        {/* Breadcrumb Brand Navigation */}
        <BrandNav moduleName="Blog" moduleHref="/blog" />
      </div>
    </header>
  );
}
