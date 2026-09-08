import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ToasterProvider } from "@/components/toaster-provider";
import { I18nProvider } from "@/lib/i18n/context";
import { ImageProtection } from "@/components/image-protection";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const defaultUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Stamp Rally",
  description: "Colleziona timbri e riscatta premi durante l'evento",
  icons: {
    icon: "/stamp-badge.png",
  },
  openGraph: {
    images: [
      {
        url: "/stamp-badge.png",
        width: 512,
        height: 512,
        alt: "Stamp Rally",
      },
    ],
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
<I18nProvider>
            {children}
          </I18nProvider>
        </ThemeProvider>
        <ImageProtection />
        <footer className="w-full pb-6 pt-4 text-center">
          <p className="text-xs text-foreground/50">
            WebApp realizzata da{" "}
            <a
              href="https://www.instagram.com/illya.cosph?igsh=d3g4azVmcGUxMW82"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-foreground/70 hover:text-foreground hover:underline"
            >
              @IllyA
            </a>
          </p>
        </footer>
        <ToasterProvider />
        <Analytics />
      </body>
    </html>
  );
}
