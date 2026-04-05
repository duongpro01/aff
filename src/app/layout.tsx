import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'VietToy';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://viettoy.vn';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Premium Adult Toys & Accessories`,
    template: `%s | ${siteName}`,
  },
  description: "Premium adult toys and accessories from top brands like Satisfyer, We-Vibe, Lelo, Lovense. Discreet shipping, authentic products, best prices.",
  keywords: ["adult toys", "sex toys", "vibrators", "couples toys", "premium adult products", siteName.toLowerCase()],
  openGraph: {
    title: `${siteName} - Premium Adult Toys & Accessories`,
    description: "Premium adult toys and accessories - Authentic products, discreet shipping",
    url: siteUrl,
    siteName: siteName,
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
