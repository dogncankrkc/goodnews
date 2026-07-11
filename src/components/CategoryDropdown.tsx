"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export type CategoryDropdownProps = {
  lang: string;
  label: string;
  allLabel: string;
  categories: { id: string; label: string }[];
};

function DropdownContent({ lang, label, allLabel, categories }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on ESC key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
            isOpen || currentCategory
              ? "bg-primary text-white"
              : "bg-surface text-muted hover:text-foreground hover:bg-surface/80"
          }`}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {label}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      <div
        className={`absolute left-0 mt-2 w-56 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 focus:outline-none transition-all duration-200 origin-top-left z-50 ${
          isOpen
            ? "transform opacity-100 scale-100 visible"
            : "transform opacity-0 scale-95 invisible pointer-events-none"
        }`}
      >
        <div className="py-2 px-2 space-y-1 max-h-[60vh] overflow-y-auto no-scrollbar">
          <Link
            href={`/${lang}`}
            onClick={() => setIsOpen(false)}
            className={`block px-4 py-2 text-sm rounded-xl transition-colors duration-150 ${
              !currentCategory
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted hover:bg-surface hover:text-foreground"
            }`}
          >
            {allLabel}
          </Link>
          
          {categories.map((cat) => {
            const isActive = currentCategory === cat.id;
            return (
              <Link
                key={cat.id}
                href={`/${lang}?category=${cat.id}`}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 text-sm rounded-xl transition-colors duration-150 flex items-center justify-between ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                <span>{cat.label}</span>
                {isActive && (
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CategoryDropdown(props: CategoryDropdownProps) {
  return (
    <Suspense
      fallback={
        <div className="h-9 w-32 bg-surface rounded-full animate-pulse" />
      }
    >
      <DropdownContent {...props} />
    </Suspense>
  );
}
