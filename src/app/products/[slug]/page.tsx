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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const products = getProducts();
  const product = products.find((p: any) => p.slug === slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description, images: [product.image] },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const products = getProducts();
  const product = products.find((p: any) => p.slug === slug);
  if (!product) notFound();

  const relatedProducts = products.filter((p: any) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.image,
        "brand": { "@type": "Brand", "name": product.brand },
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "AUD",
          "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      })}} />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
