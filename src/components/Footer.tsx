import type { Dictionary } from "@/lib/i18n/dictionaries";

export default function Footer({ dict }: { dict: Dictionary }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-border mt-auto" id="footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-foreground">
              {dict.nav.brand}
            </span>
          </div>

          {/* Tagline */}
          <p className="text-sm text-muted max-w-sm">{dict.footer.tagline}</p>

          {/* Divider */}
          <div className="w-12 h-px bg-border my-2" />

          {/* Copyright */}
          <p className="text-xs text-muted">
            © {year} {dict.nav.brand}. {dict.footer.rights}
          </p>

          <p className="text-xs text-muted flex items-center gap-1">
            <span className="text-red-400 animate-pulse-soft">♥</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
