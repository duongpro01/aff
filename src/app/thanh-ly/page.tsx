'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Plus, Search, Tag } from 'lucide-react';
const listingsData: any[] = [];

const PROVINCES = [
  'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'Biên Hòa', 'Nha Trang', 'Huế', 'Bắc Ninh', 'Thanh Hóa',
];

const CONDITIONS = ['Mới 100%', 'Mới 99%', 'Mới 95%', 'Đã qua sử dụng'];

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

function generateManageCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

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

export default function ThanhLyPage() {
  const approvedListings = (listingsData as ListingItem[]).filter(l => l.status === 'approved');

  // Filters
  const [province, setProvince] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Form
  const [formData, setFormData] = useState({
    title: '', price: '', originalPrice: '', condition: 'Mới 100%',
    description: '', sellerName: '', phone: '', zalo: '',
    province: '', district: '', address: '',
  });
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  // Manage
  const [manageCode, setManageCode] = useState('');
  const [manageLookup, setManageLookup] = useState<ListingItem | null>(null);
  const [manageNotFound, setManageNotFound] = useState(false);

  const filteredListings = useMemo(() => {
    return approvedListings.filter(l => {
      if (province && l.province !== province) return false;
      if (selectedConditions.length > 0 && !selectedConditions.includes(l.condition)) return false;
      if (minPrice && l.price < Number(minPrice)) return false;
      if (maxPrice && l.price > Number(maxPrice)) return false;
      return true;
    });
  }, [approvedListings, province, selectedConditions, minPrice, maxPrice]);

  function toggleCondition(c: string) {
    setSelectedConditions(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = generateManageCode();
    setSubmitResult(code);
  }

  function handleLookup() {
    const found = (listingsData as ListingItem[]).find(l => l.manageCode === manageCode);
    if (found) {
      setManageLookup(found);
      setManageNotFound(false);
    } else {
      setManageLookup(null);
      setManageNotFound(true);
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mua bán thanh lý Pickleball</h1>
          <p className="text-gray-500 mt-1">Mua bán, trao đổi vợt và phụ kiện pickleball đã qua sử dụng</p>
        </div>
        <a
          href="#dang-tin"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Đăng tin
        </a>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          {/* Province */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tỉnh/Thành phố</label>
            <select
              value={province}
              onChange={e => setProvince(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
            >
              <option value="">Tất cả</option>
              {PROVINCES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Tình trạng</p>
            {CONDITIONS.map(c => (
              <label key={c} className="flex items-center gap-2 mb-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedConditions.includes(c)}
                  onChange={() => toggleCondition(c)}
                  className="rounded border-gray-300 text-accent focus:ring-accent"
                />
                <span className="text-sm text-gray-600">{c}</span>
              </label>
            ))}
          </div>

          {/* Price range */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Khoảng giá</p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>
          </div>
        </aside>

        {/* Listing grid */}
        <section className="flex-1">
          {filteredListings.length === 0 ? (
            <p className="text-gray-500 text-center py-12">Không tìm thấy tin đăng phù hợp.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredListings.map(listing => (
                <Link
                  key={listing.id}
                  href={`/thanh-ly/${listing.slug}`}
                  className="product-card bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Placeholder image */}
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 relative">
                    <span className={`badge absolute top-2 left-2 ${conditionBadgeClass(listing.condition)}`}>
                      {listing.condition}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{listing.title}</h3>
                    <p className="text-accent font-bold text-base mb-1.5">
                      <Tag className="w-3.5 h-3.5 inline mr-1" />
                      {formatVND(listing.price)}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <MapPin className="w-3 h-3" />
                      {listing.province}
                    </div>
                    <p className="text-xs text-gray-400">{listing.sellerName}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Dang tin form */}
      <section id="dang-tin" className="mt-16 max-w-2xl mx-auto scroll-mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Plus className="w-6 h-6 text-accent" />
          Đăng tin thanh lý
        </h2>

        {submitResult ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-green-800 font-semibold text-lg mb-2">Đăng tin thành công!</p>
            <p className="text-green-700 mb-1">Mã quản lý tin của bạn:</p>
            <p className="text-2xl font-mono font-bold text-green-900 mb-3">{submitResult}</p>
            <p className="text-sm text-green-600">Hãy lưu lại mã này để quản lý tin đăng của bạn.</p>
            <button
              onClick={() => setSubmitResult(null)}
              className="mt-4 text-sm text-accent hover:underline"
            >
              Đăng tin mới
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-gray-200 rounded-xl p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề tin</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
                placeholder="VD: Thanh lý vợt Joola Perseus mới 99%"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ)</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
                  placeholder="3500000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc (VNĐ)</label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
                  placeholder="4990000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng</label>
              <select
                value={formData.condition}
                onChange={e => setFormData({ ...formData, condition: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
              >
                {CONDITIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
                placeholder="Mô tả tình trạng sản phẩm, lý do bán..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh (tối đa 5)</label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <label
                    key={i}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-accent transition-colors"
                  >
                    <Plus className="w-6 h-6 text-gray-400" />
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                ))}
              </div>
            </div>

            <hr className="my-4" />
            <p className="text-sm font-semibold text-gray-700">Thông tin người bán</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                <input
                  type="text"
                  required
                  value={formData.sellerName}
                  onChange={e => setFormData({ ...formData, sellerName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zalo (nếu khác SĐT)</label>
              <input
                type="tel"
                value={formData.zalo}
                onChange={e => setFormData({ ...formData, zalo: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                <select
                  required
                  value={formData.province}
                  onChange={e => setFormData({ ...formData, province: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
                >
                  <option value="">Chọn tỉnh/thành</option>
                  {PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-light text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Đăng tin
            </button>
          </form>
        )}
      </section>

      {/* Quan ly tin */}
      <section className="mt-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Search className="w-6 h-6 text-primary" />
          Quản lý tin
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-500 mb-3">Nhập mã quản lý để tra cứu tin đăng của bạn</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={manageCode}
              onChange={e => setManageCode(e.target.value)}
              placeholder="VD: TL2026001"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
            />
            <button
              onClick={handleLookup}
              className="bg-primary hover:bg-primary-light text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Tra cứu
            </button>
          </div>

          {manageLookup && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-gray-900">{manageLookup.title}</h3>
              <p className="text-accent font-bold">{formatVND(manageLookup.price)}</p>
              <p className="text-sm text-gray-600">
                <span className={`badge ${conditionBadgeClass(manageLookup.condition)}`}>{manageLookup.condition}</span>
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {manageLookup.province}, {manageLookup.district}
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {manageLookup.phone}
              </p>
              <p className="text-xs text-gray-400">
                Trạng thái: <span className="font-medium">{manageLookup.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}</span>
              </p>
            </div>
          )}

          {manageNotFound && (
            <p className="mt-4 text-sm text-red-600">Không tìm thấy tin đăng với mã này.</p>
          )}
        </div>
      </section>
    </main>
  );
}
