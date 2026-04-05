import { MetadataRoute } from 'next';
import { getProducts, getBrands, getPosts, getDolls } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://viettoy.vn';
  const products = getProducts();
  const brands = getBrands();
  const posts = getPosts();
  const dolls = getDolls();

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/sex-dolls`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
  ];

  const productPages = products.map((p: any) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const brandPages = brands.map((b: any) => ({
    url: `${baseUrl}/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const postPages = posts.map((p: any) => ({
    url: `${baseUrl}/tin-tuc/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const dollPages = dolls.map((d: any) => ({
    url: `${baseUrl}/sex-dolls/${d.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...productPages, ...brandPages, ...postPages, ...dollPages];
}
