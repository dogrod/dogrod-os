# Changelog

All notable changes to dogrodOS are documented in this file.

---

## v1.0 — Blog Reading Experience

*A distraction-free, typography-first reading experience with the geek aesthetic.*

### Reading Experience (UX)

#### Medium-style Layout

The article page follows a strict vertical hierarchy designed for focused reading:

```
┌─────────────────────────────────┐
│        Cover Image              │  ← Full-width, height-constrained
│     [Ghost EXIF Overlay]        │  ← Hover to reveal
├─────────────────────────────────┤
│  Title                          │  ← Bold, Sans-serif (Geist)
│  Excerpt                        │  ← Italic, Serif (Lora), muted
│  Dec 18, 2024 · #Tag · 中文 ↗   │  ← Inline metadata row
├─────────────────────────────────┤
│  Article Body                   │  ← Serif (Lora), 680px max-width
│  ...                            │
├─────────────────────────────────┤
│  Topics: [Tag Pills]            │  ← Footer discovery
└─────────────────────────────────┘
```

All content is constrained to a **680px** reading column — the optimal line length for comfortable reading (60-75 characters per line).

#### Inline i18n Switcher

The language toggle was deliberately moved from a floating position into the **metadata row** as a simple text link:

```
December 18, 2024 · #System · Read in English ↗
```

**Design rationale:**
- Eliminates visual clutter from floating UI elements
- Treats translation as metadata, not a primary action
- Maintains the "single column of text" minimalist aesthetic
- Only appears when a translation actually exists

#### Distraction-free Visuals

- **Typography Split**: Serif font (Lora) for body text enhances readability; Sans-serif (Geist) for headings maintains the OS aesthetic
- **Monochrome Tags**: All tags use grayscale styling — dynamic colors were removed to preserve visual calm
- **Subtle Metadata**: Date, tags, and language links use muted grays that recede behind the content

---

### Visual Components

#### Ghost EXIF Overlay

Cover images linked to gallery photos now feature an **interactive camera icon** that appears on hover:

| State | Behavior |
|-------|----------|
| Default | Icon hidden (`opacity-0`) |
| Image Hover | Icon fades in at bottom-right (`group-hover:opacity-100`) |
| Icon Hover | Background darkens, tooltip appears |
| Tooltip | Camera model, lens info, "View in Gallery" link |

**Styling:**
```
bg-black/30 backdrop-blur-sm rounded-full
```

This replaces the old inline "Shot on..." caption text, keeping the image area clean while preserving the gear information for those who want it.

#### Breadcrumb Brand Navigation

The header now uses a **split navigation** pattern:

```
dogrodOS / Blog
    ↓        ↓
  [Home]  [Module]
```

- **dogrodOS**: Always links to `/` (global homepage) — users are never "trapped" in a module
- **Module Name**: Links to module homepage (e.g., `/blog`, `/gallery`)
- **Independent Hover States**: Each segment highlights separately for clear affordance
- **Separator**: Subtle gray `/` that visually connects without demanding attention

---

### Rendering Engine

#### Markdown Polish

The content renderer (`react-markdown` + `remark-gfm`) provides:

**Tables** — GitHub-flavored with clean styling:
```
┌──────────────────────────────────┐
│  Header  │  Header  │  Header   │  ← bg-zinc-50/50, border-b
├──────────────────────────────────┤
│  Cell    │  Cell    │  Cell     │  ← border-b border-zinc-100
└──────────────────────────────────┘
```

**Code Blocks** — Dark theme syntax highlighting:
- Theme: VS Code Dark Plus (`vscDarkPlus`)
- Rounded corners, proper overflow handling
- Inline code uses subtle gray background

**Blockquotes** — Editorial styling:
```
border-l-4 border-zinc-200 pl-4 italic text-zinc-600
```

**Typography Hierarchy**:
- Markdown `#` renders as `<h2>` (smaller than page title)
- Maintains visual hierarchy without competing with the article header

---

### Discovery

#### Tag Hub (`/tag/[slug]`)

A unified topic page that aggregates content from **both Blog and Gallery**:

```
┌─────────────────────────────────┐
│  # SystemDesign                 │  ← Tag name (monochrome)
│  Description text...            │
│  3 Articles · 12 Photos         │  ← Stats
├─────────────────────────────────┤
│  Photos                         │
│  [thumb] [thumb] [thumb] →      │  ← Horizontal scroll strip
├─────────────────────────────────┤
│  Articles                       │
│  ┌─────────────────────────┐    │
│  │ Post Card               │    │  ← Reused PostCard component
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

**Key decisions:**
- **Monochrome styling**: Tag colors removed for consistency with minimalist aesthetic
- **Photos first**: Visual content appears before text content
- **Horizontal scroll**: Compact photo display that doesn't overwhelm the page
- **Translation grouping**: Posts are deduplicated by translation group

---

### Technical Stack

| Feature | Implementation |
|---------|---------------|
| Typography | `next/font/google` → Lora (Serif), Geist (Sans) |
| Markdown | `react-markdown` + `remark-gfm` |
| Syntax Highlighting | `react-syntax-highlighter` (Prism, vscDarkPlus) |
| Tooltips | `@heroui/react` Tooltip component |
| Icons | `lucide-react` |
| Image Loading | Custom `BlurhashImage` with blur placeholders |

---

### File Structure

```
components/
├── blog/
│   ├── ExifOverlay.tsx      # Ghost camera overlay
│   └── TagList.tsx          # Inline & pill variants
├── nav/
│   └── BrandNav.tsx         # Breadcrumb navigation

app/
├── blog/
│   ├── [slug]/page.tsx      # Article detail with generateMetadata
│   └── _components/
│       ├── PostHero.tsx     # Cover + Title + Metadata
│       └── PostContent.tsx  # Markdown renderer
└── tag/
    └── [slug]/page.tsx      # Tag Hub aggregation
```

---

*Designed for readers who appreciate both beautiful typography and technical precision.*
