import type { Metadata } from "next";
import { getAllBlogPosts, groupPostsByTranslation } from "@/lib/blog";
import { PostCard } from "./_components/PostCard";

export const metadata: Metadata = {
  title: "Blog | dogrodOS",
  description: "Stories, notes, and ideas from Brian",
};

export default async function BlogPage() {
  // Fetch all posts and group by translation
  const posts = await getAllBlogPosts();
  const postGroups = groupPostsByTranslation(posts);

  // Show placeholder if no posts
  if (postGroups.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <h1 className="mb-8 text-4xl font-semibold tracking-tight text-zinc-900">
            Brian&apos;s blog is still booting up.
          </h1>
          <p className="mb-24 text-xl leading-relaxed text-zinc-600">
            The stories, notes, and half-baked ideas are on the way, just not
            ready to ship yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[680px] px-6 py-12">
      {/* Page Title */}
      <header className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Blog
        </h1>
        <p className="mt-2 text-zinc-600">
          Stories, notes, and ideas from Brian
        </p>
      </header>

      {/* Post List - Grouped by translation, deduplicated */}
      <div className="divide-y divide-zinc-100">
        {postGroups.map((group) => (
          <PostCard key={group.post.id} group={group} />
        ))}
      </div>
    </div>
  );
}
