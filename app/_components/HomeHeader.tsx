"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";

// Social links - easy to update
const SOCIAL_LINKS = {
  x: "https://x.com/dogrod_",
  instagram: "https://www.instagram.com/dogrod_/",
  unsplash: "https://unsplash.com/@dogrod"
};

interface DropdownItemProps {
  href: string;
  children: React.ReactNode;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

function DropdownItem({ href, children, onKeyDown }: DropdownItemProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-5 py-3 text-base text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900 focus:outline-none"
      onKeyDown={onKeyDown}
    >
      {children}
    </a>
  );
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="text-lg font-medium text-zinc-600 transition-colors hover:text-zinc-900 hover:underline underline-offset-4"
    >
      {children}
    </Link>
  );
}

export function HomeHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        dropdownTriggerRef.current &&
        !dropdownTriggerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        dropdownTriggerRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Handle keyboard navigation within dropdown
  const handleDropdownKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number, totalItems: number) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = (index + 1) % totalItems;
        const items = dropdownRef.current?.querySelectorAll("a");
        items?.[nextIndex]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = (index - 1 + totalItems) % totalItems;
        const items = dropdownRef.current?.querySelectorAll("a");
        items?.[prevIndex]?.focus();
      }
    },
    []
  );

  const dropdownItems = [
    { label: "X (Twitter)", href: SOCIAL_LINKS.x },
    { label: "Instagram", href: SOCIAL_LINKS.instagram },
    { label: "Unsplash", href: SOCIAL_LINKS.unsplash },
    { label: "LinkedIn", href: SOCIAL_LINKS.linkedin },
  ];

  return (
    <header className="w-full px-6 py-6 lg:px-8 lg:py-8">
      <nav className="mx-auto flex max-w-5xl items-center justify-between">
        {/* Logo / Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 text-xl font-semibold tracking-tight text-zinc-900"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg">
            <Image
              src="https://cdn.dogrod.com/logo.png"
              alt="dogrodOS logo"
              height={40}
              width={40}
            />
          </span>
          <span>Brian Zhu</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <NavLink href="/blog">Blog</NavLink>
          <NavLink href="/gallery">Gallery</NavLink>

          {/* Contact Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button
              ref={dropdownTriggerRef}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex cursor-pointer items-center gap-1.5 text-lg font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              Find Me On
              <svg
                className={`h-5 w-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
                <div
                  ref={dropdownRef}
                  className="min-w-[160px] overflow-hidden rounded-xl border border-zinc-200 bg-white py-2 shadow-lg"
                  role="menu"
                >
                  {dropdownItems.map((item, index) => (
                    <DropdownItem
                      key={item.label}
                      href={item.href}
                      onKeyDown={(e) =>
                        handleDropdownKeyDown(e, index, dropdownItems.length)
                      }
                    >
                      {item.label}
                    </DropdownItem>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex h-12 w-12 items-center justify-center rounded-xl text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 md:hidden"
        >
          <div className="flex flex-col gap-4">
            <Link
              href="/blog"
              className="block py-2 text-lg font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/gallery"
              className="block py-2 text-lg font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Gallery
            </Link>
            <div className="my-2 h-px bg-zinc-200" />
            <span className="text-sm font-medium uppercase tracking-wider text-zinc-400">
              Social
            </span>
            {dropdownItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2 text-lg font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
