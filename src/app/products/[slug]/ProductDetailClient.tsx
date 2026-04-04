'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Minus, Plus, ShoppingCart, Check, Truck, Shield, RotateCcw, CreditCard } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  brand: string;
  description: string;
  fullDescription?: string;
  features?: string[];
  specs?: Record<string, string>;
  params?: Record<string, string>;
  inStock: boolean;
  rating: number;
  reviews: number;
}

interface Props {
  product: Product;
  relatedProducts: Product[];
  categoryName?: string;
  categorySlug?: string;
}

const formatPrice = (price: number) => '$' + price.toFixed(2);

export default function ProductDetailClient({ product, relatedProducts, categoryName, categorySlug }: Props) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [activeImage, setActiveImage] = useState(0);

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const galleryImages = product.images?.length ? product.images : [product.image];

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: product.image }, quantity);
  };

  const isOnSale = product.params?.isOnSale === 'true';
  const saveAmount = product.params?.saveAmount || '';
  const rewardDollars = product.params?.rewardDollars || '';
  const brandDisplay = product.params?.brand || product.brand;
  const material = product.params?.material || product.specs?.Material || '';
  const itemCode = product.params?.code || '';
  const sourceUrl = product.params?.sourceUrl || '';

  // Build specs table from specs + params
  const specsEntries = Object.entries(product.specs || {}).filter(([, v]) => v);
  const hasSpecs = specsEntries.length > 0;

  const tabs = [
    { label: 'Description', show: true },
    { label: 'Features & Specs', show: (product.features?.length || 0) > 0 || hasSpecs },
    { label: 'Shipping', show: true },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-3 sm:px-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 py-2.5 sm:py-3 text-[11px] sm:text-xs text-gray-500 flex-wrap leading-relaxed">
        <Link href="/" className="text-gray-500 no-underline whitespace-nowrap hover:text-gray-700">Home</Link>
        <ChevronRight size={12} className="flex-shrink-0 text-gray-400" />
        <Link href="/products" className="text-gray-500 no-underline whitespace-nowrap hover:text-gray-700">Products</Link>
        {product.brand && (
          <>
            <ChevronRight size={12} className="flex-shrink-0 text-gray-400" />
            <Link href={`/${product.brand}`} className="text-gray-500 no-underline whitespace-nowrap hover:text-gray-700">{brandDisplay}</Link>
          </>
        )}
        <ChevronRight size={12} className="flex-shrink-0 text-gray-400" />
        <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* Product Main */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 48 }} className="product-detail-grid">

        {/* ===== LEFT: Image Gallery ===== */}
        <div style={{ minWidth: 0 }}>
          {/* Main Image */}
          <div className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-3 bg-gray-100">
            {galleryImages[activeImage] ? (
              <Image
                src={galleryImages[activeImage]}
                alt={product.name}
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
              <span className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-red-600 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg">
                -{discount}% OFF
              </span>
            )}
            {isOnSale && (
              <span className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-amber-500 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-1 rounded-md">
                SALE
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1">
              {galleryImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] rounded-lg overflow-hidden p-0 cursor-pointer flex-shrink-0 relative bg-gray-100 ${activeImage === index ? 'ring-2 ring-purple-600 ring-offset-1' : 'border-2 border-gray-200'}`}
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
          <Link
            href={`/${product.brand}`}
            className="inline-block text-xs sm:text-[13px] text-purple-600 font-semibold mb-1 sm:mb-1.5 uppercase tracking-wide no-underline hover:text-purple-700"
          >
            {brandDisplay}
          </Link>

          {/* Name */}
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight mb-2 sm:mb-3">
            {product.name}
          </h1>

          {/* Item Code */}
          {itemCode && (
            <div className="text-[11px] sm:text-xs text-gray-400 mb-2 sm:mb-3">
              Item Code: {itemCode}
            </div>
          )}

          {/* Price */}
          <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="flex items-baseline gap-2 sm:gap-3 mb-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-purple-600">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm sm:text-lg text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs sm:text-sm text-red-600 font-semibold">
                {saveAmount ? `Save ${saveAmount}` : `Save ${formatPrice(product.originalPrice - product.price)} (${discount}% off)`}
              </div>
            )}
            {rewardDollars && (
              <div className="text-xs text-gray-500 mt-1.5">
                Earn ${rewardDollars} Reward Dollars
              </div>
            )}
          </div>

          {/* Stock */}
          <div className="mb-4 sm:mb-5">
            {product.inStock ? (
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
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl border-none text-white text-sm sm:text-base font-bold transition-colors ${product.inStock ? 'bg-purple-600 hover:bg-purple-700 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              <ShoppingCart size={18} />
              <span className="hidden xs:inline">Add to Cart</span>
              <span className="xs:hidden">Add</span>
            </button>
          </div>

          {/* Free Shipping Banner */}
          <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-green-50 rounded-lg border border-green-200 mb-4 sm:mb-5 text-xs sm:text-sm text-green-800 font-medium">
            <Truck size={16} className="flex-shrink-0" />
            <span>Free discreet shipping on orders over $69</span>
          </div>

          {/* Features Quick List */}
          {product.features && product.features.length > 0 && (
            <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4 sm:mb-5">
              <div className="text-xs sm:text-sm font-bold text-gray-900 mb-2 sm:mb-3">Key Features</div>
              <ul className="list-none m-0 p-0 flex flex-col gap-1.5 sm:gap-2">
                {product.features.slice(0, 6).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <Check size={14} className="text-purple-600 flex-shrink-0 mt-0.5" />
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
              { icon: Truck, text: 'Discreet Packaging' },
              { icon: RotateCcw, text: '30-Day Returns' },
              { icon: CreditCard, text: 'Afterpay Available' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-gray-500 px-2 sm:px-3 py-2 bg-gray-50 rounded-lg">
                <Icon size={14} className="text-purple-600 flex-shrink-0" /> <span className="truncate">{text}</span>
              </div>
            ))}
          </div>

          {/* Source Link */}
          {/* {sourceUrl && (
            <div style={{ marginTop: 16, fontSize: 12 }}>
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', textDecoration: 'underline' }}>
                View on Wild Secrets
              </a>
            </div>
          )} */}
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
              {product.fullDescription ? (
                <div
                  className="product-html-content"
                  dangerouslySetInnerHTML={{
                    __html: product.fullDescription
                      // Remove wrapper divs
                      .replace(/<div[^>]*class="content"[^>]*>/gi, '')
                      // Remove broken trailing HTML
                      .replace(/<\/div>\s*<\/div>\s*<div.*$/gi, '')
                      .replace(/<\/div>\s*<div[^>]*>?\s*$/gi, '')
                      .replace(/<div[^>]*>\s*$/gi, '')
                      // Remove any unclosed divs at the end
                      .replace(/(<\/div>\s*)+$/gi, '')
                      // Clean up entities
                      .replace(/&nbsp;/g, ' ')
                      // Remove empty paragraphs
                      .replace(/<p>\s*<\/p>/gi, '')
                      .trim()
                  }}
                />
              ) : product.description ? (
                <div className="product-text-content">
                  {product.description.split('\n\n').map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              ) : (
                <p className="tab-empty">No description available.</p>
              )}
            </div>
          )}

          {/* Features & Specs Tab */}
          {activeTab === 1 && (
            <div>
              {product.features && product.features.length > 0 && (
                <div className="tab-features">
                  <h3>Features</h3>
                  <ul>
                    {product.features.map((f, i) => (
                      <li key={i}>
                        <Check size={16} />
                        <span dangerouslySetInnerHTML={{ __html: f.replace(/&nbsp;/g, ' ').trim() }} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
                      {material && !product.specs?.Material && (
                        <tr>
                          <td className="spec-label">Material</td>
                          <td>{material}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {!product.features?.length && !hasSpecs && (
                <p className="tab-empty">No specifications available for this product.</p>
              )}
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === 2 && (
            <div>
              <div className="shipping-banner">
                <Truck size={20} />
                <div>
                  <div className="shipping-banner-title">Fast & Discreet Delivery</div>
                  <div className="shipping-banner-sub">Orders shipped within 24 hours (excl. weekends & holidays)</div>
                </div>
              </div>
              <table className="shipping-table">
                <thead>
                  <tr>
                    <th>Destination</th>
                    <th>Standard</th>
                    <th>Express</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { dest: 'Australia', std: '2-7 business days', exp: '1-3 business days' },
                    { dest: 'New Zealand', std: '10-15 business days', exp: '2-4 business days' },
                    { dest: 'United States', std: '10-15 business days', exp: '-' },
                    { dest: 'Other Countries', std: '5-10 business days', exp: '2-4 business days' },
                  ].map(row => (
                    <tr key={row.dest}>
                      <td className="shipping-dest">{row.dest}</td>
                      <td>{row.std}</td>
                      <td>{row.exp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="shipping-note">
                <strong>Free shipping</strong> on all orders over $69 AUD. All packages are shipped in plain, unmarked packaging for your privacy.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl md:text-[22px] font-bold text-gray-900 mb-4 sm:mb-5">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 related-products-grid">
            {relatedProducts.slice(0, 12).map((p: any) => (
              <ProductCard key={p.id} product={p} />
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
        .tab-btn:hover { color: #7c3aed; }
        .tab-btn.tab-active {
          font-weight: 700;
          color: #7c3aed;
          border-bottom-color: #7c3aed;
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
        .product-html-content div { display: contents; } /* Flatten any nested divs */
        .product-text-content p { margin: 0 0 12px; }
        .product-text-content p:last-child { margin-bottom: 0; }
        .tab-empty { color: #9ca3af; font-style: italic; font-size: 13px; }

        /* Features tab */
        .tab-features { margin-bottom: 20px; }
        @media (min-width: 640px) {
          .tab-features { margin-bottom: 28px; }
        }
        .tab-features h3, .tab-specs h3 {
          font-size: 14px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 10px;
        }
        @media (min-width: 640px) {
          .tab-features h3, .tab-specs h3 { font-size: 16px; margin: 0 0 14px; }
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
        .tab-features li svg { color: #7c3aed; flex-shrink: 0; margin-top: 1px; width: 14px; height: 14px; }

        /* Specs table */
        .tab-specs { margin-bottom: 20px; }
        @media (min-width: 640px) {
          .tab-specs { margin-bottom: 28px; }
        }
        .tab-specs table { width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
        .tab-specs tr { border-bottom: 1px solid #f3f4f6; }
        .tab-specs tr:last-child { border-bottom: none; }
        .tab-specs td { padding: 8px 10px; font-size: 12px; color: #111827; }
        @media (min-width: 640px) {
          .tab-specs td { padding: 10px 16px; font-size: 14px; }
        }
        .tab-specs .spec-label { font-weight: 600; color: #374151; width: 35%; background: #f9fafb; }
        @media (min-width: 640px) {
          .tab-specs .spec-label { width: 40%; }
        }

        /* Shipping tab */
        .shipping-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: #f0fdf4;
          border-radius: 10px;
          margin-bottom: 16px;
        }
        @media (min-width: 640px) {
          .shipping-banner { gap: 12px; padding: 16px 20px; margin-bottom: 20px; }
        }
        .shipping-banner svg { color: #059669; flex-shrink: 0; width: 18px; height: 18px; }
        @media (min-width: 640px) {
          .shipping-banner svg { width: 20px; height: 20px; }
        }
        .shipping-banner-title { font-weight: 600; color: #065f46; font-size: 13px; }
        @media (min-width: 640px) {
          .shipping-banner-title { font-size: 15px; }
        }
        .shipping-banner-sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
        @media (min-width: 640px) {
          .shipping-banner-sub { font-size: 13px; }
        }
        .shipping-table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; display: block; overflow-x: auto; }
        @media (min-width: 640px) {
          .shipping-table { display: table; }
        }
        .shipping-table th {
          padding: 8px 10px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
          white-space: nowrap;
        }
        @media (min-width: 640px) {
          .shipping-table th { padding: 10px 16px; font-size: 14px; }
        }
        .shipping-table td { padding: 8px 10px; font-size: 11px; color: #6b7280; white-space: nowrap; }
        @media (min-width: 640px) {
          .shipping-table td { padding: 10px 16px; font-size: 14px; white-space: normal; }
        }
        .shipping-table .shipping-dest { font-weight: 500; color: #111827; }
        .shipping-table tr { border-bottom: 1px solid #f3f4f6; }
        .shipping-table tbody tr:last-child { border-bottom: none; }
        .shipping-note {
          margin-top: 12px;
          padding: 10px 12px;
          background: #fffbeb;
          border-radius: 8px;
          border: 1px solid #fde68a;
          font-size: 11px;
          color: #92400e;
        }
        @media (min-width: 640px) {
          .shipping-note { margin-top: 16px; padding: 12px 16px; font-size: 13px; }
        }
      `}</style>
    </div>
  );
}
