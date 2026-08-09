import type { Metadata } from "next";
import { Geist, Manrope, Playfair_Display } from "next/font/google";
import FadeInObserver from "@/components/FadeInObserver";
import BirthdayPopup from "@/components/BirthdayPopup";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { SITE_URL } from "@/lib/constants";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Faiz Rahim | Product Designer & Frontend Developer",
    template: "%s | Faiz Rahim",
  },
  description: "Portfolio of Faiz Rahim, a Product Designer and Frontend Developer creating thoughtful digital products, SaaS platforms, and user experiences through design and code.",
  applicationName: "Faiz Rahim Portfolio",
  authors: [{ name: "Faiz Rahim" }],
  creator: "Faiz Rahim",
  publisher: "Faiz Rahim",
  category: "Technology",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  keywords: [
    "Product Designer",
    "Frontend Developer",
    "UI Designer",
    "UX Designer",
    "UI UX Designer",
    "Portfolio",
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "SaaS",
    "Product Design",
    "User Experience",
    "Interaction Design",
    "Design Systems",
    "Frontend Engineering",
    "Web Design",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/Icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/Icon.png", type: "image/png", sizes: "180x180" },
    ],
  },
  openGraph: {
    title: "Faiz Rahim | Product Designer & Frontend Developer",
    description: "Creating thoughtful digital products through design and development. Explore projects, stories, and product experiences.",
    type: "website",
    locale: "en_IN",
    siteName: "Faiz Rahim",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Faiz Rahim — Product Designer & Frontend Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Faiz Rahim | Product Designer & Frontend Developer",
    description: "Designing and building products that solve real problems with simple, intuitive experiences.",
    images: ["/og-image.png"],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      "msvalidate.01": [process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || ""],
    },
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
      className={`${geist.variable} ${manrope.variable} ${playfair.variable} h-full`}
    >
      <body className="min-h-full">
        {children}
        <FadeInObserver />
        <BirthdayPopup />
        <AnalyticsTracker />
      </body>
    </html>
  );
}
