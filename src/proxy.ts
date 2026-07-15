import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Vercel üzerinden gelen IP ülkesini al. Localhost için 'TR' varsayılan yap, header yoksa 'GLOBAL' havuzuna at.
  const countryHeader = request.headers.get("x-vercel-ip-country");
  const country = process.env.NODE_ENV === "development" ? "TR" : (countryHeader || "GLOBAL");
  
  const region = country === "TR" ? "TR" : "GLOBAL";

  // 2. Kullanıcı zaten /tr veya /en içindeyse yönlendirme yapma, sadece header ve cookie ekle
  const isTrOrEn = pathname.startsWith("/tr") || pathname.startsWith("/en");
  
  if (isTrOrEn) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-region", region);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
    response.cookies.set("x-user-region", region);
    return response;
  }

  // 3. Yönlendirme gerekiyorsa (Kullanıcı kök dizinde veya dil parametresi olmayan bir rotadaysa)
  const targetLang = country === "TR" ? "tr" : "en";
  const isRootPath = pathname === "/";
  const targetPath = isRootPath ? `/${targetLang}` : `/${targetLang}${pathname}`;
  
  const response = NextResponse.redirect(new URL(targetPath, request.url));
  response.cookies.set("x-user-region", region);
  return response;
}

export const config = {
  // Statik dosyaları, Next.js iç dosyalarını, ikonları ve API rotalarını yoksay
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|apple-icon|site\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
