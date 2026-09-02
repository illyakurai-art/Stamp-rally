import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  maximumScale: 1,
  userScalable: false,
};

export default function MappaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
