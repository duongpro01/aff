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
}

const formatPrice = (price: number) => '$' + price.toFixed(2);

export default function ProductDetailClient({ product, relatedProducts }: Props) {
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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '16px 0', fontSize: 13, color: '#6b7280', flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={14} />
        <Link href="/products" style={{ color: '#6b7280', textDecoration: 'none' }}>Products</Link>
        <ChevronRight size={14} />
        <span style={{ color: '#111827', fontWeight: 500 }}>{product.name}</span>
      </nav>

      {/* Product Main */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 48 }} className="product-detail-grid">

        {/* ===== LEFT: Image Gallery ===== */}
        <div>
          {/* Main Image */}
          <div style={{
            position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden',
            marginBottom: 12, backgroundColor: '#f3f4f6',
          }}>
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
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 18 }}>
                No Image
              </div>
            )}
            {discount > 0 && (
              <span style={{
                position: 'absolute', top: 12, left: 12, backgroundColor: '#dc2626', color: '#fff',
                fontSize: 14, fontWeight: 700, padding: '6px 12px', borderRadius: 8,
              }}>
                -{discount}% OFF
              </span>
            )}
            {isOnSale && (
              <span style={{
                position: 'absolute', top: 12, right: 12, backgroundColor: '#f59e0b', color: '#fff',
                fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
              }}>
                SALE
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {galleryImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  style={{
                    width: 72, height: 72, borderRadius: 8, overflow: 'hidden', padding: 0,
                    border: activeImage === index ? '3px solid #7c3aed' : '2px solid #e5e7eb',
                    cursor: 'pointer', flexShrink: 0, position: 'relative', backgroundColor: '#f3f4f6',
                  }}
                >
                  <Image src={img} alt={`${index + 1}`} fill sizes="72px" style={{ objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ===== RIGHT: Product Info ===== */}
        <div>
          {/* Brand */}
          <div style={{ fontSize: 13, color: '#7c3aed', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
            {brandDisplay}
          </div>

          {/* Name */}
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', lineHeight: 1.3, margin: '0 0 16px' }}>
            {product.name}
          </h1>

          {/* Item Code */}
          {itemCode && (
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>
              Item Code: {itemCode}
            </div>
          )}

          {/* Price */}
          <div style={{ marginBottom: 20, padding: '16px 20px', backgroundColor: '#faf5ff', borderRadius: 12, border: '1px solid #e9d5ff' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: '#7c3aed' }}>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span style={{ fontSize: 18, color: '#9ca3af', textDecoration: 'line-through' }}>
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div style={{ fontSize: 14, color: '#dc2626', fontWeight: 600 }}>
                {saveAmount ? `Save ${saveAmount}` : `Save ${formatPrice(product.originalPrice - product.price)} (${discount}% off)`}
              </div>
            )}
            {rewardDollars && (
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
                Earn ${rewardDollars} Reward Dollars
              </div>
            )}
          </div>

          {/* Stock */}
          <div style={{ marginBottom: 20 }}>
            {product.inStock ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 500, color: '#059669', backgroundColor: '#ecfdf5', padding: '4px 12px', borderRadius: 20, border: '1px solid #a7f3d0' }}>
                <Check size={14} /> In Stock
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 500, color: '#dc2626', backgroundColor: '#fef2f2', padding: '4px 12px', borderRadius: 20, border: '1px solid #fecaca' }}>
                Out of Stock
              </span>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'stretch' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: 40, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d1d5db', borderRadius: '8px 0 0 8px', backgroundColor: '#f9fafb', cursor: 'pointer' }}>
                <Minus size={16} />
              </button>
              <div style={{ width: 48, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid #d1d5db', borderBottom: '1px solid #d1d5db', fontSize: 16, fontWeight: 600, backgroundColor: '#fff' }}>
                {quantity}
              </div>
              <button onClick={() => setQuantity(q => q + 1)} style={{ width: 40, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d1d5db', borderRadius: '0 8px 8px 0', backgroundColor: '#f9fafb', cursor: 'pointer' }}>
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px 24px', borderRadius: 10, border: 'none',
                backgroundColor: product.inStock ? '#7c3aed' : '#d1d5db', color: '#fff',
                fontSize: 16, fontWeight: 700, cursor: product.inStock ? 'pointer' : 'not-allowed',
              }}
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
          </div>

          {/* Free Shipping Banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', backgroundColor: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', marginBottom: 20, fontSize: 13, color: '#166534', fontWeight: 500 }}>
            <Truck size={16} />
            Free discreet shipping on orders over $69
          </div>

          {/* Features Quick List */}
          {product.features && product.features.length > 0 && (
            <div style={{ padding: '16px 20px', backgroundColor: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb', marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Key Features</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {product.features.slice(0, 8).map((feature, index) => (
                  <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#374151' }}>
                    <Check size={14} style={{ color: '#7c3aed', flexShrink: 0, marginTop: 2 }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trust Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { icon: Shield, text: '100% Authentic' },
              { icon: Truck, text: 'Discreet Packaging' },
              { icon: RotateCcw, text: '30-Day Returns' },
              { icon: CreditCard, text: 'Afterpay Available' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280', padding: '8px 12px', backgroundColor: '#f9fafb', borderRadius: 8 }}>
                <Icon size={14} style={{ color: '#7c3aed' }} /> {text}
              </div>
            ))}
          </div>

          {/* Source Link */}
          {sourceUrl && (
            <div style={{ marginTop: 16, fontSize: 12 }}>
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', textDecoration: 'underline' }}>
                View on Wild Secrets
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ===== TABS SECTION ===== */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: 24, overflowX: 'auto' }}>
          {tabs.filter(t => t.show).map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              style={{
                padding: '12px 24px', fontSize: 15, fontWeight: activeTab === index ? 700 : 500,
                color: activeTab === index ? '#7c3aed' : '#6b7280', backgroundColor: 'transparent',
                border: 'none', borderBottom: activeTab === index ? '3px solid #7c3aed' : '3px solid transparent',
                cursor: 'pointer', marginBottom: -2, whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ minHeight: 200 }}>
          {/* Description Tab */}
          {activeTab === 0 && (
            <div style={{ fontSize: 15, lineHeight: 1.8, color: '#374151' }}>
              {product.fullDescription ? (
                <div dangerouslySetInnerHTML={{ __html: product.fullDescription }} />
              ) : product.description ? (
                product.description.split('\n\n').map((p, i) => (
                  <p key={i} style={{ marginBottom: 16 }}>{p}</p>
                ))
              ) : (
                <p style={{ color: '#9ca3af' }}>No description available.</p>
              )}
            </div>
          )}

          {/* Features & Specs Tab */}
          {activeTab === 1 && (
            <div>
              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Features</h3>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {product.features.map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 15, color: '#374151' }}>
                        <Check size={18} style={{ color: '#7c3aed', flexShrink: 0, marginTop: 2 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specs Table */}
              {hasSpecs && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Specifications</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {specsEntries.map(([key, value]) => (
                        <tr key={key} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '10px 16px', fontWeight: 600, fontSize: 14, color: '#374151', width: '40%', backgroundColor: '#f9fafb' }}>{key}</td>
                          <td style={{ padding: '10px 16px', fontSize: 14, color: '#111827' }}>{value}</td>
                        </tr>
                      ))}
                      {material && !product.specs?.Material && (
                        <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '10px 16px', fontWeight: 600, fontSize: 14, color: '#374151', backgroundColor: '#f9fafb' }}>Material</td>
                          <td style={{ padding: '10px 16px', fontSize: 14, color: '#111827' }}>{material}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {!product.features?.length && !hasSpecs && (
                <p style={{ color: '#9ca3af' }}>No specifications available for this product.</p>
              )}
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === 2 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Shipping Information</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', backgroundColor: '#f0fdf4', borderRadius: 10, marginBottom: 20 }}>
                <Truck size={20} style={{ color: '#059669' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#065f46', fontSize: 15 }}>Fast & Discreet Delivery</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Orders shipped within 24 hours (excl. weekends & holidays)</div>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#374151' }}>Destination</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#374151' }}>Standard</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#374151' }}>Express</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { dest: 'Australia', std: '2-7 business days', exp: '1-3 business days' },
                    { dest: 'New Zealand', std: '10-15 business days', exp: '2-4 business days' },
                    { dest: 'United States', std: '10-15 business days', exp: '-' },
                    { dest: 'Other Countries', std: '5-10 business days', exp: '2-4 business days' },
                  ].map(row => (
                    <tr key={row.dest} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px 16px', fontSize: 14, fontWeight: 500 }}>{row.dest}</td>
                      <td style={{ padding: '10px 16px', fontSize: 14, color: '#6b7280' }}>{row.std}</td>
                      <td style={{ padding: '10px 16px', fontSize: 14, color: '#6b7280' }}>{row.exp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 16, padding: '12px 16px', backgroundColor: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a', fontSize: 13, color: '#92400e' }}>
                <strong>Free shipping</strong> on all orders over $69 AUD. All packages are shipped in plain, unmarked packaging for your privacy.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 20 }}>You May Also Like</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="related-products-grid">
            {relatedProducts.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .product-detail-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .related-products-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        }
      `}</style>
    </div>
  );
}
