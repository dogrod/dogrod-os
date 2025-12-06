# Add Umami Analytics Tracking

**Date**: 2025-12-06

## Summary

Implemented a comprehensive, privacy-first analytics tracking system using self-hosted Umami. The system tracks image views and user navigation patterns while remaining fully optional.

## Changes

### New Files

- **`lib/analytics/index.ts`** - Type-safe analytics utility with tracking functions
- **`docs/analytics-tracking.md`** - Comprehensive documentation for the tracking system

### Modified Files

- **`app/layout.tsx`** - Added conditional Umami script loading via environment variables
- **`app/gallery/_components/PhotoCard.tsx`** - Track `image-viewed` when user clicks loaded thumbnails
- **`app/gallery/_components/PhotoViewer.tsx`** - Track `image-viewed` on detail page load, `gallery-navigated` on prev/next
- **`app/gallery/_components/PhotoDetailClient.tsx`** - Pass `photoId` prop to PhotoViewer
- **`app/gallery/_components/TimeAxis.tsx`** - Track `timeline-navigated` for desktop
- **`app/gallery/_components/TimeAxisMobile.tsx`** - Track `timeline-navigated` for mobile
- **`README.md`** - Added Umami environment variables and link to analytics docs

## Events Tracked

| Event | Trigger | Key Properties |
|-------|---------|----------------|
| `image-viewed` | Thumbnail click (after load) or detail page load | `photo_id`, `source`, `load_time_ms` |
| `gallery-navigated` | Prev/next navigation (click or keyboard) | `photo_id`, `method`, `direction` |
| `timeline-navigated` | Time axis click | `year`, `device` |

## Configuration

Analytics is **optional**. Set these environment variables to enable:

```env
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://your-umami-instance.com/script.js
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-website-id
```

When not configured:
- Umami script does not load
- All tracking functions silently no-op
- Zero runtime overhead

## Design Decisions

1. **Environment-based configuration** - No hardcoded URLs/IDs for open source compatibility
2. **Conditional loading** - Script and tracking disabled when env vars missing
3. **Type-safe API** - Full TypeScript types for all events
4. **Privacy-first** - Umami is cookieless and GDPR-compliant by default
5. **Performance-focused** - Script loads with `afterInteractive` strategy
