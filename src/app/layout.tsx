 import type { Metadata } from "next";
  import { Inter, Sora } from "next/font/google";
  import { Analytics } from "@vercel/analytics/react";
  import "./globals.css";

  const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter"
  });

  const sora = Sora({
    subsets: ["latin"],
    weight: ["500", "600", "700", "800"],
    variable: "--font-display"
  });

  export const metadata: Metadata = {
    title: "Decision Brief AI — Paste any meeting, get a decision memo",
    description:
      "Turn a messy meeting transcript, PRD, or strategy doc into a structured 1-page decision brief — decision, options, tradeoffs, recommendation, owner, risks, and next actions — in 30 seconds. No signup required.",
    openGraph: {
      title: "Decision Brief AI — Paste any meeting, get a decision memo",
      description:
        "Turn a messy transcript, PRD, or strategy doc into a structured 1-page decision brief in 30 seconds. No signup required.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Decision Brief AI",
      description:
        "Paste any meeting and get a 1-page decision memo your exec will actually read.",
    },
  };

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        <body className={`${inter.variable} ${sora.variable} font-sans antialiased`}>
          {children}
          <Analytics />
        </body>
      </html>
    );
  }
