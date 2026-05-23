import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Nav } from "@/components/layout/Nav";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Lovair — Flights",
  description: "Search, book, and manage flights.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Lovair" },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <AppProviders>
          <Nav />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
