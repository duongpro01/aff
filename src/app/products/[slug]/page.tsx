import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import fs from 'fs';
import path from 'path';

// Always render dynamically - products.json changes at runtime via import
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

function getProducts() {
  const file = path.join(process.cwd(), 'src/data/products.json');
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function getCategories() {
  const file = path.join(process.cwd(), 'src/data/categories.json');
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const products = getProducts();
  const product = products.find((p: any) => p.slug === slug);
  if (!product) return { title: 'Product not found' };

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'VietToy';
  const title = `${product.name} | ${siteName}`;
  const description = product.description || `Buy ${product.name} from ${product.brand}. Premium quality with discreet shipping at ${siteName}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.image ? [product.image] : [],
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const products = getProducts();
  const product = products.find((p: any) => p.slug === slug);
  if (!product) notFound();

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'VietToy';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://viettoy.vn';

  // Find the category for breadcrumb
  const categories = getCategories();
  const category = categories.find((c: any) => c.slug === product.category);

  // Related: same category first, then same brand, shuffled, up to 12
  const sameCat = products.filter((p: any) => p.category === product.category && p.id !== product.id);
  const sameBrand = products.filter((p: any) => p.brand === product.brand && p.category !== product.category && p.id !== product.id);
  const pool = [...sameCat, ...sameBrand];
  // Shuffle deterministically by product id
  pool.sort((a: any, b: any) => ((a.id * 7 + product.id) % 97) - ((b.id * 7 + product.id) % 97));
  const relatedProducts = pool.slice(0, 12);

  // Product schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "brand": { "@type": "Brand", "name": product.brand },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD",
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": { "@type": "Organization", "name": siteName }
    }
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": `${siteUrl}/products` },
      ...(category ? [{ "@type": "ListItem", "position": 3, "name": category.name, "item": `${siteUrl}/products?category=${category.slug}` }] : []),
      { "@type": "ListItem", "position": category ? 4 : 3, "name": product.name, "item": `${siteUrl}/products/${product.slug}` },
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
        categoryName={category?.name}
        categorySlug={category?.slug}
        brandSlug={product.brand}
      />
    </>
  );
}
