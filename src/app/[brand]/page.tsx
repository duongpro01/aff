import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getBrands, getProducts } from '@/lib/data';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ brand: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params;
  const brands = getBrands();
  const brandData = brands.find((b: any) => b.slug === brand);
  if (!brandData) return { title: 'Brand Not Found' };
  return { title: `${brandData.name}`, description: brandData.description };
}

export default async function BrandPage({ params }: Props) {
  const { brand } = await params;
  const brands = getBrands();
  const products = getProducts();

  const brandData = brands.find((b: any) => b.slug === brand);
  if (!brandData) notFound();

  const brandProducts = products.filter((p: any) => p.brand === brandData.slug || p.brand === brandData.name);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg">
          {brandData.name?.charAt(0)?.toUpperCase() || 'B'}
        </div>
        <h1 className="text-3xl font-bold text-center mb-3">{brandData.name}</h1>
        {brandData.description && <p className="text-gray-600 text-center max-w-2xl">{brandData.description}</p>}
      </div>
      {brandData.content && <div className="prose prose-lg max-w-4xl mx-auto mb-10" dangerouslySetInnerHTML={{ __html: brandData.content }} />}
      <h2 className="text-2xl font-semibold mb-4">Products ({brandProducts.length})</h2>
      {brandProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {brandProducts.map((product: any) => <ProductCard key={product.slug} product={product} />)}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">No products found for this brand.</p>
      )}
    </div>
  );
}
