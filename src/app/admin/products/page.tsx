'use client';

import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import productsData from '@/data/products.json';
import brandsData from '@/data/brands.json';
import categoriesData from '@/data/categories.json';

type Product = (typeof productsData)[number] & { [key: string]: any };

const emptyProduct = {
  id: 0,
  name: '',
  slug: '',
  price: 0,
  originalPrice: 0,
  image: '/images/products/placeholder.jpg',
  images: [] as string[],
  category: '',
  brand: '',
  description: '',
  fullDescription: '',
  features: [] as string[],
  specs: { surface: '', core: '', thickness: '', control: 50, power: 50, weight: '' },
  params: { origin: '', supplier: '', material: '', warranty: '', shipping: '' },
  inStock: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>(productsData as Product[]);
  const [filterBrand, setFilterBrand] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterInStock, setFilterInStock] = useState<'' | 'true' | 'false'>('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const perPage = 10;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filterBrand && p.brand !== filterBrand) return false;
      if (filterCategory && p.category !== filterCategory) return false;
      if (filterInStock === 'true' && !p.inStock) return false;
      if (filterInStock === 'false' && p.inStock) return false;
      return true;
    });
  }, [products, filterBrand, filterCategory, filterInStock]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

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
    setEditProduct({ ...emptyProduct, id: Math.max(0, ...products.map((p) => p.id)) + 1, features: [''] });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct({
      ...p,
      specs: { ...emptyProduct.specs, ...p.specs },
      params: { ...emptyProduct.params, ...p.params },
      features: p.features?.length ? [...p.features] : [''],
    });
    setShowModal(true);
  };

  const saveProduct = () => {
    if (!editProduct) return;
    const cleaned = {
      ...editProduct,
      features: editProduct.features.filter((f: string) => f.trim()),
    };
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === cleaned.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = cleaned;
        return next;
      }
      return [...prev, cleaned];
    });
    setShowModal(false);
    setEditProduct(null);
  };

  const deleteProduct = (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const batchDelete = () => {
    if (!selected.size) return;
    if (!confirm(`Bạn có chắc muốn xóa ${selected.size} sản phẩm đã chọn?`)) return;
    setProducts((prev) => prev.filter((p) => !selected.has(p.id)));
    setSelected(new Set());
  };

  const deleteAll = () => {
    setProducts([]);
    setSelected(new Set());
    setShowDeleteAll(false);
  };

  const toggleAll = () => {
    if (paginated.every((p) => selected.has(p.id))) {
      setSelected((prev) => {
        const next = new Set(prev);
        paginated.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        paginated.forEach((p) => next.add(p.id));
        return next;
      });
    }
  };

  const formatPrice = (n: number) => n.toLocaleString('vi-VN') + 'đ';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h2>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <button onClick={batchDelete} className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">
              <Trash2 size={16} /> Xóa ({selected.size})
            </button>
          )}
          <button onClick={() => setShowDeleteAll(true)} className="flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200">
            <Trash2 size={16} /> Xóa tất cả
          </button>
          <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-[#262260] text-white rounded-lg text-sm font-medium hover:bg-[#1e1b4b]">
            <Plus size={16} /> Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-3">
        <select value={filterBrand} onChange={(e) => { setFilterBrand(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Tất cả thương hiệu</option>
          {brandsData.map((b) => (
            <option key={b.slug} value={b.slug}>{b.name}</option>
          ))}
        </select>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Tất cả danh mục</option>
          {categoriesData.map((c: any) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select value={filterInStock} onChange={(e) => { setFilterInStock(e.target.value as any); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Tồn kho: Tất cả</option>
          <option value="true">Còn hàng</option>
          <option value="false">Hết hàng</option>
        </select>
        <span className="text-sm text-gray-500 self-center ml-auto">{filtered.length} sản phẩm</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-3 text-left w-10">
                <input type="checkbox" checked={paginated.length > 0 && paginated.every((p) => selected.has(p.id))} onChange={toggleAll} className="rounded" />
              </th>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Ảnh</th>
              <th className="p-3 text-left">Tên</th>
              <th className="p-3 text-left">Thương hiệu</th>
              <th className="p-3 text-left">Danh mục</th>
              <th className="p-3 text-left">Giá</th>
              <th className="p-3 text-left">Tồn kho</th>
              <th className="p-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3">
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => {
                    setSelected((prev) => {
                      const next = new Set(prev);
                      next.has(p.id) ? next.delete(p.id) : next.add(p.id);
                      return next;
                    });
                  }} className="rounded" />
                </td>
                <td className="p-3 text-gray-500">{p.id}</td>
                <td className="p-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <ImageIcon size={20} className="text-gray-400" />
                  </div>
                </td>
                <td className="p-3 font-medium text-gray-800 max-w-[200px] truncate">{p.name}</td>
                <td className="p-3 text-gray-600 capitalize">{p.brand}</td>
                <td className="p-3 text-gray-600 capitalize">{p.category}</td>
                <td className="p-3 text-gray-800 font-medium whitespace-nowrap">{formatPrice(p.price)}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.inStock ? 'Còn hàng' : 'Hết hàng'}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Sửa">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400">Không có sản phẩm nào</td>
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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button key={n} onClick={() => setPage(n)} className={`w-9 h-9 rounded-lg text-sm font-medium ${n === page ? 'bg-[#262260] text-white' : 'hover:bg-gray-200 text-gray-700'}`}>
              {n}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40">
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Delete All Confirmation */}
      {showDeleteAll && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteAll(false)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-semibold">Xóa tất cả sản phẩm?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">Hành động này sẽ xóa toàn bộ {products.length} sản phẩm. Bạn không thể hoàn tác.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteAll(false)} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50">Hủy</button>
              <button onClick={deleteAll} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700">Xóa tất cả</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && editProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold">{editProduct.id && products.find((p) => p.id === editProduct.id) ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h3>
              <button onClick={() => { setShowModal(false); setEditProduct(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Name & Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                <input type="text" value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value, slug: slugify(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input type="text" value={editProduct.slug} onChange={(e) => setEditProduct({ ...editProduct, slug: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50" />
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán</label>
                  <input type="number" value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc</label>
                  <input type="number" value={editProduct.originalPrice} onChange={(e) => setEditProduct({ ...editProduct, originalPrice: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>

              {/* Brand & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                  <select value={editProduct.brand} onChange={(e) => setEditProduct({ ...editProduct, brand: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">Chọn thương hiệu</option>
                    {brandsData.map((b) => (
                      <option key={b.slug} value={b.slug}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select value={editProduct.category} onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">Chọn danh mục</option>
                    {categoriesData.map((c: any) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea rows={3} value={editProduct.description} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tính năng</label>
                {editProduct.features.map((f: string, i: number) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" value={f} onChange={(e) => {
                      const feats = [...editProduct.features];
                      feats[i] = e.target.value;
                      setEditProduct({ ...editProduct, features: feats });
                    }} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder={`Tính năng ${i + 1}`} />
                    <button onClick={() => {
                      const feats = editProduct.features.filter((_: any, j: number) => j !== i);
                      setEditProduct({ ...editProduct, features: feats.length ? feats : [''] });
                    }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                ))}
                <button onClick={() => setEditProduct({ ...editProduct, features: [...editProduct.features, ''] })} className="text-sm text-blue-600 hover:underline">+ Thêm tính năng</button>
              </div>

              {/* Specs */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Thông số kỹ thuật</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Bề mặt</label>
                    <input type="text" value={editProduct.specs.surface} onChange={(e) => setEditProduct({ ...editProduct, specs: { ...editProduct.specs, surface: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Lõi</label>
                    <input type="text" value={editProduct.specs.core} onChange={(e) => setEditProduct({ ...editProduct, specs: { ...editProduct.specs, core: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Độ dày</label>
                    <input type="text" value={editProduct.specs.thickness} onChange={(e) => setEditProduct({ ...editProduct, specs: { ...editProduct.specs, thickness: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Trọng lượng</label>
                    <input type="text" value={editProduct.specs.weight} onChange={(e) => setEditProduct({ ...editProduct, specs: { ...editProduct.specs, weight: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Control: {editProduct.specs.control}</label>
                    <input type="range" min={0} max={100} value={editProduct.specs.control} onChange={(e) => setEditProduct({ ...editProduct, specs: { ...editProduct.specs, control: Number(e.target.value) } })} className="w-full" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Power: {editProduct.specs.power}</label>
                    <input type="range" min={0} max={100} value={editProduct.specs.power} onChange={(e) => setEditProduct({ ...editProduct, specs: { ...editProduct.specs, power: Number(e.target.value) } })} className="w-full" />
                  </div>
                </div>
              </div>

              {/* Params */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Thông tin thêm</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'origin', label: 'Xuất xứ' },
                    { key: 'supplier', label: 'Nhà cung cấp' },
                    { key: 'material', label: 'Chất liệu' },
                    { key: 'warranty', label: 'Bảo hành' },
                    { key: 'shipping', label: 'Vận chuyển' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
                      <input type="text" value={editProduct.params[field.key] || ''} onChange={(e) => setEditProduct({ ...editProduct, params: { ...editProduct.params, [field.key]: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Kéo thả hoặc click để tải ảnh lên</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG tối đa 5MB</p>
                </div>
              </div>

              {/* In Stock */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Còn hàng</label>
                <button onClick={() => setEditProduct({ ...editProduct, inStock: !editProduct.inStock })} className={`relative w-11 h-6 rounded-full transition-colors ${editProduct.inStock ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${editProduct.inStock ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button onClick={saveProduct} className="flex-1 py-2.5 bg-[#262260] text-white rounded-lg text-sm font-medium hover:bg-[#1e1b4b]">Lưu</button>
                <button onClick={() => { setShowModal(false); setEditProduct(null); }} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
