import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "DNA Studio — AI Marketing Platform",
  description:
    "Self-hosted AI marketing platform. Extract Brand DNA from any website and generate on-brand content for every social platform.",
  openGraph: {
    title: "DNA Studio — AI Marketing Platform",
    description:
      "Like Google Pomelli, but open source, model-agnostic, and actually ships to your social media.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
