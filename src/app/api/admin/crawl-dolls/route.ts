import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Allow long-running imports (up to 5 minutes)
export const maxDuration = 300;

interface DollItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  brand: string;
  category: string;
  material: string;
  height: string;
  weight: string;
  cupSize: string;
  bodyType: string;
  description: string;
  fullDescription: string;
  features: string[];
  specs: Record<string, string>;
  inStock: boolean;
  sourceUrl: string;
}

interface CrawlItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  url: string;
  brand: string;
  alreadyImported?: boolean;
}

// File paths
function getDollsFile() {
  return path.join(process.cwd(), 'src', 'data', 'dolls.json');
}

function getDollBrandsFile() {
  return path.join(process.cwd(), 'src', 'data', 'doll-brands.json');
}

function getDollImagesDir() {
  const dir = ['public', 'images', 'dolls'].join(path.sep);
  return path.join(process.cwd(), dir);
}

// Fetch helpers
async function fetchUrl(url: string, accept = 'text/html,application/json'): Promise<Response> {
  return fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': accept,
    },
  });
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetchUrl(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.text();
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetchUrl(url, 'application/json');
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

// Extract collection handle from URL
function extractCollectionHandle(url: string): string {
  const match = url.match(/\/collections\/([^/?]+)/);
  if (match) return match[1];
  // Handle brand-only URLs like joylovedolls.com/zelex-doll
  if (url.includes('joylovedolls.com')) {
    const pathMatch = url.match(/joylovedolls\.com\/([a-z0-9-]+)\/?$/i);
    if (pathMatch && pathMatch[1] !== 'products' && pathMatch[1] !== 'collections') {
      return pathMatch[1];
    }
  }
  return '';
}

// Fetch products from Shopify JSON API
// Supported product types (not just SEX DOLL)
const SUPPORTED_PRODUCT_TYPES = [
  'SEX DOLL',
  'Dolls & Masturbators',
  'TORSO',
  'Sex Torso',
];

function isValidProductType(productType: string): boolean {
  if (!productType) return false;
  const lower = productType.toLowerCase();
  return SUPPORTED_PRODUCT_TYPES.some(t => t.toLowerCase() === lower)
    || /doll|torso|masturbator|stroker/i.test(productType);
}

// Map collection handles to tag/vendor filters
function getCollectionFilter(handle: string): (product: any) => boolean {
  const filters: Record<string, (p: any) => boolean> = {
    'all': (p) => p.product_type === 'SEX DOLL',
    'all-dolls': (p) => p.product_type === 'SEX DOLL',
    'silicone-sex-dolls': (p) => p.tags?.some((t: string) => /silicone/i.test(t) && !/alternative/i.test(t)),
    'tpe-sex-dolls': (p) => p.tags?.some((t: string) => /tpe/i.test(t)),
    'best-sellers': (p) => p.tags?.some((t: string) => /best.?seller/i.test(t)),
    'new-arrivals': (p) => true, // sorted by published_at desc
    'sex-robots': (p) => p.tags?.some((t: string) => /robot/i.test(t)),
    'premium-dolls': (p) => p.tags?.some((t: string) => /premium/i.test(t)),
    'torso': (p) => p.tags?.some((t: string) => /torso/i.test(t)),
    'sex-doll-torso': (p) => /torso/i.test(p.product_type || '') || p.tags?.some((t: string) => /torso/i.test(t)),
    // Masturbators / Pocket Pussy collections
    'porn-stars-pocket-pussy': (p) => /masturbator|stroker/i.test(p.product_type || ''),
    'pocket-pussy': (p) => /masturbator|stroker|pocket/i.test(p.product_type || p.title || ''),
    'male-masturbators': (p) => /masturbator|stroker/i.test(p.product_type || ''),
    // Brand-specific collections
    'wm-doll': (p) => /wm\s*doll/i.test(p.vendor || ''),
    'wm-dolls': (p) => /wm\s*doll/i.test(p.vendor || ''),
    'irontech-doll': (p) => /irontech/i.test(p.vendor || ''),
    'zelex-doll': (p) => /zelex/i.test(p.vendor || ''),
    'starpery-doll': (p) => /starpery/i.test(p.vendor || ''),
    'starpery': (p) => /starpery/i.test(p.vendor || ''),
    'sedoll': (p) => /sedoll/i.test(p.vendor || ''),
    'real-lady': (p) => /real\s*lady/i.test(p.vendor || ''),
    'game-lady': (p) => /game\s*lady/i.test(p.vendor || ''),
  };

  // Try exact match first, then partial match on handle
  if (filters[handle]) return filters[handle];
  for (const [key, fn] of Object.entries(filters)) {
    if (handle.includes(key) || key.includes(handle)) return fn;
  }
  // Default: match by vendor or tags containing the handle keywords
  return (p) => {
    const handleWords = handle.replace(/-/g, ' ').toLowerCase();
    const vendor = (p.vendor || '').toLowerCase();
    const tags = (p.tags || []).map((t: string) => t.toLowerCase()).join(' ');
    const productType = (p.product_type || '').toLowerCase();
    return vendor.includes(handleWords) || tags.includes(handleWords) || productType.includes(handleWords);
  };
}

async function fetchShopifyProducts(collectionHandle: string, page: number = 1): Promise<any[]> {
  const baseUrl = 'https://www.joylovedolls.com';

  // Try collection-specific endpoint first (if available)
  const collectionApiUrl = `${baseUrl}/collections/${collectionHandle}/products.json?page=${page}&limit=250`;
  const globalApiUrl = `${baseUrl}/products.json?page=${page}&limit=250`;

  try {
    let data: any;
    let useCollectionEndpoint = false;

    // Try collection endpoint first
    try {
      const collectionRes = await fetchUrl(collectionApiUrl, 'application/json');
      if (collectionRes.ok) {
        data = await collectionRes.json();
        useCollectionEndpoint = true;
      }
    } catch {
      // Fall back to global endpoint
    }

    // Fall back to global products.json
    if (!data) {
      data = await fetchJson(globalApiUrl);
    }

    const allProducts = data.products || [];

    // If using collection endpoint, products are already filtered by Shopify
    if (useCollectionEndpoint) {
      return allProducts;
    }

    // Filter by valid product types
    const validProducts = allProducts.filter((p: any) => isValidProductType(p.product_type));

    // Apply collection-specific filter
    const filter = getCollectionFilter(collectionHandle);
    const filtered = validProducts.filter(filter);

    return filtered;
  } catch (err) {
    console.error('Error fetching Shopify products:', err);
    return [];
  }
}

// Parse Shopify product to CrawlItem
function parseShopifyProduct(product: any, index: number): CrawlItem {
  const baseUrl = 'https://www.joylovedolls.com';
  const price = product.variants?.[0]?.price ? parseFloat(product.variants[0].price) : 0;
  const comparePrice = product.variants?.[0]?.compare_at_price ? parseFloat(product.variants[0].compare_at_price) : undefined;

  let imageUrl = product.images?.[0]?.src || '';
  if (imageUrl.startsWith('//')) imageUrl = `https:${imageUrl}`;

  return {
    id: index + 1,
    name: product.title || '',
    slug: product.handle || '',
    price,
    originalPrice: comparePrice && comparePrice > price ? comparePrice : undefined,
    image: imageUrl,
    url: `${baseUrl}/products/${product.handle}`,
    brand: product.vendor || '',
  };
}

async function downloadImage(imageUrl: string, savePath: string): Promise<boolean> {
  try {
    const fullUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl;
    const res = await fetchUrl(fullUrl, 'image/*');
    if (!res.ok) return false;
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(savePath, Buffer.from(buffer));
    return true;
  } catch {
    return false;
  }
}

// Decode HTML entities
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

// Extract brand from product name
function extractBrand(name: string): string {
  const brandPatterns = [
    /WM\s*Doll[s]?/i,
    /Irontech/i,
    /ZELEX/i,
    /Starpery/i,
    /SEDOLL/i,
    /Real\s*Lady/i,
    /Game\s*Lady/i,
    /Angel\s*Kiss/i,
    /Doll'?s?\s*Castle/i,
    /6YE/i,
    /AF\s*Doll/i,
    /JY\s*Doll/i,
    /Piper\s*Doll/i,
    /HR\s*Doll/i,
    /Sino\s*Doll/i,
    /YL\s*Doll/i,
    /CLM/i,
    /Tantaly/i,
  ];

  for (const pattern of brandPatterns) {
    const match = name.match(pattern);
    if (match) {
      return match[0].replace(/\s+/g, ' ').trim();
    }
  }
  return '';
}

// Extract material from name or description
function extractMaterial(text: string): string {
  if (/silicone/i.test(text) && /tpe/i.test(text)) return 'Hybrid';
  if (/silicone/i.test(text)) return 'Silicone';
  if (/tpe/i.test(text)) return 'TPE';
  return '';
}

// Extract height from name
function extractHeight(text: string): string {
  // Match patterns like "166cm", "5'4"", "5ft4"
  const cmMatch = text.match(/(\d{2,3})\s*cm/i);
  if (cmMatch) return `${cmMatch[1]}cm`;

  const ftMatch = text.match(/(\d)'(\d+)[""]?/);
  if (ftMatch) return `${ftMatch[1]}'${ftMatch[2]}"`;

  const ftAltMatch = text.match(/(\d)ft\s*(\d+)/i);
  if (ftAltMatch) return `${ftAltMatch[1]}'${ftAltMatch[2]}"`;

  return '';
}

// Extract cup size
function extractCupSize(text: string): string {
  const match = text.match(/([A-K])-?Cup/i);
  if (match) return match[1].toUpperCase() + '-Cup';
  return '';
}

// Extract body type
function extractBodyType(text: string): string {
  if (/\b(chubby|bbw|plus\s*size)\b/i.test(text)) return 'BBW';
  if (/\b(curvy|thick)\b/i.test(text)) return 'Curvy';
  if (/\b(petite|slim|small)\b/i.test(text)) return 'Petite';
  if (/\b(athletic|fit)\b/i.test(text)) return 'Athletic';
  if (/\b(mature|milf)\b/i.test(text)) return 'Mature';
  return '';
}

// Detect category from product name/attributes
function detectCategory(name: string, material: string, bodyType: string): string {
  const lowerName = name.toLowerCase();

  if (/torso/i.test(lowerName)) return 'torso';
  if (/robot/i.test(lowerName)) return 'sex-robots';
  if (/anime|hentai|manga/i.test(lowerName)) return 'anime';
  if (/male\s*doll/i.test(lowerName)) return 'male-dolls';

  if (bodyType === 'BBW' || bodyType === 'Curvy') return 'curvy-bbw';
  if (bodyType === 'Petite') return 'petite';

  const cupMatch = name.match(/([A-K])-?Cup/i);
  if (cupMatch) {
    const cup = cupMatch[1].toUpperCase();
    if (['F', 'G', 'H', 'I', 'J', 'K'].includes(cup)) return 'big-bust';
  }

  if (material === 'Silicone') return 'silicone-dolls';
  if (material === 'TPE') return 'tpe-dolls';

  return 'all-dolls';
}

// Create slug from product handle or name
function createSlug(handle: string, name: string): string {
  if (handle) return handle;
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Parse products from JoyLoveDolls collection page (Shopify)
function parseJoyLoveDollsProducts(html: string, startId: number): CrawlItem[] {
  const items: CrawlItem[] = [];
  const baseUrl = 'https://www.joylovedolls.com';

  // Shopify stores product data in JSON-LD or product cards
  // Try to find product cards
  const productCardRegex = /<div[^>]*class="[^"]*product-card[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;

  // Alternative: find product links and images
  const productLinkRegex = /<a[^>]*href="(\/products\/[^"]+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[\s\S]*?<span[^>]*class="[^"]*price[^"]*"[^>]*>([^<]*)</gi;

  // Try JSON-LD first (most reliable)
  const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatch) {
    for (const match of jsonLdMatch) {
      try {
        const jsonStr = match.replace(/<\/?script[^>]*>/gi, '');
        const data = JSON.parse(jsonStr);
        if (data['@type'] === 'Product' || (Array.isArray(data) && data[0]?.['@type'] === 'Product')) {
          const products = Array.isArray(data) ? data : [data];
          for (const product of products) {
            if (product['@type'] !== 'Product') continue;
            const name = product.name || '';
            const url = product.url || '';
            const image = product.image || '';
            const price = parseFloat(product.offers?.price || '0');

            if (name && url) {
              items.push({
                id: startId + items.length,
                name: decodeHtmlEntities(name),
                slug: url.replace('/products/', '').replace(baseUrl, ''),
                price,
                image: image.startsWith('//') ? `https:${image}` : image,
                url: url.startsWith('/') ? `${baseUrl}${url}` : url,
                brand: extractBrand(name),
              });
            }
          }
        }
      } catch { /* ignore */ }
    }
  }

  // If JSON-LD didn't work, parse HTML directly
  if (items.length === 0) {
    // Find all product items in the collection
    const productBlocks = html.split(/class="[^"]*product-item[^"]*"/gi);

    for (let i = 1; i < productBlocks.length; i++) {
      const block = productBlocks[i];

      // Extract product URL
      const urlMatch = block.match(/href="(\/products\/[^"?]+)/);
      if (!urlMatch) continue;
      const productUrl = `${baseUrl}${urlMatch[1]}`;
      const slug = urlMatch[1].replace('/products/', '');

      // Extract product name
      const nameMatch = block.match(/class="[^"]*product-item__title[^"]*"[^>]*>([^<]+)/i)
        || block.match(/alt="([^"]+)"/);
      const name = nameMatch ? decodeHtmlEntities(nameMatch[1].trim()) : '';

      // Extract image
      const imgMatch = block.match(/src="(\/\/[^"]+|https?:\/\/[^"]+)"/);
      let image = imgMatch ? imgMatch[1] : '';
      if (image.startsWith('//')) image = `https:${image}`;

      // Extract price - Shopify format: $1,599.00
      const priceMatch = block.match(/\$([0-9,]+(?:\.[0-9]{2})?)/);
      const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : 0;

      // Extract compare-at price (original price)
      const compareMatch = block.match(/compare[^>]*>\s*\$([0-9,]+(?:\.[0-9]{2})?)/i);
      const originalPrice = compareMatch ? parseFloat(compareMatch[1].replace(',', '')) : undefined;

      // Extract vendor/brand
      const vendorMatch = block.match(/class="[^"]*product-item__vendor[^"]*"[^>]*>([^<]+)/i);
      const brand = vendorMatch ? vendorMatch[1].trim() : extractBrand(name);

      if (name && productUrl) {
        items.push({
          id: startId + items.length,
          name,
          slug,
          price,
          originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
          image,
          url: productUrl,
          brand,
        });
      }
    }
  }

  return items;
}

// Fetch product detail from JoyLoveDolls
async function fetchDollDetail(productUrl: string): Promise<Partial<DollItem> | null> {
  try {
    const html = await fetchHtml(productUrl);

    // Try to get JSON from Shopify product JSON endpoint
    const jsonUrl = productUrl.endsWith('.json') ? productUrl : `${productUrl}.json`;
    let productJson: any = null;

    try {
      const jsonRes = await fetchUrl(jsonUrl, 'application/json');
      if (jsonRes.ok) {
        const data = await jsonRes.json();
        productJson = data.product;
      }
    } catch { /* use HTML parsing */ }

    // Extract ALL images from JSON (high quality)
    const images: string[] = [];
    if (productJson?.images) {
      for (const img of productJson.images) {
        let imgUrl = img.src || '';
        if (imgUrl.startsWith('//')) imgUrl = `https:${imgUrl}`;
        // Remove size constraints to get full resolution
        imgUrl = imgUrl.replace(/(_\d+x\d*|\d+x\d*_)?\.(jpg|jpeg|png|webp)/gi, '.$2');
        if (imgUrl && !images.includes(imgUrl)) {
          images.push(imgUrl);
        }
      }
    }

    // Parse detailed specs from HTML (more reliable than JSON body_html)
    const specs: Record<string, string> = {};
    const features: string[] = [];

    // Extract Doll Measurements section
    const measurementsMatch = html.match(/Doll Measurements[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/i);
    if (measurementsMatch) {
      const tableHtml = measurementsMatch[1];
      // Parse table rows
      const rowRegex = /<tr[^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<\/tr>/gi;
      let rowMatch;
      while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
        const key = rowMatch[1].replace(/<[^>]+>/g, '').trim();
        const value = rowMatch[2].replace(/<[^>]+>/g, '').trim();
        if (key && value) {
          specs[key] = value;
        }
      }
    }

    // Try alternate pattern for measurements (accordion style)
    // Search only in product content area, not entire page HTML (avoids CSS/JSON garbage)
    const productContentArea = productJson?.body_html || '';
    if (Object.keys(specs).length === 0 && productContentArea) {
      const specPatterns: [RegExp, string][] = [
        [/Height[:\s]*([^<\n]+)/i, 'Height'],
        [/Weight[:\s]*([^<\n]+)/i, 'Weight'],
        [/Bust[:\s]*([^<\n]+)/i, 'Bust'],
        [/Breast[^:]*[:\s]*([^<\n]+)/i, 'Breast'],
        [/Under Breast[^:]*[:\s]*([^<\n]+)/i, 'Under Breast'],
        [/Waist[:\s]*([^<\n]+)/i, 'Waist'],
        [/Hips?[:\s]*([^<\n]+)/i, 'Hips'],
        [/Shoulder[^:]*[:\s]*([^<\n]+)/i, 'Shoulder Width'],
        [/Arm Length[:\s]*([^<\n]+)/i, 'Arm Length'],
        [/Leg Length[:\s]*([^<\n]+)/i, 'Leg Length'],
        [/Foot[^:]*[:\s]*([^<\n]+)/i, 'Foot Length'],
        [/Vaginal[^:]*[:\s]*([^<\n]+)/i, 'Vaginal Depth'],
        [/Anal[^:]*[:\s]*([^<\n]+)/i, 'Anal Depth'],
        [/Oral[^:]*[:\s]*([^<\n]+)/i, 'Oral Depth'],
      ];

      for (const [pattern, key] of specPatterns) {
        const match = productContentArea.match(pattern);
        if (match) {
          const value = match[1].replace(/<[^>]+>/g, '').trim();
          // Validate: reject CSS/JSON/code-like values
          if (value && value.length < 100
            && !value.includes('{') && !value.includes('}')
            && !value.includes(';') && !value.includes('px')
            && !value.includes('www.') && !value.includes('http')
            && !value.includes('"') && !value.includes(':')) {
            specs[key] = value;
          }
        }
      }
    }

    // Extract Material section
    const materialMatch = html.match(/Material[\s\S]*?(?:Body|Head)[:\s]*(TPE|Silicone|Silicon)/gi);
    let materialInfo = '';
    if (materialMatch) {
      const hasSilicone = /silicone/i.test(materialMatch.join(' '));
      const hasTPE = /tpe/i.test(materialMatch.join(' '));
      if (hasSilicone && hasTPE) {
        materialInfo = 'Hybrid (Silicone Head + TPE Body)';
      } else if (hasSilicone) {
        materialInfo = 'Silicone';
      } else if (hasTPE) {
        materialInfo = 'TPE';
      }
    }

    // Extract features from Product Description only (not entire page)
    const descriptionMatch = html.match(/Product Description[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>/i);
    let descriptionText = '';
    if (descriptionMatch) {
      descriptionText = descriptionMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    // Extract list items ONLY from product body_html (not entire page HTML)
    const bodyHtml = productJson?.body_html || descriptionText || '';
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch;
    while ((liMatch = liRegex.exec(bodyHtml)) !== null) {
      const text = liMatch[1].replace(/<[^>]+>/g, '').trim();
      if (text && text.length > 10 && text.length < 200 && !features.includes(text)
        && !text.includes('{') && !text.includes('}') && !text.includes('http')
        && !/^[A-Z][a-zà-ž]+$/.test(text)) { // Filter single words like "English", "Deutsch"
        features.push(text);
      }
    }

    // Extract from JSON if available
    const name = productJson?.title || '';
    const vendor = productJson?.vendor || '';
    const price = parseFloat(productJson?.variants?.[0]?.price || '0');
    const comparePrice = parseFloat(productJson?.variants?.[0]?.compare_at_price || '0');
    const inStock = productJson?.variants?.some((v: any) => v.available) ?? true;
    const rawDescription = productJson?.body_html || descriptionText;
    // Clean fullDescription: remove meta tags, empty divs, inline styles, scripts
    const fullDescription = rawDescription
      .replace(/<meta[^>]*>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<div[^>]*>\s*<\/div>/gi, '')
      .replace(/\s*style="[^"]*"/gi, '')
      .replace(/\s*class="[^"]*"/gi, '')
      .replace(/<p>\s*&nbsp;\s*<\/p>/gi, '')
      .replace(/<p>\s*<\/p>/gi, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    const description = fullDescription.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 500);

    // Determine material
    const material = materialInfo || extractMaterial(name + ' ' + description);

    // Extract measurements from specs
    const height = specs['Height'] || extractHeight(name);
    const weight = specs['Weight'] || '';
    const cupSize = extractCupSize(name) || '';
    const bodyType = extractBodyType(name + ' ' + description);
    const category = detectCategory(name, material, bodyType);

    return {
      name,
      slug: productJson?.handle || '',
      price: comparePrice > price ? price : price,
      originalPrice: comparePrice > price ? comparePrice : undefined,
      images,
      brand: vendor || extractBrand(name),
      category,
      material,
      height,
      weight,
      cupSize,
      bodyType,
      description,
      fullDescription,
      features: features.slice(0, 20), // Limit features
      specs,
      inStock,
    };
  } catch (err) {
    console.error('Error fetching doll detail:', err);
    return null;
  }
}

// Legacy HTML parsing (backup)
async function fetchDollDetailLegacy(productUrl: string): Promise<Partial<DollItem> | null> {
  try {
    const html = await fetchHtml(productUrl);

    const nameMatch = html.match(/<h1[^>]*class="[^"]*product__title[^"]*"[^>]*>([^<]+)/i)
      || html.match(/<h1[^>]*>([^<]+)/);
    const name = nameMatch ? decodeHtmlEntities(nameMatch[1].trim()) : '';

    // Images
    const images: string[] = [];
    const imgRegex = /src="(\/\/cdn\.shopify\.com\/[^"]+)"/gi;
    let imgMatch;
    const seenImages = new Set<string>();
    while ((imgMatch = imgRegex.exec(html)) !== null) {
      let imgUrl = imgMatch[1];
      if (imgUrl.startsWith('//')) imgUrl = `https:${imgUrl}`;
      if (!imgUrl.includes('_50x') && !imgUrl.includes('_100x') && !seenImages.has(imgUrl)) {
        seenImages.add(imgUrl);
        images.push(imgUrl);
      }
    }

    const priceMatch = html.match(/class="[^"]*price[^"]*"[^>]*>\s*\$([0-9,]+(?:\.[0-9]{2})?)/i);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : 0;

    const descMatch = html.match(/class="[^"]*product__description[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const fullDescription = descMatch ? descMatch[1] : '';
    const description = fullDescription.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    const material = extractMaterial(name + ' ' + description);
    const height = extractHeight(name + ' ' + description);
    const cupSize = extractCupSize(name + ' ' + description);
    const bodyType = extractBodyType(name + ' ' + description);
    const category = detectCategory(name, material, bodyType);

    return {
      name,
      price,
      images,
      brand: extractBrand(name),
      category,
      material,
      height,
      cupSize,
      bodyType,
      description,
      fullDescription,
      features: [],
      specs: {},
      inStock: true,
    };
  } catch (err) {
    console.error('Error fetching doll detail:', err);
    return null;
  }
}

// Download all images for a doll and return local paths
async function downloadDollImages(slug: string, imageUrls: string[]): Promise<string[]> {
  const dollDir = path.join(getDollImagesDir(), slug);
  if (!fs.existsSync(dollDir)) {
    fs.mkdirSync(dollDir, { recursive: true });
  }

  const localPaths: string[] = [];

  for (let i = 0; i < Math.min(imageUrls.length, 25); i++) { // Limit to 25 images
    let imageUrl = imageUrls[i];
    // Remove size suffixes for higher quality
    imageUrl = imageUrl.replace(/_\d+x\d*\./g, '.');

    const ext = imageUrl.includes('.webp') ? 'webp' : imageUrl.includes('.png') ? 'png' : 'jpg';
    const filename = i === 0 ? `main.${ext}` : `${i}.${ext}`;
    const savePath = path.join(dollDir, filename);

    if (!fs.existsSync(savePath)) {
      const ok = await downloadImage(imageUrl, savePath);
      if (!ok) continue;
    }
    localPaths.push(`/images/dolls/${slug}/${filename}`);
  }

  return localPaths;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, crawlAll, action, items: importItems, page: requestedPage } = body;

    // =================== IMPORT ONE DOLL ===================
    if (action === 'import-one' && importItems?.[0]) {
      const item = importItems[0] as CrawlItem;
      const dollsFile = getDollsFile();
      const dolls = fs.existsSync(dollsFile)
        ? JSON.parse(fs.readFileSync(dollsFile, 'utf-8'))
        : [];

      const slug = item.slug;
      if (!slug) {
        return NextResponse.json({ success: false, error: 'No slug', slug: '' });
      }

      // Skip if already exists
      const existing = dolls.findIndex((d: { slug: string }) => d.slug === slug);
      if (existing >= 0) {
        return NextResponse.json({ success: true, skipped: true, slug, images: 0 });
      }

      try {
        // Fetch product detail
        const detail = await fetchDollDetail(item.url);

        // Collect image URLs
        const allImageUrls: string[] = [];
        if (detail?.images && detail.images.length > 0) {
          allImageUrls.push(...detail.images);
        } else if (item.image) {
          allImageUrls.push(item.image);
        }

        // Download images
        const localImages = await downloadDollImages(slug, allImageUrls);

        const dollName = detail?.name || item.name;
        const dollBrand = detail?.brand || item.brand || extractBrand(dollName);
        const finalPrice = detail?.price || item.price;
        const finalOriginalPrice = detail?.originalPrice || item.originalPrice || finalPrice;

        const maxId = dolls.reduce((max: number, d: { id: number }) => Math.max(max, d.id || 0), 0);

        const material = detail?.material || extractMaterial(dollName);
        const height = detail?.height || extractHeight(dollName);
        const cupSize = detail?.cupSize || extractCupSize(dollName);
        const bodyType = detail?.bodyType || extractBodyType(dollName);
        const category = detail?.category || detectCategory(dollName, material, bodyType);

        dolls.push({
          id: maxId + 1,
          name: dollName,
          slug,
          price: finalPrice,
          originalPrice: finalOriginalPrice,
          image: localImages[0] || item.image,
          images: localImages.length > 0 ? localImages : [item.image],
          brand: dollBrand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').replace(/^-+/, ''),
          category,
          material,
          height,
          weight: detail?.specs?.['Weight'] || '',
          cupSize,
          bodyType,
          description: detail?.description || `${dollName} - Premium Sex Doll`,
          fullDescription: detail?.fullDescription || '',
          features: detail?.features || [],
          specs: detail?.specs || {},
          inStock: detail?.inStock ?? true,
          sourceUrl: item.url,
          rating: 4.5,
          reviews: 0,
        });

        // Save immediately after each doll
        fs.writeFileSync(dollsFile, JSON.stringify(dolls, null, 2), 'utf-8');

        return NextResponse.json({
          success: true,
          slug,
          name: dollName,
          images: localImages.length,
          features: detail?.features?.length || 0,
          totalDolls: dolls.length,
        });
      } catch (err) {
        return NextResponse.json({
          success: false,
          slug,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // =================== IMPORT SINGLE PRODUCT URL ===================
    if (action === 'import-product-url' && url) {
      if (!url.includes('joylovedolls.com/products/')) {
        return NextResponse.json({
          success: false,
          error: 'URL must be a JoyLoveDolls product page'
        }, { status: 400 });
      }

      // Extract slug from URL
      const slugMatch = url.match(/\/products\/([^/?]+)/);
      const slug = slugMatch ? slugMatch[1] : '';

      if (!slug) {
        return NextResponse.json({ success: false, error: 'Could not extract product slug' });
      }

      const dollsFile = getDollsFile();
      const dolls = fs.existsSync(dollsFile)
        ? JSON.parse(fs.readFileSync(dollsFile, 'utf-8'))
        : [];

      // Check if already exists
      const existing = dolls.findIndex((d: { slug: string }) => d.slug === slug);
      if (existing >= 0) {
        return NextResponse.json({
          success: true,
          skipped: true,
          name: dolls[existing].name,
          slug,
        });
      }

      try {
        // Fetch product detail
        const detail = await fetchDollDetail(url);

        if (!detail || !detail.name) {
          return NextResponse.json({ success: false, error: 'Could not fetch product details' });
        }

        // Collect image URLs
        const allImageUrls: string[] = detail.images || [];

        // Download images
        const localImages = await downloadDollImages(slug, allImageUrls);

        const dollName = detail.name;
        const dollBrand = detail.brand || extractBrand(dollName);
        const finalPrice = detail.price || 0;
        const finalOriginalPrice = detail.originalPrice || finalPrice;

        const maxId = dolls.reduce((max: number, d: { id: number }) => Math.max(max, d.id || 0), 0);

        const material = detail.material || extractMaterial(dollName);
        const height = detail.height || extractHeight(dollName);
        const cupSize = detail.cupSize || extractCupSize(dollName);
        const bodyType = detail.bodyType || extractBodyType(dollName);
        const category = detail.category || detectCategory(dollName, material, bodyType);

        dolls.push({
          id: maxId + 1,
          name: dollName,
          slug,
          price: finalPrice,
          originalPrice: finalOriginalPrice,
          image: localImages[0] || '',
          images: localImages,
          brand: dollBrand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').replace(/^-+/, ''),
          category,
          material,
          height,
          weight: detail.specs?.['Weight'] || '',
          cupSize,
          bodyType,
          description: detail.description || `${dollName}`,
          fullDescription: detail.fullDescription || '',
          features: detail.features || [],
          specs: detail.specs || {},
          inStock: detail.inStock ?? true,
          sourceUrl: url,
          rating: 4.5,
          reviews: 0,
        });

        fs.writeFileSync(dollsFile, JSON.stringify(dolls, null, 2), 'utf-8');

        return NextResponse.json({
          success: true,
          name: dollName,
          slug,
          brand: dollBrand,
          price: finalPrice,
          images: localImages.length,
          features: detail.features?.length || 0,
        });
      } catch (err) {
        return NextResponse.json({
          success: false,
          slug,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // =================== CHECK COLLECTION INFO ===================
    if (action === 'check-collection' && url) {
      if (!url.includes('joylovedolls.com')) {
        return NextResponse.json({
          error: 'Only joylovedolls.com is supported'
        }, { status: 400 });
      }

      const collectionHandle = extractCollectionHandle(url) || 'all-dolls';

      // Fetch all pages to count total matching products
      let totalProducts = 0;
      let totalPages = 0;
      const productsPerPage = 24; // Display page size for UI

      for (let page = 1; page <= 50; page++) {
        const products = await fetchShopifyProducts(collectionHandle, page);
        if (products.length === 0) break;
        totalProducts += products.length;
        totalPages = page;
      }

      // Calculate display pages (24 items per page for UI)
      const displayPages = Math.ceil(totalProducts / productsPerPage);

      return NextResponse.json({
        success: true,
        title: collectionHandle.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        totalProducts,
        totalPages: displayPages,
        productsPerPage,
      });
    }

    // =================== CRAWL COLLECTION ===================
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!url.includes('joylovedolls.com')) {
      return NextResponse.json({
        error: 'Only joylovedolls.com is supported'
      }, { status: 400 });
    }

    const collectionHandle = extractCollectionHandle(url) || 'all-dolls';

    // Determine display page (24 items per page for UI)
    let displayPage = 1;
    if (typeof requestedPage === 'number') {
      displayPage = requestedPage;
    } else if (typeof crawlAll === 'number') {
      displayPage = crawlAll + 1;
    }

    const displayPerPage = 24;

    // Accumulate all filtered products from Shopify API pages
    let allFiltered: any[] = [];
    for (let apiPage = 1; apiPage <= 50; apiPage++) {
      const products = await fetchShopifyProducts(collectionHandle, apiPage);
      if (products.length === 0) break;
      allFiltered.push(...products);
      // Stop early if we have enough for this display page
      if (allFiltered.length >= displayPage * displayPerPage) break;
    }

    // Slice for current display page
    const startIdx = (displayPage - 1) * displayPerPage;
    const pageProducts = allFiltered.slice(startIdx, startIdx + displayPerPage);

    // Parse products to CrawlItem format
    const items: CrawlItem[] = pageProducts.map((product, index) =>
      parseShopifyProduct(product, startIdx + index)
    );

    const totalProducts = allFiltered.length;
    const totalPages = Math.ceil(totalProducts / displayPerPage);

    // Get existing dolls to mark already imported
    const dollsFile = getDollsFile();
    const existingDolls = fs.existsSync(dollsFile)
      ? JSON.parse(fs.readFileSync(dollsFile, 'utf-8'))
      : [];
    const existingSlugs = new Set(existingDolls.map((d: { slug: string }) => d.slug));

    const itemsWithStatus = items.map(item => ({
      ...item,
      alreadyImported: existingSlugs.has(item.slug || ''),
    }));

    const newCount = itemsWithStatus.filter(i => !i.alreadyImported).length;
    const existingCount = itemsWithStatus.filter(i => i.alreadyImported).length;

    return NextResponse.json({
      success: true,
      count: items.length,
      newCount,
      existingCount,
      currentPage: displayPage,
      totalPages,
      totalProducts,
      items: itemsWithStatus,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Crawl failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
