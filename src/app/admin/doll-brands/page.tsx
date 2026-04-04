'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Save } from 'lucide-react';

type Brand = {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
};

const emptyBrand: Brand = {
  id: 0,
  name: '',
  slug: '',
  image: '',
  description: '',
};

export default function AdminDollBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/doll-brands');
      const data = await res.json();
      if (Array.isArray(data)) setBrands(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const openAdd = () => {
    setEditBrand({ ...emptyBrand });
    setShowModal(true);
  };

  const openEdit = (brand: Brand) => {
    setEditBrand({ ...brand });
    setShowModal(true);
  };

  const saveBrand = async () => {
    if (!editBrand || !editBrand.name) return;

    setSaving(true);
    try {
      const isNew = !editBrand.id;
      const method = isNew ? 'POST' : 'PUT';

      const slug = editBrand.slug || editBrand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const res = await fetch('/api/admin/doll-brands', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editBrand, slug }),
      });

      if (res.ok) {
        await fetchBrands();
        setShowModal(false);
        setEditBrand(null);
      }
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const deleteBrand = async (id: number) => {
    if (!confirm('Delete this brand?')) return;

    try {
      const res = await fetch('/api/admin/doll-brands', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setBrands(prev => prev.filter(b => b.id !== id));
      }
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Doll Brands ({brands.length})</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700"
        >
          <Plus size={16} /> Add Brand
        </button>
      </div>

      {/* Brands Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <Loader2 size={24} className="animate-spin mx-auto mb-2" />
            Loading...
          </div>
        ) : brands.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No brands yet. Click &quot;Add Brand&quot; to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {brands.map((brand) => (
              <div key={brand.id} className="border border-gray-200 rounded-lg p-4 hover:border-pink-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                    <p className="text-xs text-gray-400">{brand.slug}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(brand)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteBrand(brand.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {brand.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{brand.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && editBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                {editBrand.id ? 'Edit Brand' : 'Add Brand'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={editBrand.name}
                  onChange={(e) => setEditBrand({ ...editBrand, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. WM Doll"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={editBrand.slug}
                  onChange={(e) => setEditBrand({ ...editBrand, slug: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="auto-generated from name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editBrand.image}
                  onChange={(e) => setEditBrand({ ...editBrand, image: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editBrand.description}
                  onChange={(e) => setEditBrand({ ...editBrand, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Brand description..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveBrand}
                disabled={saving || !editBrand.name}
                className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
