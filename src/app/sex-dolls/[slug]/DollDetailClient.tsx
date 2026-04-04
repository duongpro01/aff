'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Minus, Plus, ShoppingCart, Check, Truck, Shield, Clock, CreditCard, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import DollCard from '@/components/DollCard';

interface Doll {
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
  weight?: string;
  cupSize?: string;
  bodyType?: string;
  description: string;
  fullDescription?: string;
  features?: string[];
  specs?: Record<string, string>;
  inStock: boolean;
  sourceUrl?: string;
}

interface Props {
  doll: Doll;
  relatedDolls: Doll[];
  categoryName?: string;
  categorySlug?: string;
  brandName?: string;
}

const formatPrice = (price: number) => '$' + price.toLocaleString();

// Helper to clean brand name
function cleanBrandName(brand: string): string {
  if (!brand) return '';
  return brand.replace(/-+$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function DollDetailClient({ doll, relatedDolls, categoryName, categorySlug, brandName }: Props) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [activeImage, setActiveImage] = useState(0);

  const discount = doll.originalPrice && doll.originalPrice > doll.price
    ? Math.round((1 - doll.price / doll.originalPrice) * 100)
    : 0;

  const galleryImages = doll.images?.length ? doll.images : [doll.image];

  const displayBrand = brandName ? cleanBrandName(brandName) : cleanBrandName(doll.brand);

  // Build specs entries
  const specsData: Record<string, string> = {};
  if (doll.specs) {
    for (const [key, value] of Object.entries(doll.specs)) {
      if (value && value.length < 100) specsData[key] = value;
    }
  }
  if (doll.height && !specsData['Height']) specsData['Height'] = doll.height;
  if (doll.weight && !specsData['Weight']) specsData['Weight'] = doll.weight;
  if (doll.material && !specsData['Material']) specsData['Material'] = doll.material;
  if (doll.cupSize && !specsData['Cup Size']) specsData['Cup Size'] = doll.cupSize;
  if (doll.bodyType && !specsData['Body Type']) specsData['Body Type'] = doll.bodyType;

  const specsEntries = Object.entries(specsData).filter(([, v]) => v);
  const hasSpecs = specsEntries.length > 0;

  const validFeatures = (doll.features || []).filter(f =>
    f && f.length > 10 && f.length < 200 &&
    !f.includes('http') && !f.includes('{') &&
    !/^[A-Z][a-zà-ž]+$/.test(f)
  );

  const tabs = [
    { label: 'Description', show: true },
    { label: 'Specifications', show: hasSpecs || validFeatures.length > 0 },
    { label: 'Shipping & Returns', show: true },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-3 sm:px-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 py-2.5 sm:py-3 text-[11px] sm:text-xs text-gray-500 flex-wrap leading-relaxed">
        <Link href="/" className="text-gray-500 no-underline whitespace-nowrap hover:text-gray-700">Home</Link>
        <ChevronRight size={12} className="flex-shrink-0 text-gray-400" />
        <Link href="/sex-dolls" className="text-gray-500 no-underline whitespace-nowrap hover:text-gray-700">Sex Dolls</Link>
        {categoryName && categorySlug && (
          <>
            <ChevronRight size={12} className="flex-shrink-0 text-gray-400" />
            <Link href={`/sex-dolls?category=${categorySlug}`} className="text-gray-500 no-underline whitespace-nowrap hover:text-gray-700">{categoryName}</Link>
          </>
        )}
        <ChevronRight size={12} className="flex-shrink-0 text-gray-400" />
        <span className="text-gray-900 font-medium line-clamp-1">{doll.name}</span>
      </nav>

      {/* Product Main - same structure as ProductDetailClient */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 48 }} className="product-detail-grid">

        {/* ===== LEFT: Image Gallery ===== */}
        <div style={{ minWidth: 0 }}>
          {/* Main Image */}
          <div className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-3 bg-gray-100 group">
            {galleryImages[activeImage] ? (
              <Image
                src={galleryImages[activeImage]}
                alt={doll.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'contain' }}
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-base sm:text-lg">
                No Image
              </div>
            )}
            {discount > 0 && (
              <span className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-pink-600 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg z-10">
                -{discount}% OFF
              </span>
            )}

            {/* Navigation Arrows */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage(prev => prev === 0 ? galleryImages.length - 1 : prev - 1)}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer border border-gray-200"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} className="text-gray-700" />
                </button>
                <button
                  onClick={() => setActiveImage(prev => prev === galleryImages.length - 1 ? 0 : prev + 1)}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer border border-gray-200"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} className="text-gray-700" />
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md z-10">
                  {activeImage + 1} / {galleryImages.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1" style={{ maxWidth: '100%' }}>
              {galleryImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] rounded-lg overflow-hidden p-0 cursor-pointer flex-shrink-0 relative bg-gray-100 ${activeImage === index ? 'ring-2 ring-pink-600 ring-offset-1' : 'border-2 border-gray-200'}`}
                >
                  <Image src={img} alt={`${index + 1}`} fill sizes="72px" style={{ objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ===== RIGHT: Product Info ===== */}
        <div style={{ minWidth: 0 }}>
          {/* Brand */}
          {displayBrand && (
            <Link
              href={`/sex-dolls?brand=${doll.brand}`}
              className="inline-block text-xs sm:text-[13px] text-pink-600 font-semibold mb-1 sm:mb-1.5 uppercase tracking-wide no-underline hover:text-pink-700"
            >
              {displayBrand}
            </Link>
          )}

          {/* Name */}
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight mb-2 sm:mb-3">
            {doll.name}
          </h1>

          {/* Quick Specs Tags */}
          {(doll.material || doll.height || doll.cupSize || doll.bodyType) && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              {doll.material && <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-100 rounded-full text-gray-600 font-medium">{doll.material}</span>}
              {doll.height && <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-100 rounded-full text-gray-600 font-medium">{doll.height}</span>}
              {doll.cupSize && <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-100 rounded-full text-gray-600 font-medium">{doll.cupSize}</span>}
              {doll.bodyType && <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-100 rounded-full text-gray-600 font-medium">{doll.bodyType}</span>}
            </div>
          )}

          {/* Price */}
          <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-pink-50 rounded-xl border border-pink-200">
            <div className="flex items-baseline gap-2 sm:gap-3 mb-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-pink-600">
                {formatPrice(doll.price)}
              </span>
              {doll.originalPrice && doll.originalPrice > doll.price && (
                <span className="text-sm sm:text-lg text-gray-400 line-through">
                  {formatPrice(doll.originalPrice)}
                </span>
              )}
            </div>
            {doll.originalPrice && doll.originalPrice > doll.price && (
              <div className="text-xs sm:text-sm text-red-600 font-semibold">
                Save {formatPrice(doll.originalPrice - doll.price)} ({discount}% off)
              </div>
            )}
          </div>

          {/* Stock */}
          <div className="mb-4 sm:mb-5">
            {doll.inStock ? (
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-green-600 bg-green-50 px-2.5 sm:px-3 py-1 rounded-full border border-green-200">
                <Check size={14} /> In Stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-red-600 bg-red-50 px-2.5 sm:px-3 py-1 rounded-full border border-red-200">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-5 items-stretch">
            <div className="flex items-center">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 sm:w-10 h-10 sm:h-11 flex items-center justify-center border border-gray-300 rounded-l-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                <Minus size={16} />
              </button>
              <div className="w-10 sm:w-12 h-10 sm:h-11 flex items-center justify-center border-t border-b border-gray-300 text-sm sm:text-base font-semibold bg-white">
                {quantity}
              </div>
              <button onClick={() => setQuantity(q => q + 1)} className="w-9 sm:w-10 h-10 sm:h-11 flex items-center justify-center border border-gray-300 rounded-r-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={() => {
                if (!doll.inStock) return;
                addToCart({ id: doll.id, name: doll.name, slug: doll.slug, price: doll.price, image: doll.image }, quantity);
              }}
              disabled={!doll.inStock}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl border-none text-white text-sm sm:text-base font-bold transition-colors ${doll.inStock ? 'bg-pink-600 hover:bg-pink-700 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              <ShoppingCart size={18} />
              <span className="hidden xs:inline">Add to Cart</span>
              <span className="xs:hidden">Add</span>
            </button>
          </div>

          {/* Free Shipping Banner */}
          <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-green-50 rounded-lg border border-green-200 mb-3 sm:mb-4 text-xs sm:text-sm text-green-800 font-medium">
            <Truck size={16} className="flex-shrink-0" />
            <span>Free discreet shipping on orders over $69</span>
          </div>

          {/* Production Time Banner */}
          <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-amber-50 rounded-lg border border-amber-200 mb-4 sm:mb-5 text-xs sm:text-sm text-amber-800 font-medium">
            <Clock size={16} className="flex-shrink-0" />
            <span>Production time: 2-3 weeks (custom made)</span>
          </div>

          {/* Features Quick List */}
          {validFeatures.length > 0 && (
            <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4 sm:mb-5">
              <div className="text-xs sm:text-sm font-bold text-gray-900 mb-2 sm:mb-3">Key Features</div>
              <ul className="list-none m-0 p-0 flex flex-col gap-1.5 sm:gap-2">
                {validFeatures.slice(0, 6).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <Check size={14} className="text-pink-600 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Shield, text: '100% Authentic' },
              { icon: Package, text: 'Discreet Packaging' },
              { icon: Clock, text: '30-Day Returns' },
              { icon: CreditCard, text: 'Afterpay Available' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-gray-500 px-2 sm:px-3 py-2 bg-gray-50 rounded-lg">
                <Icon size={14} className="text-pink-600 flex-shrink-0" /> <span className="truncate">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== TABS SECTION ===== */}
      <div className="tabs-section">
        <div className="tabs-header">
          {tabs.filter(t => t.show).map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`tab-btn ${activeTab === index ? 'tab-active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {/* Description Tab */}
          {activeTab === 0 && (
            <div className="tab-description">
              {doll.fullDescription ? (
                <div
                  className="product-html-content"
                  dangerouslySetInnerHTML={{
                    __html: doll.fullDescription
                      .replace(/<meta[^>]*>/gi, '')
                      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                      .replace(/<div[^>]*>\s*<\/div>/gi, '')
                      .replace(/&nbsp;/g, ' ')
                      .replace(/<p>\s*<\/p>/gi, '')
                      .trim()
                  }}
                />
              ) : doll.description ? (
                <div className="product-text-content">
                  {doll.description.split('\n\n').map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              ) : (
                <p className="tab-empty">No description available.</p>
              )}
            </div>
          )}

          {/* Specifications Tab */}
          {activeTab === 1 && (
            <div>
              {hasSpecs && (
                <div className="tab-specs">
                  <h3>Specifications</h3>
                  <table>
                    <tbody>
                      {specsEntries.map(([key, value]) => (
                        <tr key={key}>
                          <td className="spec-label">{key}</td>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {validFeatures.length > 0 && (
                <div className="tab-features">
                  <h3>Features</h3>
                  <ul>
                    {validFeatures.map((f, i) => (
                      <li key={i}>
                        <Check size={16} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!hasSpecs && !validFeatures.length && (
                <p className="tab-empty">No specifications available.</p>
              )}
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === 2 && (
            <div>
              <div className="shipping-banner">
                <Truck size={20} />
                <div>
                  <div className="shipping-banner-title">Worldwide Free Shipping</div>
                  <div className="shipping-banner-sub">All orders include free discreet shipping</div>
                </div>
              </div>

              <div className="shipping-info-grid">
                <div className="shipping-info-item">
                  <h4>Production Time</h4>
                  <p>Each doll is made to order. Production typically takes 2-3 weeks depending on customization options.</p>
                </div>
                <div className="shipping-info-item">
                  <h4>Shipping Time</h4>
                  <p>After production, shipping takes 7-14 business days depending on your location.</p>
                </div>
                <div className="shipping-info-item">
                  <h4>Discreet Packaging</h4>
                  <p>All packages are shipped in plain, unmarked boxes with no indication of contents.</p>
                </div>
                <div className="shipping-info-item">
                  <h4>Returns Policy</h4>
                  <p>Due to the custom nature of products, returns are only accepted for manufacturing defects. Contact support within 7 days of delivery.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Dolls */}
      {relatedDolls.length > 0 && (
        <div className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl md:text-[22px] font-bold text-gray-900 mb-4 sm:mb-5">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
            {relatedDolls.slice(0, 8).map((d: any) => (
              <DollCard key={d.id} doll={d} />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .product-detail-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
        }
        .xs\\:inline { display: none; }
        .xs\\:hidden { display: inline; }
        @media (min-width: 400px) {
          .xs\\:inline { display: inline; }
          .xs\\:hidden { display: none; }
        }

        /* Tabs */
        .tabs-section { margin-bottom: 32px; }
        @media (min-width: 640px) {
          .tabs-section { margin-bottom: 48px; }
        }
        .tabs-header {
          display: flex;
          border-bottom: 2px solid #e5e7eb;
          margin-bottom: 0;
          overflow-x: auto;
          gap: 0;
          -webkit-overflow-scrolling: touch;
        }
        .tabs-header::-webkit-scrollbar { display: none; }
        .tab-btn {
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          margin-bottom: -2px;
          white-space: nowrap;
          transition: color 0.2s, border-color 0.2s;
          flex-shrink: 0;
        }
        @media (min-width: 640px) {
          .tab-btn { padding: 14px 24px; font-size: 15px; }
        }
        .tab-btn:hover { color: #db2777; }
        .tab-btn.tab-active {
          font-weight: 700;
          color: #db2777;
          border-bottom-color: #db2777;
        }
        .tab-content {
          padding: 16px 0;
          min-height: 120px;
        }
        @media (min-width: 640px) {
          .tab-content { padding: 24px 0; min-height: 160px; }
        }

        /* Description tab */
        .tab-description { font-size: 13px; line-height: 1.7; color: #374151; overflow-wrap: break-word; word-wrap: break-word; }
        @media (min-width: 640px) {
          .tab-description { font-size: 15px; line-height: 1.8; }
        }
        .product-html-content { overflow: hidden; }
        .product-html-content p { margin: 0 0 12px; }
        @media (min-width: 640px) {
          .product-html-content p { margin: 0 0 16px; }
        }
        .product-html-content p:last-child { margin-bottom: 0; }
        .product-html-content ul { padding-left: 16px; margin: 0 0 12px; }
        @media (min-width: 640px) {
          .product-html-content ul { padding-left: 20px; margin: 0 0 16px; }
        }
        .product-html-content li { margin-bottom: 4px; }
        .product-html-content div { display: contents; }
        .product-text-content p { margin: 0 0 12px; }
        .product-text-content p:last-child { margin-bottom: 0; }
        .tab-empty { color: #9ca3af; font-style: italic; font-size: 13px; }

        /* Specs table */
        .tab-specs { margin-bottom: 20px; }
        @media (min-width: 640px) {
          .tab-specs { margin-bottom: 28px; }
        }
        .tab-specs h3, .tab-features h3 {
          font-size: 14px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 10px;
        }
        @media (min-width: 640px) {
          .tab-specs h3, .tab-features h3 { font-size: 16px; margin: 0 0 14px; }
        }
        .tab-specs table { width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
        .tab-specs tr { border-bottom: 1px solid #f3f4f6; }
        .tab-specs tr:last-child { border-bottom: none; }
        .tab-specs td { padding: 8px 10px; font-size: 12px; color: #111827; }
        @media (min-width: 640px) {
          .tab-specs td { padding: 10px 16px; font-size: 14px; }
        }
        .tab-specs .spec-label { font-weight: 600; color: #374151; width: 35%; background: #fdf2f8; }
        @media (min-width: 640px) {
          .tab-specs .spec-label { width: 40%; }
        }

        /* Features */
        .tab-features { margin-bottom: 20px; }
        @media (min-width: 640px) {
          .tab-features { margin-bottom: 28px; }
        }
        .tab-features ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        @media (min-width: 640px) {
          .tab-features ul {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
        }
        .tab-features li {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 12px;
          color: #374151;
        }
        @media (min-width: 640px) {
          .tab-features li { gap: 8px; font-size: 14px; }
        }
        .tab-features li svg { color: #db2777; flex-shrink: 0; margin-top: 1px; width: 14px; height: 14px; }

        /* Shipping */
        .shipping-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: #fdf2f8;
          border-radius: 10px;
          margin-bottom: 16px;
        }
        @media (min-width: 640px) {
          .shipping-banner { gap: 12px; padding: 16px 20px; margin-bottom: 20px; }
        }
        .shipping-banner svg { color: #db2777; flex-shrink: 0; width: 18px; height: 18px; }
        @media (min-width: 640px) {
          .shipping-banner svg { width: 20px; height: 20px; }
        }
        .shipping-banner-title { font-weight: 600; color: #831843; font-size: 13px; }
        @media (min-width: 640px) {
          .shipping-banner-title { font-size: 15px; }
        }
        .shipping-banner-sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
        @media (min-width: 640px) {
          .shipping-banner-sub { font-size: 13px; }
        }
        .shipping-info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 640px) {
          .shipping-info-grid { grid-template-columns: 1fr 1fr; gap: 16px; }
        }
        .shipping-info-item {
          padding: 12px;
          background: #f9fafb;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
        }
        @media (min-width: 640px) {
          .shipping-info-item { padding: 16px; }
        }
        .shipping-info-item h4 {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 6px;
        }
        @media (min-width: 640px) {
          .shipping-info-item h4 { font-size: 14px; margin: 0 0 8px; }
        }
        .shipping-info-item p {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }
        @media (min-width: 640px) {
          .shipping-info-item p { font-size: 13px; }
        }
      `}</style>
    </div>
  );
}
