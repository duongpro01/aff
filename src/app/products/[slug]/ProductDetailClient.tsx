'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Minus, Plus, ShoppingCart, Check, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import StarRating from '@/components/StarRating';
import ProductSpecs from '@/components/ProductSpecs';
import ProductParams from '@/components/ProductParams';
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
  specs?: any;
  params?: any;
  inStock: boolean;
  rating: number;
  reviews: number;
}

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN').format(price) + 'đ';

const gradientColors = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [activeImage, setActiveImage] = useState(0);

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const galleryImages = (product.images && product.images.length > 0)
    ? product.images
    : [product.image];

  // Generate placeholder thumbnails
  const thumbnailCount = Math.max(galleryImages.length, 4);

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
    }, quantity);
  };

  const tabs = [
    { label: 'Mo ta' },
    { label: 'Thong so ky thuat' },
    { label: 'Danh gia' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
      {/* Breadcrumb */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '16px 0',
        fontSize: 14,
        color: '#6b7280',
        flexWrap: 'wrap',
      }}>
        <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Trang chu</Link>
        <ChevronRight size={14} />
        <Link href="/products" style={{ color: '#6b7280', textDecoration: 'none' }}>San pham</Link>
        <ChevronRight size={14} />
        <span style={{ color: '#111827', fontWeight: 500 }}>{product.name}</span>
      </nav>

      {/* Product Main Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 40,
        marginBottom: 48,
      }} className="product-detail-grid">
        {/* Left: Image Gallery */}
        <div>
          {/* Main Image */}
          <div style={{
            position: 'relative',
            aspectRatio: '1',
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: 12,
            background: gradientColors[activeImage % gradientColors.length],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              color: '#fff',
              fontSize: 20,
              fontWeight: 700,
              textAlign: 'center',
              padding: 24,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
              {product.name}
            </div>
            {discount > 0 && (
              <span style={{
                position: 'absolute',
                top: 12,
                left: 12,
                backgroundColor: '#ef4444',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 6,
              }}>
                -{discount}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          <div style={{
            display: 'flex',
            gap: 8,
          }}>
            {Array.from({ length: thumbnailCount }).map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 8,
                  border: activeImage === index ? '2px solid #2563eb' : '2px solid #e5e7eb',
                  background: gradientColors[index % gradientColors.length],
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'border-color 0.2s ease',
                  flexShrink: 0,
                }}
              >
                <span style={{
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 600,
                  textAlign: 'center',
                  padding: 4,
                  textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }}>
                  {index + 1}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div>
          {/* Brand */}
          <Link
            href={`/${product.brand}`}
            style={{
              display: 'inline-block',
              fontSize: 14,
              color: '#2563eb',
              textDecoration: 'none',
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            {product.params?.brand || product.brand}
          </Link>

          {/* Product Name */}
          <h1 style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#111827',
            lineHeight: 1.3,
            margin: '0 0 12px',
          }}>
            {product.name}
          </h1>

          {/* Rating */}
          <div style={{ marginBottom: 16 }}>
            <StarRating rating={product.rating} reviews={product.reviews} size="md" />
          </div>

          {/* Price */}
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 12,
            marginBottom: 16,
          }}>
            <span style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#dc2626',
            }}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span style={{
                fontSize: 18,
                color: '#9ca3af',
                textDecoration: 'line-through',
              }}>
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {discount > 0 && (
              <span style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                fontSize: 14,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 4,
              }}>
                -{discount}%
              </span>
            )}
          </div>

          {/* Stock Badge */}
          <div style={{ marginBottom: 20 }}>
            {product.inStock ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 14,
                fontWeight: 500,
                color: '#059669',
                backgroundColor: '#ecfdf5',
                padding: '4px 12px',
                borderRadius: 20,
                border: '1px solid #a7f3d0',
              }}>
                <Check size={14} />
                Con hang
              </span>
            ) : (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 14,
                fontWeight: 500,
                color: '#dc2626',
                backgroundColor: '#fef2f2',
                padding: '4px 12px',
                borderRadius: 20,
                border: '1px solid #fecaca',
              }}>
                Het hang
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
              So luong
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                style={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px 0 0 8px',
                  backgroundColor: '#f9fafb',
                  cursor: 'pointer',
                  color: '#374151',
                }}
              >
                <Minus size={16} />
              </button>
              <div style={{
                width: 56,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderTop: '1px solid #d1d5db',
                borderBottom: '1px solid #d1d5db',
                fontSize: 16,
                fontWeight: 600,
                color: '#111827',
                backgroundColor: '#fff',
              }}>
                {quantity}
              </div>
              <button
                onClick={() => setQuantity(q => q + 1)}
                style={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #d1d5db',
                  borderRadius: '0 8px 8px 0',
                  backgroundColor: '#f9fafb',
                  cursor: 'pointer',
                  color: '#374151',
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px 24px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: product.inStock ? '#2563eb' : '#d1d5db',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: product.inStock ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s ease',
              marginBottom: 24,
            }}
          >
            <ShoppingCart size={20} />
            Them vao gio hang
          </button>

          {/* Features List */}
          {product.features && product.features.length > 0 && (
            <div style={{
              padding: '16px 20px',
              backgroundColor: '#f9fafb',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 10 }}>
                Dac diem noi bat
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {product.features.map((feature: string, index: number) => (
                  <li key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    fontSize: 14,
                    color: '#374151',
                  }}>
                    <Check size={16} style={{ color: '#059669', flexShrink: 0, marginTop: 2 }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div style={{ marginBottom: 48 }}>
        {/* Tab Headers */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #e5e7eb',
          marginBottom: 24,
        }}>
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              style={{
                padding: '12px 24px',
                fontSize: 15,
                fontWeight: activeTab === index ? 700 : 500,
                color: activeTab === index ? '#2563eb' : '#6b7280',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === index ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: -2,
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: 200 }}>
          {activeTab === 0 && (
            <div style={{ fontSize: 15, lineHeight: 1.7, color: '#374151' }}>
              {product.fullDescription ? (
                <div dangerouslySetInnerHTML={{ __html: product.fullDescription }} />
              ) : (
                <p>{product.description}</p>
              )}
            </div>
          )}

          {activeTab === 1 && (
            <div>
              {product.specs && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 12 }}>
                    Thong so ky thuat
                  </h3>
                  <ProductSpecs specs={product.specs} />
                </div>
              )}
              {product.params && (
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 12 }}>
                    Thong tin san pham
                  </h3>
                  <ProductParams params={product.params} />
                </div>
              )}
              {!product.specs && !product.params && (
                <p style={{ color: '#6b7280' }}>Chua co thong so ky thuat cho san pham nay.</p>
              )}
            </div>
          )}

          {activeTab === 2 && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 24,
                padding: 20,
                backgroundColor: '#f9fafb',
                borderRadius: 10,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: '#111827' }}>{product.rating}</div>
                  <StarRating rating={product.rating} size="md" />
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{product.reviews} danh gia</div>
                </div>
                <div style={{ flex: 1 }}>
                  {[5, 4, 3, 2, 1].map(star => {
                    const percentage = star === 5 ? 60 : star === 4 ? 25 : star === 3 ? 10 : star === 2 ? 3 : 2;
                    return (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: '#6b7280', width: 12 }}>{star}</span>
                        <Star size={12} fill="#facc15" stroke="#facc15" />
                        <div style={{
                          flex: 1,
                          height: 6,
                          backgroundColor: '#e5e7eb',
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${percentage}%`,
                            height: '100%',
                            backgroundColor: '#facc15',
                            borderRadius: 3,
                          }} />
                        </div>
                        <span style={{ fontSize: 12, color: '#9ca3af', width: 30 }}>{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px 0' }}>
                Chua co danh gia nao. Hay la nguoi dau tien danh gia san pham nay!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <h2 style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#111827',
            marginBottom: 20,
          }}>
            San pham lien quan
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
          }} className="related-products-grid">
            {relatedProducts.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .related-products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
