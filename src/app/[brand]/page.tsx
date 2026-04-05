import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getBrands, getProducts, getCategories } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import BrandContent from '@/components/BrandContent';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ brand: string }> };

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'VietToy';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://viettoy.vn';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params;
  const brands = getBrands();
  const brandData = brands.find((b: any) => b.slug === brand);
  if (!brandData) return { title: 'Brand Not Found' };

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'VietToy';
  const title = `${brandData.name} Adult Toys & Products | ${siteName}`;
  const description = brandData.description || `Shop authentic ${brandData.name} products. Premium adult toys with discreet shipping and best prices at ${siteName}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function BrandPage({ params }: Props) {
  const { brand } = await params;
  const brands = getBrands();
  const products = getProducts();
  const categories = getCategories();

  const brandData = brands.find((b: any) => b.slug === brand);
  if (!brandData) notFound();

  const brandProducts = products.filter((p: any) => p.brand === brandData.slug || p.brand === brandData.name);

  // Get unique categories for this brand's products
  const brandCategories = [...new Set(brandProducts.map((p: any) => p.category))];
  const relatedCategories = categories.filter((c: any) => brandCategories.includes(c.slug));

  // Get other brands for cross-linking (exclude current)
  const otherBrands = brands.filter((b: any) => b.slug !== brand).slice(0, 6);

  // Structured data for Brand
  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": brandData.name,
    "description": brandData.description,
    "url": `${siteUrl}/${brandData.slug}`,
  };

  // Breadcrumb structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": "Brands", "item": `${siteUrl}/products` },
      { "@type": "ListItem", "position": 3, "name": brandData.name, "item": `${siteUrl}/${brandData.slug}` },
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-purple-600">Home</Link></li>
            <li>/</li>
            <li><Link href="/products" className="hover:text-purple-600">Products</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{brandData.name}</li>
          </ol>
        </nav>

        {/* Brand Header */}
        <header className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg">
            {brandData.name?.charAt(0)?.toUpperCase() || 'B'}
          </div>
          <h1 className="text-3xl font-bold text-center mb-3">{brandData.name}</h1>
          {brandData.description && (
            <p className="text-gray-600 text-center max-w-2xl">{brandData.description}</p>
          )}
        </header>

        {/* Category Quick Links */}
        {relatedCategories.length > 0 && (
          <nav className="mb-8" aria-label="Product categories">
            <h2 className="text-lg font-semibold mb-3">Shop by Category</h2>
            <div className="flex flex-wrap gap-2">
              {relatedCategories.map((cat: any) => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}&brand=${brandData.slug}`}
                  className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {/* Products Grid */}
        <section aria-labelledby="products-heading">
          <h2 id="products-heading" className="text-2xl font-semibold mb-4">
            {brandData.name} Products ({brandProducts.length})
          </h2>
          {brandProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {brandProducts.map((product: any) => <ProductCard key={product.slug} product={product} />)}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No products found for this brand.</p>
          )}
        </section>

        {/* Brand Content - Below Products with Show More */}
        {brandData.content && (
          <BrandContent content={brandData.content} brandName={brandData.name} />
        )}

        {/* Related Brands */}
        {otherBrands.length > 0 && (
          <aside className="mt-12 pt-8 border-t border-gray-200" aria-label="Related brands">
            <h2 className="text-xl font-semibold mb-4">Explore Other Brands</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {otherBrands.map((b: any) => (
                <Link
                  key={b.slug}
                  href={`/${b.slug}`}
                  className="text-center p-3 bg-gray-50 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors"
                >
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
                    {b.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-xs font-medium">{b.name}</span>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
