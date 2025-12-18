# Blog Frontend MVP - Reading Experience

**Date:** December 18, 2025

This changelog documents the implementation of the Blog Reading Experience MVP, following Medium-style minimalist design principles.

---

## Overview

The Blog module provides:
- **Blog Index** (`/blog`): Lists published posts with thumbnails, dates, and excerpts
- **Blog Detail** (`/blog/[slug]`): Full article view with hero image, metadata, and markdown content

---

## SEO Strategy

### Dynamic Metadata Generation

The blog detail page uses Next.js `generateMetadata` function to create dynamic OpenGraph and Twitter metadata:

| Post Field | Meta Tag |
|------------|----------|
| `title` | `og:title`, `twitter:title` |
| `excerpt` | `og:description`, `twitter:description` |
| `cover_asset_id` → `asset_rendition` (variant: `og_card` or `large`) | `og:image`, `twitter:image` |

### Implementation Pattern

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(slug);
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: ogImageUrl }],
      type: 'article',
      publishedTime: post.published_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImageUrl],
    },
  };
}
```

---

## Design Tokens

### Typography

| Element | Font Family | Weight | Size |
|---------|-------------|--------|------|
| Article Body | Lora (Serif) | 400 | 18px (base) |
| Headings (h1-h6) | Geist Sans (System) | 600-700 | Variable |
| UI Elements | Geist Sans (System) | 400-600 | Variable |
| Code | Geist Mono | 400 | 14px |

**Rationale:** High-legibility Serif fonts (Lora) improve reading comprehension for long-form content while Sans-Serif headings maintain consistency with the OS aesthetic.

### Layout Constraints

| Property | Value | Purpose |
|----------|-------|---------|
| Content Max-Width | 680px | Optimal reading line length (60-75 characters) |
| Container Padding | 24px | Consistent with gallery grid |
| Paragraph Line-Height | 1.75 | Enhanced readability |
| Paragraph Spacing | 1.5rem | Clear content separation |

### Color Palette

| Element | Light Mode |
|---------|------------|
| Body Text | `zinc-800` |
| Headings | `zinc-900` |
| Meta Text | `zinc-500` |
| Links | `zinc-900` with underline |
| Dividers | `zinc-200` |

---

## Integration Details

### Blurhash Implementation

All images use the `BlurhashImage` component from the gallery module:

1. **Cover Image in List**: Thumbnail with blurhash placeholder
2. **Hero Image in Detail**: Full-width cover with blurhash placeholder
3. **Images in Markdown**: Standard `<img>` tags (future: custom MDX component)

**Data Flow:**
```
posts.cover_asset_id → assets.blurhash → BlurhashImage component
                     → asset_rendition.url (variant) → Image src
```

### Asset Rendition Variants Used

| Context | Variant | Fallback |
|---------|---------|----------|
| List Thumbnail | `thumb` | `list` |
| Hero Image | `large` | `xl` |
| OG Image | `og_card` | `large` |

### Gallery Photo Integration (Dual-Track Hero)

When `gallery_photo_id` is present on a post:

1. Fetch associated `photo` and `photo_exif` data
2. Display "Shot on [Camera] [Lens]" info line below hero image
3. Provides context for photography-focused blog posts

---

## Files Created/Modified

### New Files

| Path | Description |
|------|-------------|
| `lib/blog/types.ts` | Blog type definitions |
| `lib/blog/queries.ts` | Supabase queries for posts |
| `lib/blog/index.ts` | Module exports |
| `app/blog/[slug]/page.tsx` | Blog detail page with generateMetadata |
| `app/blog/_components/PostCard.tsx` | Post card for list view |
| `app/blog/_components/PostContent.tsx` | Markdown renderer with styles |
| `app/blog/_components/PostHero.tsx` | Hero section with cover image |

### Modified Files

| Path | Changes |
|------|---------|
| `app/layout.tsx` | Added Lora font configuration |
| `app/blog/page.tsx` | Replaced placeholder with post list |
| `app/blog/layout.tsx` | Updated metadata handling |

---

## Database Queries

### Index Query

```sql
SELECT 
  id, title, slug, excerpt, published_at,
  assets (
    id, blurhash,
    asset_rendition (url, variant_name)
  )
FROM posts
WHERE status = 'published' AND visibility = 'public'
ORDER BY published_at DESC
```

### Detail Query

```sql
SELECT 
  *,
  assets (
    id, blurhash, dominant_color,
    asset_rendition (url, variant_name, width, height)
  ),
  photos!gallery_photo_id (
    id,
    photo_exif (camera_make, camera_model, lens_model)
  )
FROM posts
WHERE slug = :slug AND status = 'published' AND visibility = 'public'
LIMIT 1
```

---

## Component Architecture

```
/blog
├── page.tsx (Index - server component)
├── layout.tsx (Shared layout with header)
├── [slug]/
│   └── page.tsx (Detail - server component with generateMetadata)
└── _components/
    ├── BlogHeader.tsx (Navigation header)
    ├── PostCard.tsx (List item card)
    ├── PostContent.tsx (Markdown renderer)
    └── PostHero.tsx (Hero section with camera info)
```

---

## Performance Considerations

1. **Server Components**: All pages are server-rendered for optimal TTFB
2. **Blurhash Placeholders**: Instant visual feedback during image load
3. **Font Display**: `font-display: swap` for faster text rendering
4. **Image Optimization**: Next.js Image component with appropriate sizes

---

## Future Enhancements

- [ ] MDX support for rich content
- [ ] Reading time estimation
- [ ] Related posts section
- [ ] Social share buttons
- [ ] Table of contents for long articles
- [ ] Dark mode support

