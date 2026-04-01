import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import products from '@/data/products.json';
import ProductDetailClient from './ProductDetailClient';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p: any) => p.slug === slug);
  if (!product) return { title: 'Khong tim thay san pham' };
  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description, images: [product.image] },
  };
}

export async function generateStaticParams() {
  return products.map((p: any) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
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
          "priceCurrency": "VND",
          "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": product.rating, "reviewCount": product.reviews }
      })}} />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
