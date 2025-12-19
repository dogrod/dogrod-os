import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Post,
  PostWithCover,
  PostWithDetails,
  BlogPostsResponse,
  PhotoWithExif,
  TranslationSibling,
  Language,
} from "./types";
import type { Asset, PhotoExif } from "@/lib/gallery/types";

const DEFAULT_PAGE_SIZE = 20;

/**
 * Base query conditions for public published posts
 */
const PUBLIC_POST_CONDITIONS = {
  status: "published" as const,
  visibility: "public" as const,
};

// Raw response type from Supabase (assets may be object or array depending on query)
interface RawPostResponse extends Omit<Post, "assets"> {
  assets: Asset | Asset[] | null;
}

/**
 * Transform raw Supabase response to normalized PostWithCover
 */
function normalizePost(raw: RawPostResponse): PostWithCover {
  return {
    ...raw,
    assets: Array.isArray(raw.assets) ? raw.assets[0] || null : raw.assets,
  };
}

/**
 * Fetch published posts for the blog index page
 * Returns ALL posts with their cover assets (for client-side grouping by translation)
 */
export async function getBlogPosts(
  cursor?: string,
  limit: number = DEFAULT_PAGE_SIZE
): Promise<BlogPostsResponse> {
  const supabase = await createSupabaseServerClient();

  // Build the query - include language and translation_group_id
  let query = supabase
    .from("posts")
    .select(
      `
      id, title, slug, excerpt, published_at, created_at, updated_at,
      status, visibility, cover_asset_id, gallery_photo_id, content,
      language, translation_group_id,
      assets:cover_asset_id (
        id,
        blurhash,
        dominant_color,
        asset_rendition (
          url,
          variant_name,
          width,
          height
        )
      )
    `
    )
    .eq("status", PUBLIC_POST_CONDITIONS.status)
    .eq("visibility", PUBLIC_POST_CONDITIONS.visibility)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(limit + 1); // Fetch one extra to determine if there are more

  // Apply cursor-based pagination
  if (cursor) {
    query = query.lt("published_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching blog posts:", error);
    throw new Error("Failed to fetch blog posts");
  }

  // Normalize the response - Supabase may return assets as array
  const posts = (data || []).map((raw) =>
    normalizePost(raw as unknown as RawPostResponse)
  );

  // Check if there are more posts
  const hasMore = posts.length > limit;
  const postsToReturn = hasMore ? posts.slice(0, limit) : posts;

  // Determine next cursor
  const lastPost = postsToReturn[postsToReturn.length - 1];
  const nextCursor = hasMore && lastPost ? lastPost.published_at : null;

  return {
    posts: postsToReturn,
    nextCursor,
    hasMore,
  };
}

/**
 * Fetch ALL published posts (no pagination) for grouping
 * Used when we need complete translation groups
 */
export async function getAllBlogPosts(): Promise<PostWithCover[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id, title, slug, excerpt, published_at, created_at, updated_at,
      status, visibility, cover_asset_id, gallery_photo_id, content,
      language, translation_group_id,
      assets:cover_asset_id (
        id,
        blurhash,
        dominant_color,
        asset_rendition (
          url,
          variant_name,
          width,
          height
        )
      )
    `
    )
    .eq("status", PUBLIC_POST_CONDITIONS.status)
    .eq("visibility", PUBLIC_POST_CONDITIONS.visibility)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching all blog posts:", error);
    throw new Error("Failed to fetch blog posts");
  }

  return (data || []).map((raw) =>
    normalizePost(raw as unknown as RawPostResponse)
  );
}

/**
 * Fetch sibling translations for a post
 */
async function fetchSiblingTranslations(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  postId: string,
  translationGroupId: string | null
): Promise<TranslationSibling[]> {
  if (!translationGroupId) return [];

  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, language")
    .eq("translation_group_id", translationGroupId)
    .eq("status", PUBLIC_POST_CONDITIONS.status)
    .eq("visibility", PUBLIC_POST_CONDITIONS.visibility)
    .neq("id", postId);

  if (error) {
    console.error("Error fetching sibling translations:", error);
    return [];
  }

  return (data || []).map((sibling) => ({
    id: sibling.id,
    slug: sibling.slug,
    title: sibling.title,
    language: sibling.language as Language,
  }));
}

/**
 * Fetch a single post by slug with all details
 */
export async function getPostBySlug(
  slug: string
): Promise<PostWithDetails | null> {
  const supabase = await createSupabaseServerClient();

  // Fetch the post with cover asset
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select(
      `
      *,
      assets:cover_asset_id (
        id,
        blurhash,
        dominant_color,
        asset_rendition (
          url,
          variant_name,
          width,
          height
        )
      )
    `
    )
    .eq("slug", slug)
    .eq("status", PUBLIC_POST_CONDITIONS.status)
    .eq("visibility", PUBLIC_POST_CONDITIONS.visibility)
    .single();

  if (postError) {
    if (postError.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("Error fetching post:", postError);
    throw new Error("Failed to fetch post");
  }

  if (!post) return null;

  // Transform the response - normalize assets which may be array or object
  const rawAssets = (post as { assets?: Asset | Asset[] | null }).assets;
  const normalizedAssets = Array.isArray(rawAssets)
    ? rawAssets[0] || null
    : rawAssets || null;
  const postData = { ...post, assets: normalizedAssets } as Post & {
    assets: Asset | null;
  };

  // Fetch sibling translations
  const siblings = await fetchSiblingTranslations(
    supabase,
    postData.id,
    postData.translation_group_id
  );

  // If there's a gallery_photo_id, fetch the photo with EXIF data
  let photoWithExif: PhotoWithExif | null = null;

  if (postData.gallery_photo_id) {
    const { data: photoData, error: photoError } = await supabase
      .from("photos")
      .select(
        `
        id,
        photo_exif (*)
      `
      )
      .eq("id", postData.gallery_photo_id)
      .single();

    if (!photoError && photoData) {
      const exifData = photoData.photo_exif;
      photoWithExif = {
        id: photoData.id,
        photo_exif: Array.isArray(exifData)
          ? exifData[0] || null
          : (exifData as PhotoExif | null),
      };
    }
  }

  return {
    ...postData,
    assets: postData.assets || null,
    photos: photoWithExif,
    siblings,
  };
}

/**
 * Get all post slugs for static generation
 */
export async function getAllPostSlugs(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("posts")
    .select("slug")
    .eq("status", PUBLIC_POST_CONDITIONS.status)
    .eq("visibility", PUBLIC_POST_CONDITIONS.visibility);

  if (error) {
    console.error("Error fetching post slugs:", error);
    return [];
  }

  return (data || []).map((post) => post.slug);
}
