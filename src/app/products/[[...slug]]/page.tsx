import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ProductsClient from './ProductsClient';
import ProductDetailClient from './ProductDetailClient';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug?: string[] }>;
};

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'VietToy';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://viettoy.vn';

function getProducts() {
  const file = path.join(process.cwd(), 'src/data/products.json');
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function getCategories() {
  const file = path.join(process.cwd(), 'src/data/categories.json');
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function getBrands() {
  const file = path.join(process.cwd(), 'src/data/brands.json');
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const products = getProducts();
  const categories = getCategories();

  // No slug = all products
  if (!slug || slug.length === 0) {
    return {
      title: `All Products | ${siteName}`,
      description: `Browse our full range of premium adult toys and accessories. Vibrators, dildos, couples toys and more from top brands at ${siteName}.`,
      openGraph: {
        title: `All Products | ${siteName}`,
        description: 'Browse our full range of premium adult toys and accessories from top brands.',
        type: 'website',
      },
    };
  }

  const slugStr = slug[0];

  // Check if it's a category
  const category = categories.find((c: any) => c.slug === slugStr);
  if (category) {
    const categoryProducts = products.filter((p: any) => p.category === category.slug);
    return {
      title: `${category.name} | ${siteName}`,
      description: category.description || `Shop ${category.name} at ${siteName}. ${categoryProducts.length} products available.`,
      alternates: {
        canonical: `${siteUrl}/products/${category.slug}`,
      },
      openGraph: {
        title: `${category.name} | ${siteName}`,
        description: category.description || `Shop ${category.name} at ${siteName}.`,
        type: 'website',
        url: `${siteUrl}/products/${category.slug}`,
      },
    };
  }

  // Check if it's a product
  const product = products.find((p: any) => p.slug === slugStr);
  if (product) {
    const title = `${product.name} | ${siteName}`;
    const description = product.description || `Buy ${product.name} from ${product.brand}. Premium quality with discreet shipping at ${siteName}.`;
    return {
      title,
      description,
      alternates: {
        canonical: `${siteUrl}/products/${product.slug}`,
      },
      openGraph: {
        title,
        description,
        images: product.image ? [product.image] : [],
        type: 'website',
        url: `${siteUrl}/products/${product.slug}`,
      },
    };
  }

  return { title: 'Not Found' };
}

export default async function ProductsPage({ params }: Props) {
  const { slug } = await params;
  const products = getProducts();
  const categories = getCategories();
  const brands = getBrands();

  // No slug = all products page
  if (!slug || slug.length === 0) {
    return (
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <ProductsClient products={products} brands={brands} categories={categories} />
      </Suspense>
    );
  }

  const slugStr = slug[0];

  // Check if it's a category
  const category = categories.find((c: any) => c.slug === slugStr);
  if (category) {
    // Filter products by category
    const categoryProducts = products.filter((p: any) => p.category === category.slug);

    // Category page schema
    const categorySchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": category.name,
      "description": category.description,
      "url": `${siteUrl}/products/${category.slug}`,
      "numberOfItems": categoryProducts.length,
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
        { "@type": "ListItem", "position": 2, "name": "Products", "item": `${siteUrl}/products` },
        { "@type": "ListItem", "position": 3, "name": category.name, "item": `${siteUrl}/products/${category.slug}` },
      ]
    };

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
          <ProductsClient
            products={categoryProducts}
            brands={brands}
            categories={categories}
            currentCategory={category}
          />
        </Suspense>
      </>
    );
  }

  // Check if it's a product
  const product = products.find((p: any) => p.slug === slugStr);
  if (product) {
    const productCategory = categories.find((c: any) => c.slug === product.category);

    // Related products
    const sameCat = products.filter((p: any) => p.category === product.category && p.id !== product.id);
    const sameBrand = products.filter((p: any) => p.brand === product.brand && p.category !== product.category && p.id !== product.id);
    const pool = [...sameCat, ...sameBrand];
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

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
        { "@type": "ListItem", "position": 2, "name": "Products", "item": `${siteUrl}/products` },
        ...(productCategory ? [{ "@type": "ListItem", "position": 3, "name": productCategory.name, "item": `${siteUrl}/products/${productCategory.slug}` }] : []),
        { "@type": "ListItem", "position": productCategory ? 4 : 3, "name": product.name, "item": `${siteUrl}/products/${product.slug}` },
      ]
    };

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <ProductDetailClient
          product={product}
          relatedProducts={relatedProducts}
          categoryName={productCategory?.name}
          categorySlug={productCategory?.slug}
          brandSlug={product.brand}
        />
      </>
    );
  }

  // Neither category nor product found
  notFound();
}
