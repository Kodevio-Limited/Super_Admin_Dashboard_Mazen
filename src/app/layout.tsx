import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Super Admin Dashboard | Restaurant Ecosystem SaaS",
  description: "Enterprise multi-chain restaurant management, subscription licensing, and revenue intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F2F2F2] text-[#2D2F33] min-h-screen">
        {children}
      </body>
    </html>
  );
}
