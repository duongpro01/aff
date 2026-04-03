import Link from 'next/link';
import { getBrands } from '@/lib/data';
import type { Brand } from '@/data/types';

export default function BrandSection() {
  const brands = getBrands() as Brand[];

  if (brands.length === 0) return null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4 text-foreground">Top Brands</h2>
        <p className="text-center text-gray-500 mb-10">Trusted brands, authentic products</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {brands.map((brand) => (
            <Link key={brand.slug} href={`/${brand.slug}`} className="group">
              <div className="bg-white border border-gray-200 rounded-xl p-5 text-center transition-all duration-300 group-hover:shadow-lg group-hover:border-purple-300 group-hover:-translate-y-1 h-full flex flex-col items-center justify-center gap-3">
                {brand.image ? (
                  <img src={brand.image} alt={brand.name} className="h-12 w-auto object-contain" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {brand.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="font-semibold text-sm text-gray-800 group-hover:text-purple-700 transition-colors">{brand.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
