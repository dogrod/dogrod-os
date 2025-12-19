import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tag, TagWithContent, TagInfo } from "./types";
import type { PostWithCover } from "@/lib/blog/types";
import type { PhotoWithRenditions, Asset } from "@/lib/gallery/types";

/**
 * Fetch a tag by slug with all related content
 */
export async function getTagBySlug(slug: string): Promise<TagWithContent | null> {
  const supabase = await createSupabaseServerClient();

  // Fetch tag details
  const { data: tag, error: tagError } = await supabase
    .from("tags")
    .select("*")
    .eq("slug", slug)
    .single();

  if (tagError) {
    if (tagError.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching tag:", tagError);
    throw new Error("Failed to fetch tag");
  }

  if (!tag) return null;

  // Fetch posts with this tag
  const { data: postTagData } = await supabase
    .from("post_tag")
    .select(`
      post_id,
      posts:post_id (
        id, title, slug, excerpt, published_at, created_at, updated_at,
        status, visibility, cover_asset_id, gallery_photo_id, content,
        language, translation_group_id,
        assets:cover_asset_id (
          id, blurhash, dominant_color,
          asset_rendition (url, variant_name, width, height)
        )
      )
    `)
    .eq("tag_id", tag.id);

  // Fetch photos with this tag
  const { data: photoTagData } = await supabase
    .from("photo_tag")
    .select(`
      photo_id,
      photos:photo_id (
        *,
        assets:asset_original_id (
          id, blurhash, dominant_color,
          asset_rendition (*)
        )
      )
    `)
    .eq("tag_id", tag.id);

  // Transform posts data
  const posts: PostWithCover[] = (postTagData || [])
    .map((item) => {
      const post = item.posts as unknown as PostWithCover & { assets: Asset | Asset[] | null };
      if (!post || post.status !== "published" || post.visibility !== "public") {
        return null;
      }
      return {
        ...post,
        assets: Array.isArray(post.assets) ? post.assets[0] || null : post.assets,
      };
    })
    .filter((p): p is PostWithCover => p !== null)
    .sort((a, b) => {
      const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
      const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
      return dateB - dateA;
    });

  // Transform photos data
  const photos: PhotoWithRenditions[] = (photoTagData || [])
    .map((item) => {
      const photo = item.photos as unknown as PhotoWithRenditions & { assets: Asset | Asset[] | null };
      if (!photo || photo.status !== "published" || photo.visibility !== "public") {
        return null;
      }
      return {
        ...photo,
        assets: Array.isArray(photo.assets) ? photo.assets[0] || null : photo.assets,
      };
    })
    .filter((p): p is PhotoWithRenditions => p !== null)
    .sort((a, b) => {
      const dateA = a.captured_at ? new Date(a.captured_at).getTime() : 0;
      const dateB = b.captured_at ? new Date(b.captured_at).getTime() : 0;
      return dateB - dateA;
    });

  return {
    ...tag,
    posts,
    photos,
  };
}

/**
 * Fetch tags for a post by post ID
 */
export async function getTagsForPost(postId: string): Promise<TagInfo[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("post_tag")
    .select(`
      tags:tag_id (
        id, name, slug, color
      )
    `)
    .eq("post_id", postId);

  if (error) {
    console.error("Error fetching tags for post:", error);
    return [];
  }

  return (data || [])
    .map((item) => item.tags as unknown as TagInfo)
    .filter((tag): tag is TagInfo => tag !== null);
}

/**
 * Fetch all tags
 */
export async function getAllTags(): Promise<Tag[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching tags:", error);
    return [];
  }

  return data || [];
}
