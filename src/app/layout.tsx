import "./globals.css";

/**
 * Root layout — minimal shell for the <html> and <body> tags.
 * The [lang] segment layout handles fonts, metadata, and lang attribute.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
