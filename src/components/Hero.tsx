import type { Dictionary } from "@/lib/i18n/dictionaries";

export default function Hero({ dict }: { dict: Dictionary }) {
  return (
    <section className="relative overflow-hidden bg-slate-900 gradient-hero" id="hero">
      {/* Decorative floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-warm/5 rounded-full blur-3xl animate-float" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-primary/10 text-sm font-medium text-primary mb-8 animate-fade-in-up animate-pulse-soft">
            {dict.hero.badge}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-fade-in-up delay-100 text-gray-900 dark:text-white">
            {dict.hero.title}{" "}
            <span className="gradient-text">{dict.hero.titleHighlight}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted dark:text-slate-300 leading-relaxed max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
            {dict.hero.subtitle}
          </p>

          {/* CTA */}
          <div className="animate-fade-in-up delay-300">
            <a
              href="#news"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0"
              id="hero-cta"
            >
              {dict.hero.cta}
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom wave (Hidden in dark mode to merge with next section smoothly) */}
      <div className="absolute bottom-0 left-0 right-0 dark:hidden">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z"
            className="fill-white"
          />
        </svg>
      </div>
    </section>
  );
}
