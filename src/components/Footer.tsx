import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const quickLinks = [
  { label: "Sản phẩm", href: "/products" },
  { label: "Tin tức", href: "/tin-tuc" },
  { label: "Thanh lý", href: "/thanh-ly" },
  { label: "So sánh", href: "/so-sanh" },
];

const toolLinks = [
  { label: "Bảng xếp hạng", href: "/ranking" },
  { label: "Tính điểm", href: "/ranking-calculator" },
  { label: "Giải đấu", href: "/tournaments" },
  { label: "Bảng tỷ số", href: "/scoreboard" },
];

export default function Footer() {
  return (
    <footer className="bg-[#262260] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Branding */}
          <div>
            <Link href="/" className="text-2xl font-bold tracking-tight">
              YeuPick
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/80">
              YeuPick - Cửa hàng pickleball uy tín hàng đầu Việt Nam. Chuyên
              cung cấp vợt, phụ kiện và trang phục pickleball chính hãng với giá
              tốt nhất.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a
                href="https://facebook.com/yeupick"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com/@yeupick"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
              >
                <YoutubeIcon className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/yeupick"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
              >
                <TwitterIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-base font-semibold">Liên kết nhanh</h3>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Tools */}
          <div>
            <h3 className="text-base font-semibold">Công cụ</h3>
            <ul className="mt-4 space-y-3">
              {toolLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-base font-semibold">Liên hệ</h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/60" />
                <a
                  href="mailto:contact@yeupick.com"
                  className="text-sm text-white/80 transition-colors hover:text-white"
                >
                  contact@yeupick.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/60" />
                <a
                  href="tel:0909000000"
                  className="text-sm text-white/80 transition-colors hover:text-white"
                >
                  0909 xxx xxx
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/60" />
                <span className="text-sm text-white/80">
                  Quận 1, TP. Hồ Chí Minh, Việt Nam
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-white/60">
            &copy; 2024 YeuPick. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
