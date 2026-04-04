'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Trash2, ChevronLeft, ChevronRight, Image as ImageIcon, ExternalLink, Eye, RefreshCw, Loader2, CheckSquare, Square } from 'lucide-react';
import Link from 'next/link';

type Doll = {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  brand: string;
  category: string;
  material?: string;
  height?: string;
  cupSize?: string;
  bodyType?: string;
  inStock: boolean;
  sourceUrl?: string;
};

export default function AdminDolls() {
  const [dolls, setDolls] = useState<Doll[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDolls = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dolls');
      const data = await res.json();
      if (Array.isArray(data)) setDolls(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchDolls();
    const interval = setInterval(fetchDolls, 10000);
    return () => clearInterval(interval);
  }, [fetchDolls]);

  const [filterBrand, setFilterBrand] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const perPage = 20;

  const uniqueBrands = useMemo(() => [...new Set(dolls.map(d => d.brand))].filter(Boolean).sort(), [dolls]);
  const uniqueCategories = useMemo(() => [...new Set(dolls.map(d => d.category))].filter(Boolean).sort(), [dolls]);
  const uniqueMaterials = useMemo(() => [...new Set(dolls.map(d => d.material))].filter(Boolean).sort(), [dolls]);

  const filtered = useMemo(() => {
    return dolls.filter((d) => {
      if (filterBrand && d.brand !== filterBrand) return false;
      if (filterCategory && d.category !== filterCategory) return false;
      if (filterMaterial && d.material !== filterMaterial) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!d.name.toLowerCase().includes(q) && !d.slug.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [dolls, filterBrand, filterCategory, filterMaterial, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (paginated.every(d => selected.has(d.id))) {
      setSelected(prev => {
        const next = new Set(prev);
        paginated.forEach(d => next.delete(d.id));
        return next;
      });
    } else {
      setSelected(prev => {
        const next = new Set(prev);
        paginated.forEach(d => next.add(d.id));
        return next;
      });
    }
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} dolls and their images?`)) return;

    setDeleting(true);
    try {
      const res = await fetch('/api/admin/dolls', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (res.ok) {
        setDolls(prev => prev.filter(d => !selected.has(d.id)));
        setSelected(new Set());
      }
    } catch { /* ignore */ }
    finally { setDeleting(false); }
  };

  const formatPrice = (price: number) => '$' + price.toLocaleString();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Sex Dolls ({dolls.length})</h2>
        <div className="flex gap-2">
          <button onClick={fetchDolls} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
            <RefreshCw size={14} /> Refresh
          </button>
          <Link href="/admin/crawl-dolls" className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700">
            Crawl More
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={filterBrand}
            onChange={(e) => { setFilterBrand(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Brands ({uniqueBrands.length})</option>
            {uniqueBrands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Categories ({uniqueCategories.length})</option>
            {uniqueCategories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={filterMaterial}
            onChange={(e) => { setFilterMaterial(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Materials</option>
            {uniqueMaterials.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      {selected.size > 0 && (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-pink-800 font-medium">{selected.size} selected</span>
          <button
            onClick={deleteSelected}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <Loader2 size={24} className="animate-spin mx-auto mb-2" />
            Loading...
          </div>
        ) : dolls.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No dolls imported yet.</p>
            <Link href="/admin/crawl-dolls" className="text-pink-600 hover:underline mt-2 inline-block">
              Go to Crawl page to import dolls
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-3 text-left">
                      <button onClick={toggleSelectAll} className="text-gray-500 hover:text-gray-700">
                        {paginated.every(d => selected.has(d.id)) && paginated.length > 0
                          ? <CheckSquare size={16} />
                          : <Square size={16} />}
                      </button>
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700">Image</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700">Brand</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700">Material</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700">Specs</th>
                    <th className="px-3 py-3 text-right font-semibold text-gray-700">Price</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map((doll) => (
                    <tr key={doll.id} className={`hover:bg-gray-50 ${selected.has(doll.id) ? 'bg-pink-50' : ''}`}>
                      <td className="px-3 py-2">
                        <button onClick={() => toggleSelect(doll.id)} className="text-gray-500 hover:text-gray-700">
                          {selected.has(doll.id)
                            ? <CheckSquare size={16} className="text-pink-600" />
                            : <Square size={16} />}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden">
                          {doll.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={doll.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ImageIcon size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="max-w-[250px]">
                          <p className="font-medium text-gray-900 truncate">{doll.name}</p>
                          <p className="text-xs text-gray-400 truncate">{doll.slug}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded-full">
                          {doll.brand || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-xs text-gray-600">{doll.material || '-'}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs text-gray-500 space-y-0.5">
                          {doll.height && <div>{doll.height}</div>}
                          {doll.cupSize && <div>{doll.cupSize}</div>}
                          {doll.bodyType && <div>{doll.bodyType}</div>}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="font-bold text-pink-600">{formatPrice(doll.price)}</span>
                        {doll.originalPrice && doll.originalPrice > doll.price && (
                          <div className="text-xs text-gray-400 line-through">{formatPrice(doll.originalPrice)}</div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/sex-dolls/${doll.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="View"
                          >
                            <Eye size={14} />
                          </Link>
                          {doll.sourceUrl && (
                            <a
                              href={doll.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                              title="Source"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              if (confirm('Delete this doll?')) {
                                fetch('/api/admin/dolls', {
                                  method: 'DELETE',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ ids: [doll.id] }),
                                }).then(() => fetchDolls());
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = page <= 3 ? i + 1 : page + i - 2;
                    if (p < 1 || p > totalPages) return null;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded text-sm ${p === page ? 'bg-pink-600 text-white' : 'hover:bg-gray-100'}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
