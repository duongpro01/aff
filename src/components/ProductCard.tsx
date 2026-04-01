'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import StarRating from './StarRating';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand?: string;
  rating: number;
  reviews: number;
  inStock: boolean;
}

interface ProductCardProps {
  product: Product;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN').format(price) + 'đ';

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <div className="product-card" style={{
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
      transition: 'box-shadow 0.2s ease',
      position: 'relative',
    }}>
      <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="product-image" style={{
          position: 'relative',
          aspectRatio: '1',
          overflow: 'hidden',
          backgroundColor: '#f9fafb',
        }}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
            }}
          />
          {discount > 0 && (
            <span style={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: '#ef4444',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 4,
            }}>
              -{discount}%
            </span>
          )}
          {!product.inStock && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
            }}>
              Het hang
            </div>
          )}
        </div>

        <div style={{ padding: '12px 14px' }}>
          {product.brand && (
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
              {product.brand}
            </div>
          )}
          <h3 style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#111827',
            margin: '0 0 6px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4,
          }}>
            {product.name}
          </h3>

          <div style={{ marginBottom: 6 }}>
            <StarRating rating={product.rating} reviews={product.reviews} size="sm" />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#dc2626' }}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span style={{
                fontSize: 13,
                color: '#9ca3af',
                textDecoration: 'line-through',
              }}>
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div style={{ padding: '0 14px 12px' }}>
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 0',
            borderRadius: 8,
            border: 'none',
            backgroundColor: product.inStock ? '#2563eb' : '#d1d5db',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: product.inStock ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s ease',
          }}
        >
          <ShoppingCart size={16} />
          Them gio hang
        </button>
      </div>
    </div>
  );
}
