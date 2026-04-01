import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import brands from '@/data/brands.json';
import products from '@/data/products.json';
import ProductCard from '@/components/ProductCard';

type Props = {
  params: Promise<{ brand: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params;
  const brandData = (brands as any[]).find((b) => b.slug === brand);

  if (!brandData) {
    return { title: 'Brand Not Found' };
  }

  return {
    title: `${brandData.name} - Yeupick`,
    description: brandData.description || `Xem tất cả sản phẩm ${brandData.name} tại Yeupick`,
  };
}

export async function generateStaticParams() {
  return (brands as any[]).map((b) => ({
    brand: b.slug,
  }));
}

export default async function BrandPage({ params }: Props) {
  const { brand } = await params;
  const brandData = (brands as any[]).find((b) => b.slug === brand);

  if (!brandData) {
    notFound();
  }

  const brandProducts = (products as any[]).filter(
    (p) => p.brand === brandData.name || p.brandSlug === brandData.slug
  );

  const initial = brandData.name?.charAt(0)?.toUpperCase() || 'B';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg">
          {initial}
        </div>
        <h1 className="text-3xl font-bold text-center mb-3">{brandData.name}</h1>
        {brandData.description && (
          <p className="text-gray-600 text-center max-w-2xl">{brandData.description}</p>
        )}
      </div>

      {/* Brand Content */}
      {brandData.content && (
        <div
          className="prose prose-lg max-w-4xl mx-auto mb-10"
          dangerouslySetInnerHTML={{ __html: brandData.content }}
        />
      )}

      {/* Products Grid */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">
          Sản phẩm {brandData.name} ({brandProducts.length})
        </h2>
      </div>

      {brandProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {brandProducts.map((product: any) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">
          Chưa có sản phẩm nào cho thương hiệu này.
        </p>
      )}
    </div>
  );
}
