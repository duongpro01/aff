'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviews?: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 14,
  md: 18,
  lg: 22,
};

export default function StarRating({ rating, reviews, size = 'md' }: StarRatingProps) {
  const iconSize = sizeMap[size];
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(
        <Star key={i} size={iconSize} fill="#facc15" stroke="#facc15" />
      );
    } else if (rating >= i - 0.5) {
      stars.push(
        <span key={i} style={{ position: 'relative', display: 'inline-block', width: iconSize, height: iconSize }}>
          <Star size={iconSize} fill="none" stroke="#d1d5db" style={{ position: 'absolute', top: 0, left: 0 }} />
          <span style={{ position: 'absolute', top: 0, left: 0, width: '50%', overflow: 'hidden' }}>
            <Star size={iconSize} fill="#facc15" stroke="#facc15" />
          </span>
        </span>
      );
    } else {
      stars.push(
        <Star key={i} size={iconSize} fill="none" stroke="#d1d5db" />
      );
    }
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {stars}
      {reviews !== undefined && (
        <span style={{ marginLeft: 4, fontSize: size === 'sm' ? 12 : size === 'md' ? 14 : 16, color: '#6b7280' }}>
          ({reviews})
        </span>
      )}
    </span>
  );
}
