/**
 * Umami Analytics Utility
 *
 * Provides type-safe event tracking for the dogrodOS application.
 * Analytics is optional - only enabled when environment variables are configured.
 *
 * Required env vars:
 * - NEXT_PUBLIC_UMAMI_SCRIPT_URL
 * - NEXT_PUBLIC_UMAMI_WEBSITE_ID
 *
 * @see https://umami.is/docs/track-events
 */

// Extend window to include umami
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, unknown>) => void;
    };
  }
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Check if analytics is enabled via environment variables
 */
const isAnalyticsEnabled = Boolean(
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL &&
  process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
);

// ============================================================================
// Event Types
// ============================================================================

/**
 * Image viewed event - tracks when a user actually views an image
 * Triggered when the image is fully loaded after user action
 */
export interface ImageViewedEvent {
  /** Unique photo identifier */
  photo_id: string;
  /** Where the image was viewed */
  source: "list" | "detail";
  /** Time in milliseconds from click/navigation to image load */
  load_time_ms?: number;
}

/**
 * Gallery navigation event - tracks navigation within gallery
 */
export interface GalleryNavigationEvent {
  /** Navigation method */
  method: "click" | "keyboard" | "swipe";
  /** Direction of navigation */
  direction?: "prev" | "next";
  /** Target photo ID */
  photo_id: string;
}

/**
 * Timeline navigation event - tracks time axis usage
 */
export interface TimelineNavigationEvent {
  /** Year navigated to */
  year: number;
  /** Device type */
  device: "desktop" | "mobile";
}

/**
 * Photo zoom event - tracks zoom interactions
 */
export interface PhotoZoomEvent {
  /** Photo being zoomed */
  photo_id: string;
  /** Zoom level (1 = 100%, 2 = 200%, etc.) */
  zoom_level: number;
  /** Action type */
  action: "zoom_in" | "zoom_out" | "reset";
}

/**
 * Fullscreen event - tracks fullscreen toggle
 */
export interface FullscreenEvent {
  /** Photo ID */
  photo_id: string;
  /** Action type */
  action: "enter" | "exit";
}

// ============================================================================
// Event Names (consistent naming: noun-verb pattern)
// ============================================================================

export const ANALYTICS_EVENTS = {
  IMAGE_VIEWED: "image-viewed",
  GALLERY_NAVIGATED: "gallery-navigated",
  TIMELINE_NAVIGATED: "timeline-navigated",
  PHOTO_ZOOMED: "photo-zoomed",
  FULLSCREEN_TOGGLED: "fullscreen-toggled",
} as const;

// ============================================================================
// Tracking Functions
// ============================================================================

/**
 * Check if Umami is available and ready
 */
function isUmamiReady(): boolean {
  return typeof window !== "undefined" && typeof window.umami?.track === "function";
}

/**
 * Generic track function with type safety
 * Does nothing if analytics is not enabled via environment variables
 */
function track(eventName: string, eventData?: Record<string, unknown>): void {
  // Skip if analytics is not configured
  if (!isAnalyticsEnabled) {
    return;
  }

  // Skip if Umami script hasn't loaded yet
  if (!isUmamiReady()) {
    return;
  }

  window.umami!.track(eventName, eventData);
}

/**
 * Track image viewed event
 *
 * @example
 * // On list page, after thumbnail click and image load
 * trackImageViewed({
 *   photo_id: "abc123",
 *   source: "list",
 *   load_time_ms: 234
 * });
 *
 * @example
 * // On detail page, when image finishes loading
 * trackImageViewed({
 *   photo_id: "abc123",
 *   source: "detail",
 *   load_time_ms: 567
 * });
 */
export function trackImageViewed(event: ImageViewedEvent): void {
  track(ANALYTICS_EVENTS.IMAGE_VIEWED, event as unknown as Record<string, unknown>);
}

/**
 * Track gallery navigation event
 */
export function trackGalleryNavigation(event: GalleryNavigationEvent): void {
  track(ANALYTICS_EVENTS.GALLERY_NAVIGATED, event as unknown as Record<string, unknown>);
}

/**
 * Track timeline navigation event
 */
export function trackTimelineNavigation(event: TimelineNavigationEvent): void {
  track(ANALYTICS_EVENTS.TIMELINE_NAVIGATED, event as unknown as Record<string, unknown>);
}

/**
 * Track photo zoom event
 */
export function trackPhotoZoom(event: PhotoZoomEvent): void {
  track(ANALYTICS_EVENTS.PHOTO_ZOOMED, event as unknown as Record<string, unknown>);
}

/**
 * Track fullscreen toggle event
 */
export function trackFullscreen(event: FullscreenEvent): void {
  track(ANALYTICS_EVENTS.FULLSCREEN_TOGGLED, event as unknown as Record<string, unknown>);
}
