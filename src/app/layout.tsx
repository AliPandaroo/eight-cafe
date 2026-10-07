import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";

const dana = localFont({
  src: [
    {
      path: "../fonts/DanaFaNum-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/DanaFaNum-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/DanaFaNum-DemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/DanaFaNum-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-dana",
  display: "swap",
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  title: "منوآپ | Eight 8",
  description: "منوی دیجیتال ۸ | Eight",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      lang="fa"
      dir="rtl"
      className={`${dana.variable} ${dana.className} ${vazirmatn.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-background font-sans text-text"
      >
        {children}
      </body>
    </html>
  );
}
