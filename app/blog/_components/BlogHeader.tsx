"use client";

import Link from "next/link";

export function BlogHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-16 bg-white">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left: Logo/Title */}
        <Link
          href="/blog"
          className="flex items-center gap-3 text-xl font-semibold tracking-tight text-zinc-900 transition-colors hover:text-zinc-600"
        >
          <span className="text-zinc-400">dogrodOS</span>
          <span className="text-zinc-300">|</span>
          <span>Blog</span>
        </Link>
      </div>
    </header>
  );
}
