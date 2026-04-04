'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  Loader2,
  Package,
  Heart,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

type BrandSource = 'products' | 'dolls';

type Brand = {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
  content?: string;
  sourceUrl?: string;
  source?: BrandSource;
};

const emptyBrand: Brand = {
  id: 0,
  name: '',
  slug: '',
  image: '',
  description: '',
  content: '',
};

const sourceConfig = {
  products: {
    label: 'Product Brands',
    shortLabel: 'Products',
    icon: Package,
    color: 'indigo',
    bgLight: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
  },
  dolls: {
    label: 'Doll Brands',
    shortLabel: 'Dolls',
    icon: Heart,
    color: 'pink',
    bgLight: 'bg-pink-50',
    text: 'text-pink-600',
    border: 'border-pink-200',
  },
};

export default function AdminBrands() {
  const [activeSource, setActiveSource] = useState<BrandSource>('products');
  const [brands, setBrands] = useState<{ products: Brand[]; dolls: Brand[] }>({
    products: [],
    dolls: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/brands?all=true');
      const data = await res.json();
      setBrands({
        products: data.products || [],
        dolls: data.dolls || [],
      });
    } catch (err) {
      console.error('Failed to load brands:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

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
    const currentBrands = brands[activeSource];
    setEditBrand({
      ...emptyBrand,
      id: Math.max(0, ...currentBrands.map((b) => b.id)) + 1,
      source: activeSource,
    });
    setShowModal(true);
  };

  const openEdit = (b: Brand) => {
    setEditBrand({ ...b, source: activeSource });
    setShowModal(true);
  };

  const saveBrand = async () => {
    if (!editBrand) return;
    setSaving(true);

    try {
      const isNew = !brands[activeSource].find((b) => b.id === editBrand.id);
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(`/api/admin/brands?source=${activeSource}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editBrand),
      });

      if (res.ok) {
        await loadBrands();
        setShowModal(false);
        setEditBrand(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save brand');
      }
    } catch (err) {
      console.error('Failed to save brand:', err);
      alert('Failed to save brand');
    } finally {
      setSaving(false);
    }
  };

  const deleteBrand = async (id: number) => {
    if (!confirm('Ban co chac muon xoa thuong hieu nay?')) return;

    try {
      const res = await fetch(`/api/admin/brands?source=${activeSource}&id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await loadBrands();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete brand');
      }
    } catch (err) {
      console.error('Failed to delete brand:', err);
      alert('Failed to delete brand');
    }
  };

  const currentBrands = brands[activeSource];
  const filteredBrands = currentBrands.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.slug.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q)
    );
  });

  const config = sourceConfig[activeSource];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quan ly thuong hieu</h2>
          <p className="text-sm text-gray-500 mt-1">
            {brands.products.length + brands.dolls.length} thuong hieu tu{' '}
            {Object.keys(sourceConfig).length} nguon
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadBrands}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#262260] text-white rounded-lg text-sm font-medium hover:bg-[#1e1b4b]"
          >
            <Plus size={16} /> Them moi
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {(Object.keys(sourceConfig) as BrandSource[]).map((source) => {
              const cfg = sourceConfig[source];
              const Icon = cfg.icon;
              const isActive = activeSource === source;
              const count = brands[source].length;

              return (
                <button
                  key={source}
                  onClick={() => setActiveSource(source)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? `${cfg.text} border-current`
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{cfg.label}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? `${cfg.bgLight} ${cfg.text}` : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tim kiem theo ten, slug..."
            className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 size={24} className="animate-spin mx-auto text-gray-400" />
              <p className="text-sm text-gray-500 mt-2">Dang tai...</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-3 text-left w-12">ID</th>
                  <th className="p-3 text-left w-14">Logo</th>
                  <th className="p-3 text-left">Ten</th>
                  <th className="p-3 text-left">Slug</th>
                  <th className="p-3 text-left max-w-[300px]">Mo ta</th>
                  <th className="p-3 text-left w-20">Link</th>
                  <th className="p-3 text-left w-24">Hanh dong</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrands.map((b) => (
                  <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 text-gray-500">{b.id}</td>
                    <td className="p-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {b.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={18} className="text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-medium text-gray-800">{b.name}</td>
                    <td className="p-3 text-gray-500 font-mono text-xs">{b.slug}</td>
                    <td className="p-3 text-gray-600 max-w-[300px] truncate">
                      {b.description || '-'}
                    </td>
                    <td className="p-3">
                      {b.sourceUrl && (
                        <a
                          href={b.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(b)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Sua"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => deleteBrand(b.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Xoa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBrands.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      {searchQuery ? 'Khong tim thay ket qua' : 'Chua co thuong hieu nao'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        {(Object.keys(sourceConfig) as BrandSource[]).map((source) => {
          const cfg = sourceConfig[source];
          const Icon = cfg.icon;
          const count = brands[source].length;

          return (
            <div
              key={source}
              className={`bg-white rounded-xl shadow-sm border p-4 ${cfg.border}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${cfg.bgLight}`}>
                  <Icon size={20} className={cfg.text} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{count}</p>
                  <p className="text-sm text-gray-500">{cfg.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showModal && editBrand && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowModal(false);
            setEditBrand(null);
          }}
        >
          <div
            className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold">
                  {brands[activeSource].find((b) => b.id === editBrand.id)
                    ? 'Sua thuong hieu'
                    : 'Them thuong hieu'}
                </h3>
                <p className="text-sm text-gray-500">{config.label}</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditBrand(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ten thuong hieu *
                  </label>
                  <input
                    type="text"
                    value={editBrand.name}
                    onChange={(e) =>
                      setEditBrand({
                        ...editBrand,
                        name: e.target.value,
                        slug: slugify(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="VD: Satisfyer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={editBrand.slug}
                    onChange={(e) => setEditBrand({ ...editBrand, slug: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 font-mono"
                    placeholder="satisfyer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Logo</label>
                <input
                  type="text"
                  value={editBrand.image || ''}
                  onChange={(e) => setEditBrand({ ...editBrand, image: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="/images/brands/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mo ta ngan</label>
                <textarea
                  rows={2}
                  value={editBrand.description}
                  onChange={(e) => setEditBrand({ ...editBrand, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Mo ta ngan gon ve thuong hieu..."
                />
              </div>

              {activeSource === 'products' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Noi dung chi tiet (HTML)
                  </label>
                  <textarea
                    rows={6}
                    value={editBrand.content || ''}
                    onChange={(e) => setEditBrand({ ...editBrand, content: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                    placeholder="<p>Noi dung HTML...</p>"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL nguon</label>
                <input
                  type="text"
                  value={editBrand.sourceUrl || ''}
                  onChange={(e) => setEditBrand({ ...editBrand, sourceUrl: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={saveBrand}
                  disabled={saving || !editBrand.name}
                  className="flex-1 py-2.5 bg-[#262260] text-white rounded-lg text-sm font-medium hover:bg-[#1e1b4b] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Luu
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditBrand(null);
                  }}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Huy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
