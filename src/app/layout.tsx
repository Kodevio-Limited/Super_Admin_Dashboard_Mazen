// Root layout — minimal wrapper. Real layout lives in [locale]/layout.tsx.
// This file exists only to satisfy Next.js App Router's requirement for a
// root layout. The [locale] layout below it sets <html lang dir>.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
