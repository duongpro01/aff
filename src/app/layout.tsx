import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: {
    default: "YeuPick - Cửa hàng Pickleball chính hãng",
    template: "%s | YeuPick",
  },
  description: "YeuPick - Cửa hàng Pickleball chính hãng. Vợt, bóng, giày, phụ kiện pickleball từ các thương hiệu hàng đầu: Joola, Selkirk, Head, CRBN.",
  keywords: ["pickleball", "vợt pickleball", "pickleball việt nam", "yeupick"],
  openGraph: {
    title: "YeuPick - Cửa hàng Pickleball chính hãng",
    description: "Cửa hàng Pickleball chính hãng - Vợt, bóng, giày, phụ kiện",
    url: "https://yeupick.com",
    siteName: "YeuPick",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
