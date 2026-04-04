import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DollDetailClient from './DollDetailClient';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

function getDolls() {
  const file = path.join(process.cwd(), 'src/data/dolls.json');
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function getCategories() {
  const file = path.join(process.cwd(), 'src/data/doll-categories.json');
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function getBrands() {
  const file = path.join(process.cwd(), 'src/data/doll-brands.json');
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dolls = getDolls();
  const doll = dolls.find((d: any) => d.slug === slug);
  if (!doll) return { title: 'Doll not found' };
  return {
    title: `${doll.name} | Premium Sex Doll`,
    description: doll.description || `${doll.name} - Premium sex doll from ${doll.brand}. ${doll.material} material, ${doll.height} height.`,
    openGraph: {
      title: doll.name,
      description: doll.description,
      images: [doll.image]
    },
  };
}

export default async function DollDetailPage({ params }: Props) {
  const { slug } = await params;
  const dolls = getDolls();
  const doll = dolls.find((d: any) => d.slug === slug);
  if (!doll) notFound();

  const categories = getCategories();
  const brands = getBrands();
  const category = categories.find((c: any) => c.slug === doll.category);
  const brand = brands.find((b: any) => b.slug === doll.brand);

  // Related dolls: same category or brand
  const sameCat = dolls.filter((d: any) => d.category === doll.category && d.id !== doll.id);
  const sameBrand = dolls.filter((d: any) => d.brand === doll.brand && d.category !== doll.category && d.id !== doll.id);
  const pool = [...sameCat, ...sameBrand];
  pool.sort((a: any, b: any) => ((a.id * 7 + doll.id) % 97) - ((b.id * 7 + doll.id) % 97));
  const relatedDolls = pool.slice(0, 8);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": doll.name,
        "description": doll.description,
        "image": doll.image,
        "brand": { "@type": "Brand", "name": brand?.name || doll.brand },
        "offers": {
          "@type": "Offer",
          "price": doll.price,
          "priceCurrency": "USD",
          "availability": doll.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      })}} />
      <DollDetailClient
        doll={doll}
        relatedDolls={relatedDolls}
        categoryName={category?.name}
        categorySlug={category?.slug}
        brandName={brand?.name || doll.brand}
      />
    </>
  );
}
