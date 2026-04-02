'use client';

import { useState, useMemo } from 'react';
import { Search, X, ArrowLeftRight, Check } from 'lucide-react';
import type { Product } from '@/data/types';

// Products will be passed via window or fetched - for now read inline
const allProducts: Product[] = [];
const brands = [...new Set(allProducts.map((p) => p.brand))];

function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

function ProductSelector({
  selected,
  onSelect,
  label,
  otherSelectedId,
}: {
  selected: Product | null;
  onSelect: (p: Product | null) => void;
  label: string;
  otherSelectedId: number | null;
}) {
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      if (p.id === otherSelectedId) return false;
      const matchSearch = search === '' || p.name.toLowerCase().includes(search.toLowerCase());
      const matchBrand = brandFilter === '' || p.brand === brandFilter;
      return matchSearch && matchBrand;
    });
  }, [search, brandFilter, otherSelectedId]);

  if (selected) {
    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-white">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase">{label}</span>
          <button
            onClick={() => {
              onSelect(null);
              setSearch('');
              setBrandFilter('');
            }}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-error hover:bg-red-50 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] text-center text-gray-600 font-medium px-1 leading-tight">
              {selected.name.slice(0, 25)}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 line-clamp-2">{selected.name}</p>
            <p className="text-sm font-bold text-accent mt-1">{formatPrice(selected.price)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <span className="text-xs font-semibold text-gray-400 uppercase block mb-3">{label}</span>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tim san pham..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        />
      </div>

      <select
        value={brandFilter}
        onChange={(e) => {
          setBrandFilter(e.target.value);
          setIsOpen(true);
        }}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white"
      >
        <option value="">Tat ca thuong hieu</option>
        {brands.map((b) => (
          <option key={b} value={b}>
            {b.charAt(0).toUpperCase() + b.slice(1)}
          </option>
        ))}
      </select>

      {isOpen && (
        <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Khong tim thay san pham</p>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelect(p);
                  setIsOpen(false);
                  setSearch('');
                }}
                className="w-full text-left px-3 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.name}</p>
                <p className="text-xs text-accent font-semibold">{formatPrice(p.price)}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface ComparisonRow {
  label: string;
  key: string;
  getValue: (p: Product) => string | number | boolean | undefined;
  compare?: 'lower' | 'higher';
  type?: 'bar' | 'boolean' | 'text';
}

const comparisonRows: ComparisonRow[] = [
  {
    label: 'Gia',
    key: 'price',
    getValue: (p) => p.price,
    compare: 'lower',
  },
  {
    label: 'Thuong hieu',
    key: 'brand',
    getValue: (p) => p.params?.brand || p.brand,
    type: 'text',
  },
  {
    label: 'Danh muc',
    key: 'category',
    getValue: (p) => p.category,
    type: 'text',
  },
  {
    label: 'Rating',
    key: 'rating',
    getValue: (p) => p.rating,
    compare: 'higher',
  },
  {
    label: 'Surface',
    key: 'surface',
    getValue: (p) => p.specs?.surface,
    type: 'text',
  },
  {
    label: 'Core',
    key: 'core',
    getValue: (p) => p.specs?.core,
    type: 'text',
  },
  {
    label: 'Thickness',
    key: 'thickness',
    getValue: (p) => p.specs?.thickness,
    type: 'text',
  },
  {
    label: 'Control',
    key: 'control',
    getValue: (p) => p.specs?.control,
    compare: 'higher',
    type: 'bar',
  },
  {
    label: 'Power',
    key: 'power',
    getValue: (p) => p.specs?.power,
    compare: 'higher',
    type: 'bar',
  },
  {
    label: 'Weight',
    key: 'weight',
    getValue: (p) => p.specs?.weight,
    type: 'text',
  },
  {
    label: 'USAPA Approved',
    key: 'usapa',
    getValue: (p) => p.specs?.usapaApproved,
    type: 'boolean',
  },
];

function ComparisonTable({ product1, product2 }: { product1: Product; product2: Product }) {
  function isBetter(row: ComparisonRow, val1: unknown, val2: unknown): [boolean, boolean] {
    if (!row.compare || val1 == null || val2 == null) return [false, false];
    const n1 = typeof val1 === 'number' ? val1 : parseFloat(String(val1));
    const n2 = typeof val2 === 'number' ? val2 : parseFloat(String(val2));
    if (isNaN(n1) || isNaN(n2) || n1 === n2) return [false, false];
    if (row.compare === 'lower') return [n1 < n2, n2 < n1];
    return [n1 > n2, n2 > n1];
  }

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="text-sm font-semibold text-gray-500">Thong so</div>
        <div className="text-sm font-semibold text-gray-800 text-center line-clamp-1">{product1.name}</div>
        <div className="text-sm font-semibold text-gray-800 text-center line-clamp-1">{product2.name}</div>
      </div>

      {comparisonRows.map((row) => {
        const val1 = row.getValue(product1);
        const val2 = row.getValue(product2);
        const [better1, better2] = isBetter(row, val1, val2);

        return (
          <div key={row.key} className="grid grid-cols-3 border-b border-gray-100 last:border-b-0 px-4 py-3 items-center">
            <div className="text-sm font-medium text-gray-600">{row.label}</div>

            {/* Product 1 value */}
            <div className={`text-sm text-center ${better1 ? 'text-success font-semibold' : 'text-gray-700'}`}>
              {row.type === 'bar' && typeof val1 === 'number' ? (
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${better1 ? 'bg-success' : 'bg-accent'}`}
                      style={{ width: `${(val1 / 10) * 100}%` }}
                    />
                  </div>
                  <span>{val1}/10</span>
                </div>
              ) : row.type === 'boolean' ? (
                val1 ? (
                  <span className="inline-flex items-center gap-1 text-success">
                    <Check className="w-4 h-4" /> Co
                  </span>
                ) : (
                  <span className="text-gray-400">Khong</span>
                )
              ) : row.key === 'price' && typeof val1 === 'number' ? (
                formatPrice(val1)
              ) : row.key === 'rating' && typeof val1 === 'number' ? (
                `${val1} / 5`
              ) : (
                String(val1 ?? '-')
              )}
            </div>

            {/* Product 2 value */}
            <div className={`text-sm text-center ${better2 ? 'text-success font-semibold' : 'text-gray-700'}`}>
              {row.type === 'bar' && typeof val2 === 'number' ? (
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${better2 ? 'bg-success' : 'bg-accent'}`}
                      style={{ width: `${(val2 / 10) * 100}%` }}
                    />
                  </div>
                  <span>{val2}/10</span>
                </div>
              ) : row.type === 'boolean' ? (
                val2 ? (
                  <span className="inline-flex items-center gap-1 text-success">
                    <Check className="w-4 h-4" /> Co
                  </span>
                ) : (
                  <span className="text-gray-400">Khong</span>
                )
              ) : row.key === 'price' && typeof val2 === 'number' ? (
                formatPrice(val2)
              ) : row.key === 'rating' && typeof val2 === 'number' ? (
                `${val2} / 5`
              ) : (
                String(val2 ?? '-')
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ComparePage() {
  const [product1, setProduct1] = useState<Product | null>(null);
  const [product2, setProduct2] = useState<Product | null>(null);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <ArrowLeftRight className="w-7 h-7 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">So sanh san pham</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <ProductSelector
          selected={product1}
          onSelect={setProduct1}
          label="San pham 1"
          otherSelectedId={product2?.id ?? null}
        />
        <ProductSelector
          selected={product2}
          onSelect={setProduct2}
          label="San pham 2"
          otherSelectedId={product1?.id ?? null}
        />
      </div>

      {product1 && product2 && (
        <ComparisonTable product1={product1} product2={product2} />
      )}

      {(!product1 || !product2) && (
        <div className="mt-12 text-center text-gray-400">
          <ArrowLeftRight className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Chon 2 san pham de so sanh</p>
        </div>
      )}
    </div>
  );
}
