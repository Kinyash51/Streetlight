import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import "./reader-styles.css";
import "./auth-dashboard-styles.css";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://streetlightstory.site"),
  title: {
    default: "Streetlight - Urban Noir Fiction by Trevor Kinyanjui",
    template: "%s | Streetlight",
  },
  description:
    "The Drowned Streetlamp, a rain-soaked urban noir story about memory, loneliness, and survival.",
  applicationName: "Streetlight",
  authors: [{ name: "Trevor Kinyanjui" }],
  creator: "Trevor Kinyanjui",
  publisher: "Streetlight",
  keywords: [
    "Streetlight",
    "The Drowned Streetlamp",
    "urban noir fiction",
    "Trevor Kinyanjui",
    "serialized fiction",
    "dark fantasy",
    "reader platform",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    type: "website",
    url: "https://streetlightstory.site",
    siteName: "Streetlight",
    title: "Streetlight - The Drowned Streetlamp",
    description:
      "A rain-soaked urban noir story about memory, loneliness, and survival by Trevor Kinyanjui.",
    images: [
      {
        url: "/images/book-cover.jpg",
        alt: "The Drowned Streetlamp book cover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Streetlight - The Drowned Streetlamp",
    description:
      "A rain-soaked urban noir story about memory, loneliness, and survival by Trevor Kinyanjui.",
    images: ["/images/book-cover.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <Navbar />
        {children}
        <Footer />
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
