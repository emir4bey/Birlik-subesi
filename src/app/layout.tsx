import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-oswald",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Birlik Şubesi | Transfer & Ban Affı",
  description: "Transfer ve ban affı başvuru merkezi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${oswald.variable} ${inter.variable}`}>
      <body className="font-body min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
