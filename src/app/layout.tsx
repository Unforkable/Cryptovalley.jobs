import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cryptovalley.jobs";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "CryptoValley.jobs - Blockchain & Crypto Jobs in Switzerland",
    template: "%s | CryptoValley.jobs",
  },
  description:
    "Find the best blockchain, crypto, and Web3 jobs in Switzerland's Crypto Valley. Browse opportunities from top companies in Zug, Zurich, and beyond.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CryptoValley.jobs",
  },
  twitter: {
    card: "summary",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
