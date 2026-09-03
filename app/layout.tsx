import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LingoLoop – lär dig språk",
  description: "Korta, praktiska språklektioner för vuxna och barn.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className="antialiased">{children}</body>
    </html>
  );
}
