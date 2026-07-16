import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export async function generateStaticParams() {
  return [{ lang: "tr" }, { lang: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    return { title: "Good News" };
  }

  const dict = await getDictionary(lang);
  const siteTitle = lang === 'tr' ? 'Güzel Haberler' : 'Good News';
  const description = dict.metadata.description;
  const baseUrl = "https://guzelhaberler.net";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: siteTitle,
      template: `%s | ${siteTitle}`,
    },
    description: description,
    openGraph: {
      title: siteTitle,
      description: description,
      url: baseUrl,
      siteName: siteTitle,
      locale: lang === 'tr' ? 'tr_TR' : 'en_US',
      images: [
        {
          url: "/logo-icon-latest.png",
          width: 1200,
          height: 630,
          alt: siteTitle,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: description,
      images: ["/logo-icon-latest.png"],
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${inter.variable} ${plusJakarta.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar lang={lang} />
          <main className="flex-1">{children}</main>
          <Footer dict={dict} />
          <Toaster position="bottom-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
