import type { Metadata } from "next";
import { GalleryLink } from "./_components/GalleryLink";

export const metadata: Metadata = {
  title: "Blog | dogrodOS",
  description: "Brian's blog - Coming soon",
};

export default function BlogPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        {/* Title */}
        <h1 className="mb-8 text-4xl font-semibold tracking-tight text-zinc-900">
          Brian&apos;s blog is still booting up.
        </h1>

        {/* Body */}
        <p className="mb-24 text-xl leading-relaxed text-zinc-600">
          The stories, notes, and half-baked ideas are on the way, just not
          ready to ship yet.
        </p>

        {/* Footer */}
        <p className="max-w-2xl text-base leading-relaxed text-zinc-400">
          You can go write some code, take a walk, fix that one bug you have
          been ignoring, or <GalleryLink />.
        </p>
      </div>
    </div>
  );
}
