import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getBrands, getProducts, getCategories, getDolls } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import BrandContent from '@/components/BrandContent';

export const dynamic = 'force-dynamic';

const PRODUCTS_PER_PAGE = 30;

type Props = {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ page?: string }>;
};

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'VietToy';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://viettoy.vn';

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { brand } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  const brands = getBrands();
  const brandData = brands.find((b: any) => b.slug === brand);
  if (!brandData) return { title: 'Brand Not Found' };

  const products = getProducts();
  const dolls = getDolls();
  const allProducts = [
    ...products.filter((p: any) => p.brand === brandData.slug || p.brand === brandData.name),
    ...dolls.filter((d: any) => d.brand === brandData.slug || d.brand === brandData.name),
  ];
  const totalProducts = allProducts.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  // SEO optimized title with page number
  const pageTitle = currentPage > 1
    ? `${brandData.name} Products - Page ${currentPage} of ${totalPages} | ${siteName}`
    : `${brandData.name} - Premium Adult Toys & Accessories | ${siteName}`;

  // SEO optimized description
  const baseDescription = brandData.description ||
    `Discover ${totalProducts} authentic ${brandData.name} products. Premium quality adult toys, vibrators, and accessories with discreet packaging and fast shipping.`;
  const description = currentPage > 1
    ? `Page ${currentPage}: ${baseDescription}`
    : baseDescription;

  // Canonical URL (always point to page 1 or current page)
  const canonicalUrl = currentPage > 1
    ? `${siteUrl}/${brandData.slug}?page=${currentPage}`
    : `${siteUrl}/${brandData.slug}`;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description,
      url: canonicalUrl,
      siteName,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
    },
    robots: {
      index: currentPage <= 3, // Only index first 3 pages
      follow: true,
    },
  };
}

export default async function BrandPage({ params, searchParams }: Props) {
  const { brand } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const brands = getBrands();
  const products = getProducts();
  const dolls = getDolls();
  const categories = getCategories();

  const brandData = brands.find((b: any) => b.slug === brand);
  if (!brandData) notFound();

  // Combine products and dolls for this brand
  const allBrandProducts = [
    ...products.filter((p: any) => p.brand === brandData.slug || p.brand === brandData.name).map((p: any) => ({ ...p, _type: 'product' })),
    ...dolls.filter((d: any) => d.brand === brandData.slug || d.brand === brandData.name).map((d: any) => ({ ...d, _type: 'doll' })),
  ];

  const totalProducts = allBrandProducts.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  // Paginate products
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = allBrandProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  // Get unique categories for this brand's products
  const brandCategories = [...new Set(allBrandProducts.map((p: any) => p.category))];
  const relatedCategories = categories.filter((c: any) => brandCategories.includes(c.slug));

  // Get other brands for cross-linking (exclude current, prioritize brands with content)
  const otherBrands = brands
    .filter((b: any) => b.slug !== brand)
    .sort((a: any, b: any) => (b.content?.length || 0) - (a.content?.length || 0))
    .slice(0, 8);

  // Canonical URL
  const canonicalUrl = currentPage > 1
    ? `${siteUrl}/${brandData.slug}?page=${currentPage}`
    : `${siteUrl}/${brandData.slug}`;

  // Structured data for Brand (Organization)
  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": brandData.name,
    "description": brandData.description,
    "url": `${siteUrl}/${brandData.slug}`,
    "brand": {
      "@type": "Brand",
      "name": brandData.name,
    },
  };

  // Breadcrumb structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": "Brands", "item": `${siteUrl}/products` },
      { "@type": "ListItem", "position": 3, "name": brandData.name, "item": `${siteUrl}/${brandData.slug}` },
    ],
  };

  // CollectionPage structured data for product listing
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${brandData.name} Products`,
    "description": brandData.description,
    "url": canonicalUrl,
    "numberOfItems": totalProducts,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": paginatedProducts.length,
      "itemListElement": paginatedProducts.slice(0, 10).map((p: any, i: number) => ({
        "@type": "ListItem",
        "position": i + 1,
        "url": `${siteUrl}/${p._type === 'doll' ? 'sex-dolls' : 'products'}/${p.slug}`,
        "name": p.name,
      })),
    },
  };

  // Generate pagination links
  const getPaginationUrl = (pageNum: number) =>
    pageNum === 1 ? `/${brandData.slug}` : `/${brandData.slug}?page=${pageNum}`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      <article className="container mx-auto px-4 py-8" itemScope itemType="https://schema.org/CollectionPage">
        {/* Breadcrumb Navigation */}
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/" itemProp="item" className="hover:text-purple-600">
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <li aria-hidden="true">/</li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/products" itemProp="item" className="hover:text-purple-600">
                <span itemProp="name">Products</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
            <li aria-hidden="true">/</li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span itemProp="name" className="text-gray-900 font-medium">{brandData.name}</span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </nav>

        {/* Brand Header */}
        <header className="text-center mb-10">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg" aria-hidden="true">
            {brandData.name?.charAt(0)?.toUpperCase() || 'B'}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" itemProp="name">
            {brandData.name}
            {currentPage > 1 && <span className="text-lg font-normal text-gray-500 ml-2">- Page {currentPage}</span>}
          </h1>
          {brandData.description && (
            <p className="text-gray-600 max-w-2xl mx-auto text-lg" itemProp="description">
              {brandData.description}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Showing {startIndex + 1}-{Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts)} of {totalProducts} products
          </p>
        </header>

        {/* Category Quick Links - Only on page 1 */}
        {currentPage === 1 && relatedCategories.length > 0 && (
          <nav className="mb-8" aria-label="Product categories">
            <h2 className="text-lg font-semibold mb-3">Shop {brandData.name} by Category</h2>
            <ul className="flex flex-wrap gap-2">
              {relatedCategories.map((cat: any) => (
                <li key={cat.slug}>
                  <Link
                    href={`/products/${cat.slug}?brand=${brandData.slug}`}
                    className="inline-block px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Products Grid */}
        <section aria-labelledby="products-heading">
          <h2 id="products-heading" className="text-2xl font-semibold mb-6">
            {currentPage === 1 ? `${brandData.name} Products` : `${brandData.name} Products - Page ${currentPage}`}
            <span className="text-gray-500 font-normal text-lg ml-2">({totalProducts} items)</span>
          </h2>

          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" itemProp="mainEntity" itemScope itemType="https://schema.org/ItemList">
              {paginatedProducts.map((product: any, index: number) => (
                <div key={product.slug} itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                  <meta itemProp="position" content={String(startIndex + index + 1)} />
                  <ProductCard
                    product={product}
                    href={product._type === 'doll' ? `/sex-dolls/${product.slug}` : `/products/${product.slug}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No products found for this brand.</p>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-10 flex justify-center" aria-label="Pagination">
            <ul className="flex items-center gap-1">
              {/* Previous */}
              {currentPage > 1 && (
                <li>
                  <Link
                    href={getPaginationUrl(currentPage - 1)}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 transition-colors"
                    rel="prev"
                  >
                    Previous
                  </Link>
                </li>
              )}

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .map((p, idx, arr) => (
                  <li key={p} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <Link
                      href={getPaginationUrl(p)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                        p === currentPage
                          ? 'bg-purple-600 text-white font-semibold'
                          : 'bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700'
                      }`}
                      aria-current={p === currentPage ? 'page' : undefined}
                    >
                      {p}
                    </Link>
                  </li>
                ))}

              {/* Next */}
              {currentPage < totalPages && (
                <li>
                  <Link
                    href={getPaginationUrl(currentPage + 1)}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 transition-colors"
                    rel="next"
                  >
                    Next
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}

        {/* Brand Content - Only show on page 1 */}
        {currentPage === 1 && brandData.content && (
          <BrandContent content={brandData.content} brandName={brandData.name} />
        )}

        {/* Related Brands - Only show on page 1 */}
        {currentPage === 1 && otherBrands.length > 0 && (
          <aside className="mt-12 pt-8 border-t border-gray-200" aria-labelledby="related-brands-heading">
            <h2 id="related-brands-heading" className="text-xl font-semibold mb-4">Explore Other Premium Brands</h2>
            <ul className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-3">
              {otherBrands.map((b: any) => (
                <li key={b.slug}>
                  <Link
                    href={`/${b.slug}`}
                    className="block text-center p-3 bg-gray-50 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    title={`Shop ${b.name} products`}
                  >
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm" aria-hidden="true">
                      {b.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="text-xs font-medium line-clamp-1">{b.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {/* SEO Footer Content - Only on page 1 */}
        {currentPage === 1 && (
          <footer className="mt-12 pt-8 border-t border-gray-100">
            <div className="prose prose-sm max-w-none text-gray-600">
              <h3 className="text-lg font-semibold text-gray-800">Why Choose {brandData.name} at {siteName}?</h3>
              <p>
                {siteName} is your trusted destination for authentic {brandData.name} products.
                We offer a curated selection of {totalProducts} premium items with guaranteed authenticity,
                discreet packaging, and fast shipping across Australia.
              </p>
              <p>
                Whether you&apos;re looking for vibrators, couples toys, or accessories,
                our {brandData.name} collection features the latest designs with body-safe materials
                and innovative technology for enhanced pleasure and satisfaction.
              </p>
            </div>
          </footer>
        )}
      </article>
    </>
  );
}
