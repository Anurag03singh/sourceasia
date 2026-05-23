import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Nav } from "@/components/layout/Nav";
import { AppProviders } from "@/components/providers/AppProviders";
import { AppChrome } from "@/components/chrome/AppChrome";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Lovair — Flight Management",
  description: "Search, book, reschedule, and manage flights with live seat maps.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Lovair" },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen w-full font-sans">
        <AppProviders>
          <AppChrome />
          <Nav />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
