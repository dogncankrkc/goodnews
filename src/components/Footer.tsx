import type { Dictionary } from "@/lib/i18n/dictionaries";

export default function Footer({ dict }: { dict: Dictionary }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 mt-auto" id="footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-foreground dark:text-gray-200">
              {dict.nav.brand}
            </span>
          </div>

          {/* Tagline */}
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">{dict.footer.tagline}</p>

          {/* Divider */}
          <div className="w-12 h-px bg-gray-200 dark:bg-slate-800 my-2" />

          {/* Copyright */}
          <p className="text-xs text-gray-600 dark:text-gray-400">
            © {year} {dict.nav.brand}. {dict.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
