import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTagBySlug } from "@/lib/tags";
import { getRenditionUrl } from "@/lib/gallery/types";
import { BlurhashImage } from "@/app/gallery/_components/BlurhashImage";
import { PostCard } from "@/app/blog/_components/PostCard";
import { groupPostsByTranslation } from "@/lib/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate dynamic metadata for the tag page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag) {
    return {
      title: "Tag Not Found | dogrodOS",
    };
  }

  const title = `#${tag.name} | dogrodOS`;
  const description = tag.description || `Content tagged with ${tag.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag) {
    notFound();
  }

  const { posts, photos } = tag;
  const hasPhotos = photos.length > 0;
  const hasPosts = posts.length > 0;

  // Group posts by translation for display
  const postGroups = groupPostsByTranslation(posts);

  // Stats
  const articleCount = postGroups.length;
  const photoCount = photos.length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] h-16 bg-white border-b border-zinc-100">
        <div className="flex h-full items-center justify-between px-6">
          <Link
            href="/"
            className="text-lg font-bold text-zinc-900 hover:opacity-70 transition-opacity"
          >
            dogrodOS
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section - Monochrome style */}
        <section className="py-16 px-6">
          <div className="mx-auto max-w-[680px]">
            {/* Tag Name - Monochrome */}
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight text-zinc-900">
              # {tag.name}
            </h1>

            {/* Description */}
            {tag.description && (
              <p className="mt-4 text-lg text-zinc-600 leading-relaxed">
                {tag.description}
              </p>
            )}

            {/* Stats */}
            <p className="mt-6 text-sm text-zinc-400">
              {articleCount > 0 && (
                <span>
                  {articleCount} {articleCount === 1 ? "Article" : "Articles"}
                </span>
              )}
              {articleCount > 0 && photoCount > 0 && <span> · </span>}
              {photoCount > 0 && (
                <span>
                  {photoCount} {photoCount === 1 ? "Photo" : "Photos"}
                </span>
              )}
            </p>
          </div>
        </section>

        {/* Photos Section */}
        {hasPhotos && (
          <section className="py-12 px-6 border-t border-zinc-100">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-6">
                Photos
              </h2>

              {/* Horizontal scroll strip */}
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                {photos.slice(0, 12).map((photo) => {
                  const thumbUrl = getRenditionUrl(
                    photo.assets?.asset_rendition,
                    "thumb",
                    "list"
                  );
                  const blurhash = photo.assets?.blurhash;

                  if (!thumbUrl) return null;

                  return (
                    <Link
                      key={photo.id}
                      href={`/gallery/${photo.id}`}
                      className="flex-shrink-0 group"
                    >
                      <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-lg overflow-hidden bg-zinc-100">
                        <BlurhashImage
                          src={thumbUrl}
                          alt={photo.title || "Photo"}
                          width={192}
                          height={192}
                          blurhash={blurhash}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="192px"
                        />
                      </div>
                    </Link>
                  );
                })}

                {/* View all link if more than 12 */}
                {photos.length > 12 && (
                  <Link
                    href="/gallery"
                    className="flex-shrink-0 w-40 h-40 sm:w-48 sm:h-48 rounded-lg bg-zinc-50 flex items-center justify-center text-sm text-zinc-500 hover:bg-zinc-100 transition-colors"
                  >
                    View all →
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Articles Section */}
        {hasPosts && (
          <section className="py-12 px-6 border-t border-zinc-100">
            <div className="mx-auto max-w-[680px]">
              <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-6">
                Articles
              </h2>

              {/* Post List */}
              <div className="divide-y divide-zinc-100">
                {postGroups.map((group) => (
                  <PostCard key={group.post.id} group={group} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {!hasPhotos && !hasPosts && (
          <section className="py-24 px-6 text-center">
            <p className="text-zinc-500">
              No content tagged with #{tag.name} yet.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
