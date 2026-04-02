import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getListings } from '@/lib/data';
const listingsData = getListings();

interface ListingItem {
  id: number;
  title: string;
  slug: string;
  price: number;
  originalPrice: number;
  condition: string;
  description: string;
  images: string[];
  sellerName: string;
  phone: string;
  zalo?: string;
  province: string;
  district: string;
  address?: string;
  status: string;
  manageCode: string;
  createdAt: string;
}

function conditionBadgeClass(condition: string) {
  switch (condition) {
    case 'Mới 100%': return 'bg-green-100 text-green-800';
    case 'Mới 99%': return 'bg-yellow-100 text-yellow-800';
    case 'Mới 95%': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function formatVND(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default async function ThanhLyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = (listingsData as ListingItem[]).find(l => l.slug === slug);

  if (!listing) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/thanh-ly" className="text-accent hover:underline text-sm mb-6 inline-block">
        &larr; Quay lại danh sách thanh lý
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image gallery */}
        <div className="space-y-3">
          <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl" />
          {listing.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {listing.images.slice(1).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg"
                />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <span className={`badge ${conditionBadgeClass(listing.condition)} mb-3`}>
            {listing.condition}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-4">{listing.title}</h1>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-accent">{formatVND(listing.price)}</span>
            {listing.originalPrice > listing.price && (
              <span className="text-lg text-gray-400 line-through">{formatVND(listing.originalPrice)}</span>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
            <h3 className="font-semibold text-gray-900">Mô tả</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Thông tin người bán</h3>
            <p className="text-sm text-gray-700 font-medium">{listing.sellerName}</p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href={`tel:${listing.phone}`} className="text-accent hover:underline">{listing.phone}</a>
            </p>
            {listing.zalo && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span className="w-4 h-4 bg-blue-500 text-white rounded text-[10px] font-bold flex items-center justify-center">Z</span>
                Zalo: {listing.zalo}
              </p>
            )}
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {[listing.address, listing.district, listing.province].filter(Boolean).join(', ')}
            </p>
            <p className="text-xs text-gray-400 pt-1">
              Ngày đăng: {formatDate(listing.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
