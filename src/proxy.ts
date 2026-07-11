import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["tr", "en"];
const defaultLocale = "tr";

/**
 * Domain-to-locale mapping:
 * - guzelhaberler.com → Turkish (tr)
 * - goodnews.com → English (en)
 * - localhost / everything else → Turkish (tr) as default
 */
function getLocaleFromDomain(hostname: string): string {
  // Remove port number for comparison
  const host = hostname.split(":")[0];

  if (host === "goodnews.com" || host === "www.goodnews.com") {
    return "en";
  }
  if (host === "guzelhaberler.com" || host === "www.guzelhaberler.com") {
    return "tr";
  }

  // Default to Turkish for localhost and unknown domains
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the pathname already has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Determine locale from domain
  const hostname = request.headers.get("host") || "localhost";
  const locale = getLocaleFromDomain(hostname);

  // Redirect to the locale-prefixed path
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip internal paths, API routes, and static assets
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images).*)",
  ],
};
