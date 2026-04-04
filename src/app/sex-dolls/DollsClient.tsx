'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Filter, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import DollCard from '@/components/DollCard';

const ITEMS_PER_PAGE = 20;

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'newest', label: 'Newest' },
];

const MATERIAL_OPTIONS = ['TPE', 'Silicone', 'Hybrid'];
const BODY_TYPE_OPTIONS = ['Petite', 'Slim', 'Athletic', 'Curvy', 'BBW', 'Mature'];
const HEIGHT_RANGES = [
  { label: 'Under 150cm', min: 0, max: 149 },
  { label: '150-159cm', min: 150, max: 159 },
  { label: '160-169cm', min: 160, max: 169 },
  { label: '170cm+', min: 170, max: 999 },
];

interface DollsClientProps {
  dolls: any[];
  brands: any[];
  categories: any[];
}

export default function DollsClient({ dolls, brands, categories }: DollsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read filter state from URL search params
  const selectedCategories = searchParams.get('category')?.split(',').filter(Boolean) || [];
  const selectedBrands = searchParams.get('brand')?.split(',').filter(Boolean) || [];
  const selectedMaterials = searchParams.get('material')?.split(',').filter(Boolean) || [];
  const selectedBodyTypes = searchParams.get('bodyType')?.split(',').filter(Boolean) || [];
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortBy = searchParams.get('sort') || 'featured';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      // Reset to page 1 when filters change (unless page itself is being set)
      if (!('page' in updates)) {
        params.delete('page');
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const toggleCategory = (slug: string) => {
    const next = selectedCategories.includes(slug)
      ? selectedCategories.filter((c) => c !== slug)
      : [...selectedCategories, slug];
    updateParams({ category: next.length ? next.join(',') : null });
  };

  const toggleBrand = (slug: string) => {
    const next = selectedBrands.includes(slug)
      ? selectedBrands.filter((b) => b !== slug)
      : [...selectedBrands, slug];
    updateParams({ brand: next.length ? next.join(',') : null });
  };

  const toggleMaterial = (material: string) => {
    const next = selectedMaterials.includes(material)
      ? selectedMaterials.filter((m) => m !== material)
      : [...selectedMaterials, material];
    updateParams({ material: next.length ? next.join(',') : null });
  };

  const toggleBodyType = (bodyType: string) => {
    const next = selectedBodyTypes.includes(bodyType)
      ? selectedBodyTypes.filter((b) => b !== bodyType)
      : [...selectedBodyTypes, bodyType];
    updateParams({ bodyType: next.length ? next.join(',') : null });
  };

  const handleMinPrice = (v: string) => updateParams({ minPrice: v || null });
  const handleMaxPrice = (v: string) => updateParams({ maxPrice: v || null });
  const handleSort = (v: string) => updateParams({ sort: v === 'featured' ? null : v });
  const handlePage = (p: number) => updateParams({ page: p === 1 ? null : String(p) });

  // Filter & sort
  const filtered = useMemo(() => {
    let result = [...dolls];

    if (selectedCategories.length) {
      result = result.filter((d) => selectedCategories.includes(d.category));
    }
    if (selectedBrands.length) {
      result = result.filter((d) => selectedBrands.includes(d.brand));
    }
    if (selectedMaterials.length) {
      result = result.filter((d) => selectedMaterials.includes(d.material));
    }
    if (selectedBodyTypes.length) {
      result = result.filter((d) => selectedBodyTypes.includes(d.bodyType));
    }
    if (minPrice) {
      result = result.filter((d) => d.price >= Number(minPrice));
    }
    if (maxPrice) {
      result = result.filter((d) => d.price <= Number(maxPrice));
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }

    return result;
  }, [dolls, selectedCategories, selectedBrands, selectedMaterials, selectedBodyTypes, minPrice, maxPrice, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paged = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  // Page numbers to display
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, safePage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [safePage, totalPages]);

  const checkboxStyle: React.CSSProperties = {
    width: 16,
    height: 16,
    borderRadius: 4,
    cursor: 'pointer',
    accentColor: '#db2777',
  };

  const filterSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Categories */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: '#111827' }}>Categories</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {categories.map((cat: any) => (
            <label
              key={cat.slug}
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151', cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.slug)}
                onChange={() => toggleCategory(cat.slug)}
                style={checkboxStyle}
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: '#111827' }}>Brands</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
          {brands.map((br: any) => (
            <label
              key={br.slug}
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151', cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(br.slug)}
                onChange={() => toggleBrand(br.slug)}
                style={checkboxStyle}
              />
              {br.name}
            </label>
          ))}
        </div>
      </div>

      {/* Material */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: '#111827' }}>Material</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MATERIAL_OPTIONS.map((material) => (
            <label
              key={material}
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151', cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                checked={selectedMaterials.includes(material)}
                onChange={() => toggleMaterial(material)}
                style={checkboxStyle}
              />
              {material}
            </label>
          ))}
        </div>
      </div>

      {/* Body Type */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: '#111827' }}>Body Type</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {BODY_TYPE_OPTIONS.map((bodyType) => (
            <label
              key={bodyType}
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151', cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                checked={selectedBodyTypes.includes(bodyType)}
                onChange={() => toggleBodyType(bodyType)}
                style={checkboxStyle}
              />
              {bodyType}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: '#111827' }}>Price Range</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => handleMinPrice(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: 6,
              border: '1px solid #d1d5db',
              fontSize: 13,
              outline: 'none',
              minWidth: 0,
            }}
          />
          <span style={{ color: '#9ca3af', fontSize: 13 }}>-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => handleMaxPrice(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: 6,
              border: '1px solid #d1d5db',
              fontSize: 13,
              outline: 'none',
              minWidth: 0,
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>Premium Sex Dolls</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>
          Discover our collection of premium, realistic sex dolls from top brands worldwide.
        </p>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 14, color: '#6b7280' }}>
          Showing {filtered.length} dolls
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            style={{
              display: 'none',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              backgroundColor: '#fff',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              color: '#374151',
            }}
            className="mobile-filter-btn"
          >
            <Filter size={16} />
            Filters
          </button>

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <SlidersHorizontal size={16} color="#6b7280" />
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #d1d5db',
                fontSize: 14,
                outline: 'none',
                backgroundColor: '#fff',
                cursor: 'pointer',
                color: '#374151',
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', gap: 24 }}>
        {/* Desktop sidebar */}
        <aside
          className="desktop-sidebar"
          style={{
            width: 240,
            flexShrink: 0,
            padding: 16,
            backgroundColor: '#fdf2f8',
            borderRadius: 12,
            border: '1px solid #fbcfe8',
            alignSelf: 'flex-start',
            position: 'sticky',
            top: 80,
          }}
        >
          {filterSidebar}
        </aside>

        {/* Product grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {paged.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
              <p style={{ fontSize: 16, fontWeight: 500 }}>No dolls found</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>Try adjusting your filters</p>
            </div>
          ) : (
            <div
              className="dolls-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
              }}
            >
              {paged.map((doll: any) => (
                <DollCard key={doll.id} doll={doll} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                marginTop: 32,
              }}
            >
              <button
                onClick={() => handlePage(safePage - 1)}
                disabled={safePage <= 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  backgroundColor: '#fff',
                  cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                  opacity: safePage <= 1 ? 0.4 : 1,
                  color: '#374151',
                }}
              >
                <ChevronLeft size={18} />
              </button>

              {pageNumbers.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePage(p)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: p === safePage ? '1px solid #db2777' : '1px solid #d1d5db',
                    backgroundColor: p === safePage ? '#db2777' : '#fff',
                    color: p === safePage ? '#fff' : '#374151',
                    fontWeight: p === safePage ? 700 : 400,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => handlePage(safePage + 1)}
                disabled={safePage >= totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  backgroundColor: '#fff',
                  cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: safePage >= totalPages ? 0.4 : 1,
                  color: '#374151',
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter overlay */}
      {mobileFilterOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setMobileFilterOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
          />
          {/* Panel */}
          <div
            style={{
              position: 'relative',
              width: 300,
              maxWidth: '85vw',
              height: '100%',
              backgroundColor: '#fff',
              overflowY: 'auto',
              padding: 20,
              boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Filters</h2>
              <button
                onClick={() => setMobileFilterOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#f3f4f6',
                  cursor: 'pointer',
                  color: '#374151',
                }}
              >
                <X size={18} />
              </button>
            </div>
            {filterSidebar}
          </div>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        .desktop-sidebar {
          display: block;
        }
        .mobile-filter-btn {
          display: none !important;
        }
        .dolls-grid {
          grid-template-columns: repeat(4, 1fr) !important;
        }
        @media (max-width: 1024px) {
          .dolls-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-filter-btn {
            display: flex !important;
          }
          .dolls-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .dolls-grid {
            grid-template-columns: repeat(1, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
