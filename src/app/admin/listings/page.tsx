'use client';

import { useState, useMemo } from 'react';
import { Eye, CheckCircle, XCircle, Trash2, X, Image as ImageIcon, Phone, MessageCircle } from 'lucide-react';
const listingsData: any[] = [];

type Listing = any;

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700' },
  sold: { label: 'Đã bán', color: 'bg-blue-100 text-blue-700' },
  rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-700' },
};

export default function AdminListings() {
  const [listings, setListings] = useState<Listing[]>(listingsData as Listing[]);
  const [filterStatus, setFilterStatus] = useState('');
  const [detailId, setDetailId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!filterStatus) return listings;
    return listings.filter((l) => l.status === filterStatus);
  }, [listings, filterStatus]);

  const detailListing = detailId !== null ? listings.find((l) => l.id === detailId) : null;

  const updateStatus = (id: number, status: string) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const deleteListing = (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa tin này?')) return;
    setListings((prev) => prev.filter((l) => l.id !== id));
    if (detailId === id) setDetailId(null);
  };

  const formatPrice = (n: number) => n.toLocaleString('vi-VN') + 'đ';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Quản lý tin thanh lý</h2>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap items-center gap-3">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="sold">Đã bán</option>
          <option value="rejected">Từ chối</option>
        </select>
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} tin</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Ảnh</th>
              <th className="p-3 text-left">Tiêu đề</th>
              <th className="p-3 text-left">Giá</th>
              <th className="p-3 text-left">Tình trạng</th>
              <th className="p-3 text-left">Người bán</th>
              <th className="p-3 text-left">Tỉnh/TP</th>
              <th className="p-3 text-left">Trạng thái</th>
              <th className="p-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => {
              const sc = statusConfig[l.status] || statusConfig.pending;
              return (
                <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 text-gray-500">{l.id}</td>
                  <td className="p-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon size={18} className="text-gray-400" />
                    </div>
                  </td>
                  <td className="p-3 font-medium text-gray-800 max-w-[200px] truncate">{l.title}</td>
                  <td className="p-3 text-gray-800 font-medium whitespace-nowrap">{formatPrice(l.price)}</td>
                  <td className="p-3 text-gray-600 whitespace-nowrap">{l.condition}</td>
                  <td className="p-3 text-gray-600 whitespace-nowrap">{l.sellerName}</td>
                  <td className="p-3 text-gray-600 whitespace-nowrap">{l.province}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${sc.color}`}>{sc.label}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button onClick={() => setDetailId(l.id)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg" title="Xem chi tiết">
                        <Eye size={16} />
                      </button>
                      {l.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(l.id, 'approved')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Duyệt">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => updateStatus(l.id, 'rejected')} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg" title="Từ chối">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      <button onClick={() => deleteListing(l.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Xóa">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400">Không có tin nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {detailListing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetailId(null)}>
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Chi tiết tin thanh lý</h3>
              <button onClick={() => setDetailId(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 text-lg">{detailListing.title}</h4>
                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${(statusConfig[detailListing.status] || statusConfig.pending).color}`}>
                  {(statusConfig[detailListing.status] || statusConfig.pending).label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Giá bán:</span>
                  <p className="font-semibold text-red-600">{formatPrice(detailListing.price)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Giá gốc:</span>
                  <p className="font-medium text-gray-600">{formatPrice(detailListing.originalPrice)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Tình trạng:</span>
                  <p className="font-medium">{detailListing.condition}</p>
                </div>
                <div>
                  <span className="text-gray-500">Mã quản lý:</span>
                  <p className="font-medium">{detailListing.manageCode}</p>
                </div>
              </div>

              <div className="text-sm">
                <span className="text-gray-500">Mô tả:</span>
                <p className="mt-1 text-gray-700">{detailListing.description}</p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Thông tin người bán</h5>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Tên:</span> <span className="font-medium">{detailListing.sellerName}</span></p>
                  <p className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <span>{detailListing.phone}</span>
                  </p>
                  {detailListing.zalo && (
                    <p className="flex items-center gap-2">
                      <MessageCircle size={14} className="text-blue-500" />
                      <span>Zalo: {detailListing.zalo}</span>
                    </p>
                  )}
                  <p><span className="text-gray-500">Địa chỉ:</span> {detailListing.address ? `${detailListing.address}, ` : ''}{detailListing.district}, {detailListing.province}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                {detailListing.status === 'pending' && (
                  <>
                    <button onClick={() => { updateStatus(detailListing.id, 'approved'); setDetailId(null); }} className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">Duyệt</button>
                    <button onClick={() => { updateStatus(detailListing.id, 'rejected'); setDetailId(null); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Từ chối</button>
                  </>
                )}
                <button onClick={() => setDetailId(null)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
