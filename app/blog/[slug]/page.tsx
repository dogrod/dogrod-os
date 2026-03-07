import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getAssetRenditionUrl } from "@/lib/blog";
import { PostHero } from "../_components/PostHero";
import { PostContent } from "../_components/PostContent";
import { TagList } from "@/components/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate dynamic metadata for SEO and social sharing
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | dogrodOS",
    };
  }

  // Get OG image URL - prefer og_card variant, fallback to large
  const ogImageUrl = getAssetRenditionUrl(
    post.assets?.asset_rendition,
    "og_card",
    "large"
  );

  const title = `${post.title} | dogrodOS`;
  // Use excerpt or generate contextual fallback; truncate to 200 chars for X compliance
  const rawDescription = post.excerpt || `Read "${post.title}" on dogrodOS`;
  const description = rawDescription.length > 200 
    ? rawDescription.slice(0, 197) + "..." 
    : rawDescription;
  const canonicalUrl = `/blog/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description,
      url: canonicalUrl,
      type: "article",
      publishedTime: post.published_at || undefined,
      authors: ["Brian"],
      images: ogImageUrl
        ? [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const hasTags = post.tags && post.tags.length > 0;

  return (
    <div className="py-8 sm:py-12">
      {/* Single centered container for perfect edge alignment */}
      <div className="mx-auto max-w-[680px] px-4 sm:px-6">
        {/* Hero Section (Image → EXIF → Title → Excerpt → Meta) */}
        <PostHero post={post} />

        {/* Main Content */}
        {post.content && <PostContent content={post.content} />}

        {/* Topics Section (Tag Pills) */}
        {hasTags && (
          <section className="mt-12 pt-8 border-t border-zinc-100">
            <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-4">
              Topics
            </h2>
            <TagList tags={post.tags} variant="pills" />
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-zinc-200">
          <p className="text-sm text-zinc-400">
            Thanks for reading.
          </p>
        </footer>
      </div>
    </div>
  );
}
