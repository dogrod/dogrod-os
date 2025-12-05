/**
 * Gallery utility functions for formatting and display
 */

/**
 * Format shutter speed for display
 * @param shutterSeconds - Shutter speed in seconds (e.g., 0.008 for 1/125s)
 * @returns Formatted string like "1/125s" or "2.5s"
 */
export function formatShutterSpeed(shutterSeconds: number | null): string | null {
  if (shutterSeconds === null || shutterSeconds <= 0) return null;

  if (shutterSeconds >= 1) {
    // For 1 second or longer, show decimal
    return shutterSeconds % 1 === 0
      ? `${shutterSeconds}s`
      : `${shutterSeconds.toFixed(1)}s`;
  }

  // For less than 1 second, show as fraction
  const denominator = Math.round(1 / shutterSeconds);
  return `1/${denominator}s`;
}

/**
 * Format aperture for display
 * @param aperture - Aperture value (e.g., 2.8)
 * @returns Formatted string like "f/2.8"
 */
export function formatAperture(aperture: number | null): string | null {
  if (aperture === null || aperture <= 0) return null;

  // Remove unnecessary decimals
  const formatted = aperture % 1 === 0 ? aperture.toString() : aperture.toFixed(1);
  return `f/${formatted}`;
}

/**
 * Format ISO for display
 * @param iso - ISO value (e.g., 800)
 * @returns Formatted string like "ISO 800"
 */
export function formatISO(iso: number | null): string | null {
  if (iso === null || iso <= 0) return null;
  return `ISO ${iso}`;
}

/**
 * Format focal length for display
 * @param focalLengthMm - Focal length in millimeters
 * @returns Formatted string like "24mm"
 */
export function formatFocalLength(focalLengthMm: number | null): string | null {
  if (focalLengthMm === null || focalLengthMm <= 0) return null;

  // Remove unnecessary decimals
  const formatted =
    focalLengthMm % 1 === 0 ? focalLengthMm.toString() : focalLengthMm.toFixed(0);
  return `${formatted}mm`;
}

/**
 * Format camera device string
 * @param make - Camera manufacturer (e.g., "Sony")
 * @param model - Camera model (e.g., "ILCE-7M4")
 * @param lens - Lens model (e.g., "FE 24-70mm F2.8 GM")
 * @returns Formatted string like "Sony A7 IV · FE 24-70mm F2.8"
 */
export function formatDevice(
  make: string | null,
  model: string | null,
  lens: string | null
): string | null {
  const parts: string[] = [];

  // Combine make and model, cleaning up common patterns
  if (make || model) {
    let camera = "";
    if (make && model) {
      // If model already contains make, don't duplicate
      if (model.toLowerCase().includes(make.toLowerCase())) {
        camera = model;
      } else {
        camera = `${make} ${model}`;
      }
    } else {
      camera = make || model || "";
    }

    // Clean up common model name patterns
    camera = cleanCameraName(camera);
    if (camera) parts.push(camera);
  }

  // Add lens if available
  if (lens) {
    // Pass both make and model to remove duplicates from lens name
    const cleanedLens = cleanLensName(lens, make, model);
    if (cleanedLens) parts.push(cleanedLens);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * Clean up camera model names for better display
 */
function cleanCameraName(name: string): string {
  return name
    .replace(/^NIKON CORPORATION\s+/i, "Nikon ")
    .replace(/^SONY\s+/i, "Sony ")
    .replace(/^Canon\s+/i, "Canon ")
    .replace(/^FUJIFILM\s+/i, "Fujifilm ")
    .replace(/ILCE-(\d+)M(\d+)/i, "A$1 M$2")
    .replace(/ILCE-(\d+)/i, "A$1")
    .trim();
}

/**
 * Clean up lens model names for better display
 * Removes camera make/model prefix if present in lens name
 */
function cleanLensName(name: string, cameraMake?: string | null, cameraModel?: string | null): string {
  let cleaned = name;
  
  // Remove camera model from lens name if it starts with it (e.g., "iPhone 13 Pro back camera" -> "back camera")
  if (cameraModel) {
    const modelRegex = new RegExp(`^${escapeRegex(cameraModel)}\\s*`, "i");
    cleaned = cleaned.replace(modelRegex, "");
  }
  
  // Remove camera make prefix from lens name if it starts with it
  if (cameraMake) {
    const makeRegex = new RegExp(`^${escapeRegex(cameraMake)}\\s*`, "i");
    cleaned = cleaned.replace(makeRegex, "");
  }
  
  return cleaned
    .replace(/^E\s+/i, "")
    .replace(/\s+OSS$/i, "")
    .replace(/\s+G$/i, " G")
    .trim();
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Get aspect ratio as a CSS-friendly string
 */
export function getAspectRatioStyle(width: number, height: number): string {
  return `${width} / ${height}`;
}

/**
 * Calculate optimal columns for masonry grid based on container width
 */
export function calculateGridColumns(containerWidth: number): number {
  if (containerWidth < 640) return 1; // sm
  if (containerWidth < 768) return 2; // md
  if (containerWidth < 1024) return 3; // lg
  if (containerWidth < 1280) return 4; // xl
  return 5; // 2xl+
}

/**
 * Get year and month from a date string
 */
export function getYearMonth(dateString: string | null): { year: number; month: number } | null {
  if (!dateString) return null;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1, // 1-12
  };
}

/**
 * Format month number to short name
 */
export function formatMonth(month: number): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return months[month - 1] || "";
}

/**
 * Format month number to full name
 */
export function formatMonthFull(month: number): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return months[month - 1] || "";
}

/**
 * Debounce function for scroll handlers
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function for scroll handlers
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}



