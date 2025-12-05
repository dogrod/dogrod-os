# Gallery UI Polish - Unsplash Style

**Date:** December 5, 2025

This changelog documents the UI polish updates made to the Gallery module to achieve an Unsplash-style aesthetic.

---

## 1. Header Refactoring

### Files Changed
- `app/gallery/_components/GalleryHeader.tsx`
- `app/gallery/layout.tsx`

### Changes
- Reduced header height from `h-14` (56px) to `h-12` (48px)
- Removed background and border for a transparent, minimal look
- Removed `max-w-screen-2xl` constraint - logo now sits at absolute left edge
- Added conditional X close button (top-right) for detail pages only
- Close button uses HeroUI `Button` with `isIconOnly` and `onPress` handler
- Header uses `z-[100]` to ensure it stays above all other elements

---

## 2. Grid Container and Layout

### Files Changed
- `app/globals.css`
- `app/gallery/_components/GalleryListClient.tsx`
- `app/gallery/_components/PhotoGrid.tsx`

### Changes
- Added CSS variables:
  ```css
  --grid-width: 1296px;
  --grid-container-inline-padding: 24px;
  ```
- Grid container now centered with `max-width: calc(var(--grid-width) + 2 * var(--grid-container-inline-padding))`
- Reduced columns from 5-column max to 3-column max for larger images:
  - 1 column on mobile
  - 2 columns on `sm` (640px+)
  - 3 columns on `md` (768px+)
- Increased gap from `gap-4` to `gap-5`

---

## 3. Time Axis Redesign

### Files Changed
- `app/gallery/_components/TimeAxis.tsx`
- `app/gallery/_components/TimeAxisMobile.tsx`

### Changes
- **Years only display** - removed months, shows only years with photos
- **Horizontal line segments** as tick indicators:
  - Inactive: thin gray line (`h-px w-7`, `bg-zinc-300`)
  - Active: thicker black line (`h-1 w-10`, `bg-zinc-900`)
- **Dynamic positioning** - calculates left position based on grid width to align horizontally with the waterfall grid
- **Responsive hiding** - hidden below `lg` breakpoint and when insufficient horizontal space (<48px)
- **Vertically centered** in viewport (below header)
- Mobile time axis updated with softer color palette

---

## 4. Detail Page Top Bar

### Files Changed
- `app/gallery/_components/GalleryHeader.tsx`
- `app/gallery/_components/PhotoDetailClient.tsx`

### Changes
- Removed old top bar with Back button from detail page
- X close button now appears in the global header (top-right) on detail pages
- Click behavior:
  - If history exists: `router.back()` (restores scroll/time axis state)
  - Otherwise: `router.push('/gallery')` (default state)

---

## 5. Previous/Next Navigation Zones

### Files Changed
- `app/gallery/[photoId]/page.tsx`
- `app/gallery/_components/PhotoDetailClient.tsx`
- `app/gallery/_components/PhotoViewer.tsx`

### Changes
- Detail page now fetches adjacent photos using `getAdjacentPhotos` query
- Added invisible side zones (left/right) for prev/next navigation
- Zones use **fixed positioning** with `top: 48px` to avoid header overlap
- Subtle arrow icons appear on hover (fade in with opacity transition)
- Arrow keys (Left/Right) navigate between photos
- Zones only render when corresponding adjacent photo exists
- In fullscreen mode, zones use absolute positioning

---

## 6. Zoom Behavior Refactoring

### Files Changed
- `app/gallery/_components/PhotoViewer.tsx`

### Changes
- **Disabled mouse wheel zoom** - scroll wheel now scrolls the page normally
- **Click-to-zoom toggle**:
  - Default state (fit): single click zooms to 2x centered on click position
  - Zoomed state: single click resets to fit
- **Drag behavior improvements**:
  - Added 5px threshold to distinguish click from drag
  - Uses refs (`isDraggingRef`, `hasDraggedRef`) for immediate state tracking
  - Checks `e.buttons & 1` to verify left button is held during drag
  - Drag stops immediately when button is released
- **Pan boundary clamping** - prevents showing empty space beyond image bounds
- Same rules apply in fullscreen mode

---

## 7. Bottom Info Layout Reorganization

### Files Changed
- `app/gallery/_components/PhotoDetailClient.tsx`
- `app/gallery/_components/PhotoMetaInfo.tsx` (new)
- `app/gallery/_components/ExifInfo.tsx`
- `app/gallery/_components/HistogramTooltip.tsx` (new)
- `app/gallery/_components/Histogram.tsx` (unchanged, kept for potential future use)

### Changes

**Row 1 - Meta Info with Icons:**
- Calendar icon + capture date
- Location pin icon + location string
- Camera icon + device name
- Items separated by centered dot (`·`)
- Missing fields are omitted entirely

**Row 2 - EXIF Tokens + Histogram:**
- EXIF values as text tokens (focal length, aperture, shutter, ISO)
- Tokens separated by dots
- "Histogram" underlined text button (only if histogram data exists)
- Histogram tooltip on hover:
  - Dark semi-transparent background (`bg-zinc-900/95`)
  - Compact RGB histogram (256x128px)
  - Uses `isOpen` state with `onOpenChange` for proper rendering

---

## 8. Bug Fixes

### Camera Name Duplication
- **File:** `lib/gallery/utils.ts`
- **Issue:** Lens name contained camera model (e.g., "Apple iPhone 13 Pro · iPhone 13 Pro back triple camera")
- **Fix:** `cleanLensName` now accepts both `cameraMake` and `cameraModel` parameters and removes both from lens name
- Added `escapeRegex` helper function for safe regex patterns

### Histogram Rendering
- **File:** `app/gallery/_components/HistogramTooltip.tsx`
- **Issue:** Histogram was all black and too small
- **Fix:** 
  - Increased size from 144x64px to 256x128px
  - Fixed canvas initialization by using `isOpen` state and `requestAnimationFrame`
  - Changed background to solid dark color for visibility
  - Brightened RGB channel colors

### Drag Continues After Mouse Release
- **File:** `app/gallery/_components/PhotoViewer.tsx`
- **Issue:** Image continued moving after releasing mouse button
- **Fix:** Added `e.buttons & 1` check in `handleMouseMove` to verify button is pressed

### Navigation Zones Overlapping Header
- **File:** `app/gallery/_components/PhotoViewer.tsx`
- **Issue:** Clicking logo/X button triggered prev/next navigation
- **Fix:** Changed navigation zones from `absolute` to `fixed` positioning with explicit `top: 48px`

### HeroUI Button Event Handler
- **File:** `app/gallery/_components/GalleryHeader.tsx`
- **Issue:** `e.stopPropagation is not a function` error
- **Fix:** Changed from `onClick` to `onPress` for HeroUI Button, removed `stopPropagation` call

---

## 9. Component Summary

| Component | Status | Description |
|-----------|--------|-------------|
| `GalleryHeader.tsx` | Updated | Slim transparent header with conditional X button |
| `GalleryListClient.tsx` | Updated | Centered grid container |
| `PhotoGrid.tsx` | Updated | 3-column max layout |
| `TimeAxis.tsx` | Rewritten | Years-only horizontal lines, aligned with grid |
| `TimeAxisMobile.tsx` | Updated | Softer color palette |
| `PhotoDetailClient.tsx` | Updated | Two-row bottom info, removed top bar |
| `PhotoViewer.tsx` | Updated | Click-to-zoom, bounded drag, fixed nav zones |
| `PhotoMetaInfo.tsx` | New | Date/location/device row with icons |
| `ExifInfo.tsx` | Updated | EXIF tokens only (no device) |
| `HistogramTooltip.tsx` | New | Compact histogram in tooltip |
| `Histogram.tsx` | Unchanged | Kept for potential standalone use |

---

## 10. CSS Variables Added

```css
:root {
  --grid-width: 1296px;
  --grid-container-inline-padding: 24px;
}
```

---

## Notes

- All changes maintain consistency with existing Gallery code style
- HeroUI components used where possible (Button, Tooltip)
- Soft greys and subtle shadows preferred over strong black borders
- Mobile experience preserved with TimeAxisMobile component

