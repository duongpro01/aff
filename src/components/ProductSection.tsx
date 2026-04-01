import Link from 'next/link';
import products from '@/data/products.json';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/data/types';

const categoryNames: Record<string, string> = {
  vot: 'Vợt Pickleball',
  bong: 'Bóng Pickleball',
  giay: 'Giày Pickleball',
  'phu-kien': 'Phụ kiện',
  'quan-ao': 'Quần áo',
};

const categoryOrder = ['vot', 'bong', 'giay', 'phu-kien', 'quan-ao'];

export default function ProductSection() {
  const grouped: Record<string, Product[]> = {};

  for (const product of products as Product[]) {
    if (!grouped[product.category]) {
      grouped[product.category] = [];
    }
    grouped[product.category].push(product);
  }

  const orderedCategories = categoryOrder.filter((cat) => grouped[cat]?.length);

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10 text-foreground">
          Sản phẩm nổi bật
        </h2>

        {orderedCategories.map((cat) => (
          <div key={cat} className="mb-12 last:mb-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                {categoryNames[cat] || cat}
              </h3>
              <Link
                href={`/products?category=${cat}`}
                className="text-accent hover:text-accent-light font-medium text-sm transition-colors"
              >
                Xem tất cả &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {grouped[cat].slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
