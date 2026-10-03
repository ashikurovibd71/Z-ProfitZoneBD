import type { Metadata } from "next";
import { Manjari } from "next/font/google";
import "./globals.css";

const manjari = Manjari({
  weight: ["100", "400", "700"],
  subsets: ["latin"],
  variable: "--font-manjari",
});

export const metadata: Metadata = {
  title: "ProfitZoneBD | Micro Job Platform",
  description: "Turn your time into real earnings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manjari.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-black text-white">{children}</body>
    </html>
  );
}
