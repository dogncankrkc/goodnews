import type { Locale } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import Link from "next/link";
import Image from "next/image";
import CategoryDropdown from "./CategoryDropdown";
import { ThemeToggle } from "./ThemeToggle";
import logoIcon from "../../public/logo-icon-latest.png";
import logoFullEn from "../../public/logo-full.png";
import logoFullTr from "../../public/logo-full-tr.png";
import CollectiveGoodnessCounter from "./CollectiveGoodnessCounter";

export default async function Navbar({ lang }: { lang: Locale }) {
  const dict = await getDictionary(lang);
  const otherLang = lang === "tr" ? "en" : "tr";
  const otherLangLabel = lang === "tr" ? "EN" : "TR";

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-white/10 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between md:h-30 h-20">
          {/* Logo */}
          <Link
            href={`/${lang}`}
            className="flex items-center group"
            id="nav-logo"
          >
            {/* Mobile Logo (Icon only) */}
            <div className="flex md:hidden items-center">
              <Image
                src={logoIcon}
                alt={lang === "tr" ? "Güzel Haberler İkonu" : "Good News Icon"}
                className="w-auto h-15 object-contain"
                priority
              />
            </div>

            {/* Desktop Logo (Full text) */}
            <div className="hidden md:flex items-center">
              <Image
                src={lang === "tr" ? logoFullTr : logoFullEn}
                alt={lang === "tr" ? "Güzel Haberler Logo" : "Good News Logo"}
                className={lang === "tr" ? "h-25 w-auto object-contain" : "h-30 w-auto object-contain"}
                priority
              />
            </div>
          </Link>

          {/* Navigation Links / Categories */}
          {/* Language Switcher */}
          <div className="flex items-center gap-3">
            
            <CollectiveGoodnessCounter dict={dict} />
            
            <div className="hidden md:block w-px h-5 bg-border mx-1" />

            <CategoryDropdown
              lang={lang}
              label={dict.nav.categories}
              allLabel={dict.categories.all}
              categories={[
                "general",
                "technology",
                "digital_security",
                "science",
                "health",
                "nature",
                "humanity",
                "education",
                "sports_action",
                "culture_arts",
                "good_business",
              ].map((cat) => ({
                id: cat,
                label: dict.categories[cat as keyof typeof dict.categories],
              }))}
            />
            <Link
              href={`/${otherLang}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-surface text-muted hover:bg-primary hover:text-white transition-all duration-300"
              id="lang-switcher"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9 9 0 0 1 3 12c0-1.47.353-2.856.978-4.082"
                />
              </svg>
              {otherLangLabel}
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
