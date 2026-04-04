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

const formatPrice = (price: number) => 'A$' + price.toFixed(2);

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
    <div className="product-card rounded-lg sm:rounded-xl overflow-hidden bg-white border border-gray-200 relative">
      <Link href={`/products/${product.slug}`} className="no-underline text-inherit block">
        <div className="product-image relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300"
          />
          {discount > 0 && (
            <span className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
              -{discount}%
            </span>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
              Out of Stock
            </div>
          )}
        </div>

        <div className="p-2 sm:p-3">
          {product.brand && (
            <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 truncate">
              {product.brand}
            </div>
          )}
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-1.5 line-clamp-2 leading-snug min-h-[2.5em] sm:min-h-[2.75em]">
            {product.name}
          </h3>

          <div className="mb-1 sm:mb-1.5">
            <StarRating rating={product.rating} reviews={product.reviews} size="sm" />
          </div>

          <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
            <span className="text-sm sm:text-base font-bold text-red-600">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-2 sm:px-3 pb-2 sm:pb-3">
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-md sm:rounded-lg border-none text-white text-xs sm:text-sm font-semibold transition-colors ${product.inStock ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Add to Cart</span>
          <span className="xs:hidden">Add</span>
        </button>
      </div>
    </div>
  );
}
