import Link from 'next/link';
import { getProducts } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/data/types';

export default function ProductSection() {
  const allProducts = getProducts() as Product[];

  if (allProducts.length === 0) return null;

  // Group by brand (top 4 brands by product count)
  const brandCount: Record<string, number> = {};
  for (const p of allProducts) {
    brandCount[p.brand] = (brandCount[p.brand] || 0) + 1;
  }
  const topBrands = Object.entries(brandCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([brand]) => brand);

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10 text-foreground">Featured Products</h2>
        {topBrands.map((brand) => {
          const brandProducts = allProducts.filter(p => p.brand === brand);
          return (
            <div key={brand} className="mb-12 last:mb-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground capitalize">{brand}</h3>
                <Link href={`/products?brand=${brand}`} className="text-accent hover:text-accent-light font-medium text-sm transition-colors">
                  View all ({brandProducts.length}) &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {brandProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
