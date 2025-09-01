import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Somnia in Streams",
  description: "Live royalty streams for Somnia in Streams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark antialiased">
      <body
        className={`${poppins.variable} antialiased`}
      >
          <Suspense fallback={null}>{children}</Suspense>
          <Analytics />
      </body>
    </html>
  );
}
