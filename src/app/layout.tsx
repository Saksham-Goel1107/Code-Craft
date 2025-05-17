import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import DisableZoomScript from "@/components/DisableZoomScript";
import CookieConsent from "@/components/CookieConsent";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Code Craft - An Online Code Compiler",
  description: "Share and run code snippets with your friends maintaining optimal quality and user Experience",
  metadataBase: new URL('https://code-craft-plum.vercel.app/'),
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: "Code Craft - An Online Code Compiler",
    description: "Share and run code snippets with your friends maintaining optimal quality and user Experience",
    url: 'https://code-craft-plum.vercel.app/',
    siteName: 'Code Craft',
    images: [
      {
        url: '/code-craft.png', 
        width: 1200,
        height: 630,
        alt: 'Code Craft - An Online Code Compiler',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Code Craft - An Online Code Compiler",
    description: "Share and run code snippets with your friends maintaining optimal quality and user Experience",
    images: ['/code-craft.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="mobile-web-app-capable" content="yes" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 flex flex-col`} suppressHydrationWarning
        >
          <ConvexClientProvider>{children}<CookieConsent /></ConvexClientProvider>

          <Footer />

          <Toaster />
          <DisableZoomScript />
        </body>
      </html>
    </ClerkProvider>
  );
}

// https://emkc.org/api/v2/piston/runtimes
