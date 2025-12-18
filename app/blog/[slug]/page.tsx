import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getAssetRenditionUrl } from "@/lib/blog";
import { PostHero } from "../_components/PostHero";
import { PostContent } from "../_components/PostContent";

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
  const description = post.excerpt || "A blog post from Brian";

  return {
    title,
    description,
    openGraph: {
      title: post.title,
      description,
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

  return (
    <div className="py-12">
      {/* Hero Section */}
      <PostHero post={post} />

      {/* Content */}
      {post.content && <PostContent content={post.content} />}

      {/* Footer */}
      <footer className="mx-auto max-w-[680px] px-6 mt-16 pt-8 border-t border-zinc-200">
        <p className="text-sm text-zinc-500">
          Thanks for reading. Published on{" "}
          {post.published_at
            ? new Date(post.published_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Unknown date"}
          .
        </p>
      </footer>
    </div>
  );
}
