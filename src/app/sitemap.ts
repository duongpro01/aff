import { MetadataRoute } from 'next';
import products from '@/data/products.json';
import brands from '@/data/brands.json';
import posts from '@/data/posts.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://yeupick.com';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/tin-tuc`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/thanh-ly`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${baseUrl}/so-sanh`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${baseUrl}/ranking`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.7 },
  ];

  const productPages = (products as any[]).map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const brandPages = (brands as any[]).map((b) => ({
    url: `${baseUrl}/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const postPages = (posts as any[]).map((p) => ({
    url: `${baseUrl}/tin-tuc/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...brandPages, ...postPages];
}
