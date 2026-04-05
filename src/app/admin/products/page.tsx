'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, Image as ImageIcon, AlertTriangle, ExternalLink, Eye, RefreshCw, Loader2 } from 'lucide-react';

type Product = any;
type Category = { id: number; name: string; slug: string };
type Brand = { id: number; name: string; slug: string };

const emptyProduct = {
  id: 0,
  name: '',
  slug: '',
  price: 0,
  originalPrice: 0,
  image: '',
  images: [] as string[],
  category: '',
  brand: '',
  description: '',
  fullDescription: '',
  features: [] as string[],
  specs: {},
  params: {} as Record<string, string>,
  inStock: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dolls, setDolls] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, dollsRes, categoriesRes, brandsRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/dolls'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/brands'),
      ]);
      const [productsData, dollsData, categoriesData, brandsData] = await Promise.all([
        productsRes.json(),
        dollsRes.json().catch(() => []),
        categoriesRes.json().catch(() => []),
        brandsRes.json().catch(() => []),
      ]);
      if (Array.isArray(productsData)) setProducts(productsData.map((p: any) => ({ ...p, _type: 'product' })));
      if (Array.isArray(dollsData)) setDolls(dollsData.map((d: any) => ({ ...d, _type: 'doll' })));
      if (Array.isArray(categoriesData)) setCategories(categoriesData);
      if (Array.isArray(brandsData)) setBrands(brandsData);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  // Load on mount + auto-refresh every 10s while crawl may be running
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Combined items
  const allItems = useMemo(() => [...products, ...dolls], [products, dolls]);

  // Helper to get category/brand names
  const getCategoryName = (slug: string) => categories.find(c => c.slug === slug)?.name || slug;
  const getBrandName = (slug: string) => brands.find(b => b.slug === slug)?.name || slug;
  const [filterBrand, setFilterBrand] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set()); // Use string keys: "product-123" or "doll-456"
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const perPage = 20;

  // Get unique brands/categories from combined data with names
  const uniqueBrands = useMemo(() => {
    const slugs = [...new Set(allItems.map(p => p.brand))].filter(Boolean).sort();
    return slugs.map(slug => ({ slug, name: getBrandName(slug) }));
  }, [allItems, brands]);

  const uniqueCategories = useMemo(() => {
    const slugs = [...new Set(allItems.map(p => p.category))].filter(Boolean).sort();
    return slugs.map(slug => ({ slug, name: getCategoryName(slug) }));
  }, [allItems, categories]);

  const filtered = useMemo(() => {
    return allItems.filter((p) => {
      if (filterType && p._type !== filterType) return false;
      if (filterBrand && p.brand !== filterBrand) return false;
      if (filterCategory && p.category !== filterCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q) && !(p.params?.code || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allItems, filterType, filterBrand, filterCategory, search]);

  // Helper to get item key
  const getItemKey = (item: any) => `${item._type}-${item.id}`;

  // Helper to get view URL
  const getViewUrl = (item: any) => item._type === 'doll' ? `/sex-dolls/${item.slug}` : `/products/${item.slug}`;

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const slugify = (text: string) =>
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openAdd = () => {
    setEditProduct({ ...emptyProduct, id: Math.max(0, ...products.map((p) => p.id)) + 1, features: [''] });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct({ ...p, features: p.features?.length ? [...p.features] : [''] });
    setShowModal(true);
  };

  const saveProduct = () => {
    if (!editProduct) return;
    const cleaned = { ...editProduct, features: editProduct.features.filter((f: string) => f.trim()) };
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === cleaned.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = cleaned; return next; }
      return [...prev, cleaned];
    });
    setShowModal(false);
    setEditProduct(null);
  };

  const [deleting, setDeleting] = useState(false);

  const callDeleteApi = async (type: 'product' | 'doll', ids: number[]) => {
    const endpoint = type === 'doll' ? '/api/admin/dolls' : '/api/admin/products';
    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      return data.success || res.ok;
    } catch {
      return false;
    }
  };

  const deleteItem = async (item: any) => {
    if (!confirm(`Delete "${item.name}"?\nImages in folder will also be deleted.`)) return;
    setDeleting(true);
    try {
      const success = await callDeleteApi(item._type, [item.id]);
      if (success) {
        if (item._type === 'doll') {
          setDolls((prev) => prev.filter((d) => d.id !== item.id));
        } else {
          setProducts((prev) => prev.filter((p) => p.id !== item.id));
        }
        setSelected((prev) => { const next = new Set(prev); next.delete(getItemKey(item)); return next; });
      } else {
        alert('Delete failed');
      }
    } finally {
      setDeleting(false);
    }
  };

  const batchDelete = async () => {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} selected items?\nImages in folders will also be deleted.`)) return;
    setDeleting(true);
    try {
      // Group by type
      const productIds: number[] = [];
      const dollIds: number[] = [];
      selected.forEach(key => {
        const [type, id] = key.split('-');
        if (type === 'product') productIds.push(Number(id));
        else if (type === 'doll') dollIds.push(Number(id));
      });
      // Delete in parallel
      const results = await Promise.all([
        productIds.length ? callDeleteApi('product', productIds) : true,
        dollIds.length ? callDeleteApi('doll', dollIds) : true,
      ]);
      if (results.every(r => r)) {
        setProducts((prev) => prev.filter((p) => !productIds.includes(p.id)));
        setDolls((prev) => prev.filter((d) => !dollIds.includes(d.id)));
        setSelected(new Set());
      } else {
        alert('Some items failed to delete');
      }
    } finally {
      setDeleting(false);
    }
  };

  const deleteAll = async () => {
    setDeleting(true);
    try {
      const productIds = products.map(p => p.id);
      const dollIds = dolls.map(d => d.id);
      const results = await Promise.all([
        productIds.length ? callDeleteApi('product', productIds) : true,
        dollIds.length ? callDeleteApi('doll', dollIds) : true,
      ]);
      if (results.every(r => r)) {
        setProducts([]);
        setDolls([]);
        setSelected(new Set());
        setShowDeleteAll(false);
      } else {
        alert('Some items failed to delete');
      }
    } finally {
      setDeleting(false);
    }
  };

  const toggleAll = () => {
    if (paginated.every((p) => selected.has(getItemKey(p)))) {
      setSelected((prev) => { const next = new Set(prev); paginated.forEach((p) => next.delete(getItemKey(p))); return next; });
    } else {
      setSelected((prev) => { const next = new Set(prev); paginated.forEach((p) => next.add(getItemKey(p))); return next; });
    }
  };

  const formatPrice = (n: number) => 'A$' + n.toFixed(2);

  const getSourceUrl = (p: Product) => p.params?.sourceUrl || '';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
        <Loader2 size={24} className="animate-spin" />
        <span>Loading products...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">All Products</h2>
            <p className="text-sm text-gray-500">{products.length} products + {dolls.length} dolls = {allItems.length} total</p>
          </div>
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" title="Refresh">
            <RefreshCw size={18} />
          </button>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <button onClick={batchDelete} disabled={deleting} className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50">
              <Trash2 size={16} /> {deleting ? 'Deleting...' : `Delete (${selected.size})`}
            </button>
          )}
          {products.length > 0 && (
            <button onClick={() => setShowDeleteAll(true)} disabled={deleting} className="flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50">
              <Trash2 size={16} /> Delete All
            </button>
          )}
          <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-[#262260] text-white rounded-lg text-sm font-medium hover:bg-[#1e1b4b]">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Tìm tên, slug, SKU..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
        />
        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">All Types</option>
          <option value="product">Products ({products.length})</option>
          <option value="doll">Sex Dolls ({dolls.length})</option>
        </select>
        {uniqueBrands.length > 0 && (
          <select value={filterBrand} onChange={(e) => { setFilterBrand(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Brands ({uniqueBrands.length})</option>
            {uniqueBrands.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
          </select>
        )}
        {uniqueCategories.length > 0 && (
          <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Categories ({uniqueCategories.length})</option>
            {uniqueCategories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        )}
        <span className="text-sm text-gray-500 self-center ml-auto">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-3 text-left w-10">
                <input type="checkbox" checked={paginated.length > 0 && paginated.every((p) => selected.has(getItemKey(p)))} onChange={toggleAll} className="rounded" />
              </th>
              <th className="p-3 text-left w-16">Image</th>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Brand</th>
              <th className="p-3 text-right">Price</th>
              <th className="p-3 text-right">RRP</th>
              <th className="p-3 text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p) => (
              <tr key={getItemKey(p)} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3">
                  <input type="checkbox" checked={selected.has(getItemKey(p))} onChange={() => {
                    const key = getItemKey(p);
                    setSelected((prev) => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });
                  }} className="rounded" />
                </td>
                <td className="p-3">
                  <div className={`w-12 ${p._type === 'doll' ? 'h-16' : 'h-12'} bg-gray-100 rounded-lg overflow-hidden`}>
                    {p.image && p.image !== '/images/products/placeholder.jpg' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ImageIcon size={18} className="text-gray-400" /></div>
                    )}
                  </div>
                </td>
                <td className="p-3 max-w-[250px]">
                  <p className="font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 truncate">{p.slug}</p>
                  {p.params?.code && <p className="text-xs text-gray-400">SKU: {p.params.code}</p>}
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${p._type === 'doll' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'}`}>
                    {p._type === 'doll' ? 'Doll' : 'Product'}
                  </span>
                </td>
                <td className="p-3">
                  <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full font-medium">{getCategoryName(p.category)}</span>
                </td>
                <td className="p-3">
                  <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium">{getBrandName(p.brand)}</span>
                </td>
                <td className="p-3 text-right font-bold text-red-600 whitespace-nowrap">{formatPrice(p.price)}</td>
                <td className="p-3 text-right text-gray-400 whitespace-nowrap">
                  {p.originalPrice && p.originalPrice > p.price ? (
                    <span className="line-through">{formatPrice(p.originalPrice)}</span>
                  ) : '-'}
                </td>
                <td className="p-3">
                  <div className="flex gap-1 justify-center">
                    {(getSourceUrl(p) || p.sourceUrl) && (
                      <a href={getSourceUrl(p) || p.sourceUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Source">
                        <ExternalLink size={16} />
                      </a>
                    )}
                    {p.slug && (
                      <a href={getViewUrl(p)} target="_blank" rel="noopener noreferrer" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="View">
                        <Eye size={16} />
                      </a>
                    )}
                    <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => deleteItem(p)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={9} className="p-12 text-center text-gray-400">
                  <ImageIcon size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">No products yet</p>
                  <p className="text-sm mt-1">Go to <a href="/admin/crawl" className="text-indigo-600 hover:underline">Import data</a> to import products</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40">
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
            const n = totalPages <= 10 ? i + 1 : (page <= 5 ? i + 1 : page - 5 + i + 1);
            if (n > totalPages) return null;
            return (
              <button key={n} onClick={() => setPage(n)} className={`w-9 h-9 rounded-lg text-sm font-medium ${n === page ? 'bg-[#262260] text-white' : 'hover:bg-gray-200 text-gray-700'}`}>
                {n}
              </button>
            );
          })}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40">
            <ChevronRight size={18} />
          </button>
          <span className="text-xs text-gray-400 ml-2">Trang {page}/{totalPages}</span>
        </div>
      )}

      {/* Delete All Confirmation */}
      {showDeleteAll && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteAll(false)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-semibold">Delete All?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">Delete all {allItems.length} items ({products.length} products + {dolls.length} dolls). This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteAll(false)} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50">Cancel</button>
              <button onClick={deleteAll} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700">Delete All</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && editProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold">{products.find((p) => p.id === editProduct.id) ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => { setShowModal(false); setEditProduct(null); }} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input type="text" value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value, slug: slugify(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input type="text" value={editProduct.slug} onChange={(e) => setEditProduct({ ...editProduct, slug: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (AUD)</label>
                  <input type="number" step="0.01" value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RRP (AUD)</label>
                  <input type="number" step="0.01" value={editProduct.originalPrice} onChange={(e) => setEditProduct({ ...editProduct, originalPrice: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input type="text" value={editProduct.brand} onChange={(e) => setEditProduct({ ...editProduct, brand: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input type="text" value={editProduct.category} onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={editProduct.description} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Description (HTML)</label>
                <textarea rows={5} value={editProduct.fullDescription} onChange={(e) => setEditProduct({ ...editProduct, fullDescription: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-xs" />
              </div>

              {/* Images preview */}
              {editProduct.images?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Images ({editProduct.images.length})</label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {editProduct.images.map((img: string, i: number) => (
                      <div key={i} className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Image ${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source URL */}
              {editProduct.params?.sourceUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <a href={editProduct.params.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    <ExternalLink size={14} /> {editProduct.params.sourceUrl}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">In Stock</label>
                <button onClick={() => setEditProduct({ ...editProduct, inStock: !editProduct.inStock })} className={`relative w-11 h-6 rounded-full transition-colors ${editProduct.inStock ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${editProduct.inStock ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button onClick={saveProduct} className="flex-1 py-2.5 bg-[#262260] text-white rounded-lg text-sm font-medium hover:bg-[#1e1b4b]">Save</button>
                <button onClick={() => { setShowModal(false); setEditProduct(null); }} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
