import type { Metadata } from "next";
import { Manjari } from "next/font/google";
import "./globals.css";

const manjari = Manjari({
  weight: ["100", "400", "700"],
  subsets: ["latin"],
  variable: "--font-manjari",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.profitzonebd.com"),
  title: {
    default: "ProfitZoneBD | সেরা আর্নিং প্ল্যাটফর্ম",
    template: "%s | ProfitZoneBD"
  },
  description: "বাংলাদেশের বিশ্বস্ত ও সেরা মাইক্রোজব (Micro Job) প্ল্যাটফর্ম। সহজ কাজ করে আয় করুন, প্যাকেজ আপগ্রেড করুন এবং বিকাশ বা নগদে সাথে সাথে পেমেন্ট নিন।",
  keywords: ["ProfitZoneBD", "Micro job platform Bangladesh", "Online earning BD", "Earn money online", "Bikash payment", "Nagad payment", "Make money from home", "অনলাইনে আয়", "মাইক্রোজব"],
  authors: [{ name: "ProfitZoneBD Team" }],
  creator: "ProfitZoneBD",
  publisher: "ProfitZoneBD",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "ProfitZoneBD | বাংলাদেশের সেরা মাইক্রোজব প্ল্যাটফর্ম",
    description: "সহজ কাজ করে আয় করুন, বিকাশ বা নগদে সাথে সাথে পেমেন্ট নিন। আজই যোগ দিন ProfitZoneBD-তে!",
    url: "https://www.profitzonebd.com",
    siteName: "ProfitZoneBD",
    locale: "bn_BD",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "yours-google-site-verification-code", // Note: The user will need to change this if they have a real code
  },
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
