'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Doll {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand?: string;
  material?: string;
  height?: string;
  cupSize?: string;
  inStock: boolean;
}

interface DollCardProps {
  doll: Doll;
}

const formatPrice = (price: number) => 'A$' + price.toFixed(2);

export default function DollCard({ doll }: DollCardProps) {
  const discount = doll.originalPrice && doll.originalPrice > doll.price
    ? Math.round((1 - doll.price / doll.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card rounded-lg sm:rounded-xl overflow-hidden bg-white border border-gray-200 relative">
      <Link href={`/sex-dolls/${doll.slug}`} className="no-underline text-inherit block">
        <div className="product-image relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={doll.image || '/images/placeholder-doll.jpg'}
            alt={doll.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300"
          />
          {discount > 0 && (
            <span className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
              -{discount}%
            </span>
          )}
          {!doll.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
              Out of Stock
            </div>
          )}
        </div>

        <div className="p-2 sm:p-3">
          {doll.brand && (
            <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 truncate">
              {doll.brand}
            </div>
          )}
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-1.5 line-clamp-2 leading-snug min-h-[2.5em] sm:min-h-[2.75em]">
            {doll.name}
          </h3>

          <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
            <span className="text-sm sm:text-base font-bold text-red-600">
              {formatPrice(doll.price)}
            </span>
            {doll.originalPrice && doll.originalPrice > doll.price && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                {formatPrice(doll.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-2 sm:px-3 pb-2 sm:pb-3">
        <Link
          href={`/sex-dolls/${doll.slug}`}
          className="w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-md sm:rounded-lg border-none bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
