# Analytics Tracking System

This document describes the analytics tracking system implemented using [Umami](https://umami.is).

## Overview

The tracking system is designed with the following principles:

1. **Privacy-first**: Umami can be self-hosted, ensuring full control over user data
2. **Lightweight**: No cookies, GDPR-compliant by default
3. **Type-safe**: All events are typed in TypeScript
4. **Performance-focused**: Script loads after page interaction (`afterInteractive` strategy)
5. **Developer-friendly**: Development mode logs events to console for debugging
6. **Optional**: Analytics only loads when environment variables are configured

## Setup

Configure the following environment variables in `.env.local`:

```env
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://your-umami-instance.com/script.js
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-website-id
```

If these variables are not set, analytics will be disabled.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Root Layout                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Umami Script (afterInteractive)                        │ │
│  │  src: NEXT_PUBLIC_UMAMI_SCRIPT_URL                      │ │
│  │  data-website-id: NEXT_PUBLIC_UMAMI_WEBSITE_ID          │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  lib/analytics/index.ts                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Type-safe event tracking utilities                     │ │
│  │  - trackImageViewed()                                   │ │
│  │  - trackGalleryNavigation()                             │ │
│  │  - trackTimelineNavigation()                            │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Components                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  PhotoCard  │  │ PhotoViewer │  │ TimeAxis(Mobile)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Events

### Automatic Events (by Umami)

| Event | Description |
|-------|-------------|
| **Page View** | Automatically tracked on every page navigation. Includes URL, referrer, browser, OS, device type. |

### Custom Events

#### 1. `image-viewed`

**Description**: Tracks when a user actually views an image (image fully loaded after user action).

**Triggers**:
- **List page**: When user clicks a thumbnail AND the thumbnail image has finished loading
- **Detail page**: When the detail image finishes loading

**Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `photo_id` | string | Unique identifier for the photo |
| `source` | `"list"` \| `"detail"` | Where the image was viewed |
| `load_time_ms` | number (optional) | Time from action to image load in milliseconds |

**Example**:
```typescript
trackImageViewed({
  photo_id: "abc123",
  source: "list",
  load_time_ms: 234
});
```

**Use cases**:
- Measure which photos are most viewed
- Calculate engagement rate (views / impressions)
- Analyze load performance by source

---

#### 2. `gallery-navigated`

**Description**: Tracks navigation between photos in the gallery detail view.

**Triggers**:
- Clicking prev/next navigation zones
- Using keyboard arrows (Left/Right)

**Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `photo_id` | string | Target photo being navigated to |
| `method` | `"click"` \| `"keyboard"` | How the user navigated |
| `direction` | `"prev"` \| `"next"` | Navigation direction |

**Example**:
```typescript
trackGalleryNavigation({
  photo_id: "abc123",
  method: "keyboard",
  direction: "next"
});
```

**Use cases**:
- Understand navigation patterns
- Optimize UX for preferred navigation method
- Measure engagement depth (how many photos viewed per session)

---

#### 3. `timeline-navigated`

**Description**: Tracks when users jump to a specific time period using the timeline.

**Triggers**:
- Clicking a year on desktop time axis
- Clicking a month/year on mobile time axis

**Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `year` | number | The year being navigated to |
| `device` | `"desktop"` \| `"mobile"` | Device type (based on which component triggered) |

**Example**:
```typescript
trackTimelineNavigation({
  year: 2023,
  device: "desktop"
});
```

**Use cases**:
- Understand which time periods are most interesting
- Optimize timeline UX per device type
- Identify content gaps (years with low navigation)

## Implementation Details

### Script Loading

The Umami script is loaded in `app/layout.tsx` using Next.js Script component:

```tsx
{process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL && process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
  <Script
    defer
    src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
    data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
    strategy="afterInteractive"
  />
)}
```

The `afterInteractive` strategy ensures the script loads after the page becomes interactive, minimizing impact on Core Web Vitals. The script only loads when both environment variables are configured.

### Analytics Utility

Located at `lib/analytics/index.ts`, the utility provides:

1. **Type definitions** for all events
2. **Type-safe tracking functions** that validate event data at compile time
3. **Environment check** - all tracking is disabled if env vars are not configured
4. **Safe execution** when Umami is not available (ad blockers, script not loaded, etc.)

### Component Integration

#### PhotoCard (List Page)

```typescript
// Track load state
const [isImageLoaded, setIsImageLoaded] = useState(false);
const loadStartTimeRef = useRef<number>(Date.now());

// On click, track if image was loaded
const handleClick = () => {
  if (isImageLoaded) {
    trackImageViewed({
      photo_id: photo.id,
      source: "list",
      load_time_ms: Date.now() - loadStartTimeRef.current,
    });
  }
};
```

#### PhotoViewer (Detail Page)

```typescript
// Track when image loads
const handleImageLoad = () => {
  setIsLoaded(true);
  if (!hasTrackedLoadRef.current) {
    hasTrackedLoadRef.current = true;
    trackImageViewed({
      photo_id: photoId,
      source: "detail",
      load_time_ms: Date.now() - loadStartTimeRef.current,
    });
  }
};
```

## Event Naming Convention

Events follow a consistent `noun-verb` (past tense) pattern:

- `image-viewed` (not `view-image`)
- `gallery-navigated` (not `navigate-gallery`)
- `timeline-navigated` (not `click-timeline`)

This makes events read naturally in analytics dashboards: "User `image-viewed` 50 times today."

## Debugging

To test tracking locally:

1. Ensure environment variables are set in `.env.local`
2. Run development server: `pnpm dev`
3. Open browser DevTools → Network tab
4. Look for requests to your Umami instance

**Note**: If environment variables are not configured, all tracking functions silently do nothing - no errors, no console logs. This makes analytics truly optional.

## Privacy Considerations

- **No cookies**: Umami uses a hash of IP + User-Agent for unique visitors
- **No personal data**: We only track photo IDs and navigation patterns
- **Self-hosted**: All data stays on our server
- **GDPR compliant**: No consent banner required (no PII collected)

## Future Enhancements

Potential events to add:

| Event | Trigger | Purpose |
|-------|---------|---------|
| `photo-zoomed` | User zooms in/out | Measure engagement depth |
| `fullscreen-toggled` | Enter/exit fullscreen | UX optimization |
| `gallery-filtered` | Apply filters | Feature usage |
| `photo-shared` | Click share button | Virality tracking |

## Files Modified

| File | Changes |
|------|---------|
| `app/layout.tsx` | Added Umami script |
| `lib/analytics/index.ts` | New analytics utility |
| `app/gallery/_components/PhotoCard.tsx` | Added image-viewed tracking |
| `app/gallery/_components/PhotoViewer.tsx` | Added image-viewed + gallery-navigated tracking |
| `app/gallery/_components/PhotoDetailClient.tsx` | Pass photoId to PhotoViewer |
| `app/gallery/_components/TimeAxis.tsx` | Added timeline-navigated tracking |
| `app/gallery/_components/TimeAxisMobile.tsx` | Added timeline-navigated tracking |
