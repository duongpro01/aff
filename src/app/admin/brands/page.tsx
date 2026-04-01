'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Image as ImageIcon } from 'lucide-react';
import brandsData from '@/data/brands.json';

type Brand = {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
  content: string;
};

const emptyBrand: Brand = {
  id: 0,
  name: '',
  slug: '',
  image: '/images/brands/placeholder.jpg',
  description: '',
  content: '',
};

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>(brandsData as Brand[]);
  const [showModal, setShowModal] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const openAdd = () => {
    setEditBrand({ ...emptyBrand, id: Math.max(0, ...brands.map((b) => b.id)) + 1 });
    setShowModal(true);
  };

  const openEdit = (b: Brand) => {
    setEditBrand({ ...b });
    setShowModal(true);
  };

  const saveBrand = () => {
    if (!editBrand) return;
    setBrands((prev) => {
      const idx = prev.findIndex((b) => b.id === editBrand.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = editBrand;
        return next;
      }
      return [...prev, editBrand];
    });
    setShowModal(false);
    setEditBrand(null);
  };

  const deleteBrand = (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa thương hiệu này?')) return;
    setBrands((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý thương hiệu</h2>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-[#262260] text-white rounded-lg text-sm font-medium hover:bg-[#1e1b4b]">
          <Plus size={16} /> Thêm thương hiệu
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Logo</th>
              <th className="p-3 text-left">Tên</th>
              <th className="p-3 text-left">Slug</th>
              <th className="p-3 text-left">Mô tả</th>
              <th className="p-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 text-gray-500">{b.id}</td>
                <td className="p-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon size={18} className="text-gray-400" />
                  </div>
                </td>
                <td className="p-3 font-medium text-gray-800">{b.name}</td>
                <td className="p-3 text-gray-500">{b.slug}</td>
                <td className="p-3 text-gray-600 max-w-[300px] truncate">{b.description}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(b)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Sửa">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => deleteBrand(b.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">Chưa có thương hiệu nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && editBrand && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowModal(false); setEditBrand(null); }}>
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">{brands.find((b) => b.id === editBrand.id) ? 'Sửa thương hiệu' : 'Thêm thương hiệu'}</h3>
              <button onClick={() => { setShowModal(false); setEditBrand(null); }} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên thương hiệu</label>
                <input type="text" value={editBrand.name} onChange={(e) => setEditBrand({ ...editBrand, name: e.target.value, slug: slugify(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input type="text" value={editBrand.slug} onChange={(e) => setEditBrand({ ...editBrand, slug: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <ImageIcon size={28} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click để tải logo lên</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea rows={3} value={editBrand.description} onChange={(e) => setEditBrand({ ...editBrand, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung (HTML)</label>
                <textarea rows={5} value={editBrand.content} onChange={(e) => setEditBrand({ ...editBrand, content: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={saveBrand} className="flex-1 py-2.5 bg-[#262260] text-white rounded-lg text-sm font-medium hover:bg-[#1e1b4b]">Lưu</button>
                <button onClick={() => { setShowModal(false); setEditBrand(null); }} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
