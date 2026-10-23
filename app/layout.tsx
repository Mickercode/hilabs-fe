import type { Metadata } from "next";
import { Sora, Source_Sans_3 } from "next/font/google";
import "./globals.css";

// Sora carries headings and the wordmark; Source Sans 3 carries everything read at length, and
// covers the accented letters used in Yoruba, Igbo, Hausa and other languages HiLabs may serve.
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HiLabs",
    template: "%s · HiLabs",
  },
  description:
    "A new way to learn for adults of any background. Explore, learn alongside experts and build a portfolio of real work.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sora.variable} ${sourceSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
