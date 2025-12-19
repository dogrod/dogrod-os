"use client";

import Link from "next/link";
import type { TranslationSibling, Language } from "@/lib/blog/types";

interface LanguageSwitcherProps {
  currentLanguage: Language | null;
  siblings: TranslationSibling[];
}

/**
 * Ghost-style language switcher
 * Positioned absolutely in top-right of article container
 * Format: "中 | En" with current language bold
 */
export function LanguageSwitcher({
  currentLanguage,
  siblings,
}: LanguageSwitcherProps) {
  // Filter valid siblings
  const validSiblings = siblings.filter((s) => s.language != null);

  // Don't render if no valid siblings or no current language
  if (validSiblings.length === 0 || !currentLanguage) {
    return null;
  }

  // Get short label for language (first character for CJK, abbreviation for others)
  const getShortLabel = (lang: Language | null): string => {
    if (!lang) return "";
    switch (lang) {
      case "zh-CN":
        return "中";
      case "en":
        return "En";
      default:
        // For any future languages, use first 2 characters
        return String(lang).slice(0, 2);
    }
  };

  return (
    <div className="absolute top-0 right-0 flex items-center gap-2 text-sm font-sans">
      {/* Current Language - Bold */}
      <span className="font-medium text-zinc-900">
        {getShortLabel(currentLanguage)}
      </span>

      {/* Separator */}
      <span className="text-zinc-300">|</span>

      {/* Available Translations - Muted, with hover */}
      {validSiblings.map((sibling, index) => (
        <span key={sibling.id} className="flex items-center gap-2">
          <Link
            href={`/blog/${sibling.slug}`}
            className="text-zinc-400 hover:text-zinc-900 hover:underline underline-offset-4 transition-colors"
          >
            {getShortLabel(sibling.language)}
          </Link>
          {index < validSiblings.length - 1 && (
            <span className="text-zinc-300">|</span>
          )}
        </span>
      ))}
    </div>
  );
}
