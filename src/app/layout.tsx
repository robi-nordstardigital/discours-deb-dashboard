import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DEB — Discours Engine Bot",
  description: "Approval queue for @DiscoursDialoog reply candidates",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
