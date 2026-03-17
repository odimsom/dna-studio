import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: "DNA Studio — AI Marketing Platform",
  description:
    "Self-hosted AI marketing platform. Extract Brand DNA from any website and generate on-brand content for every social platform.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "DNA Studio — AI Marketing Platform",
    description:
      "Self-hosted AI marketing platform. Extract Brand DNA from any website and generate on-brand content for every social platform.",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DNA Studio — AI Marketing Platform",
    description:
      "Self-hosted AI marketing platform. Extract Brand DNA from any website and generate on-brand content for every social platform.",
    images: ["/opengraph-image"],
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
