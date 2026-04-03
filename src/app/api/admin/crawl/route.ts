import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Allow long-running imports (up to 5 minutes)
export const maxDuration = 300;

interface CrawlItem {
  id: number;
  name: string;
  brand: string;
  code: string;
  price: number;
  originalPrice?: number;
  url: string;
  image: string;
  slug?: string;
  category?: string;
}

interface ImportItem extends CrawlItem {
  slug: string;
}

// Map wildsecrets URL paths to local category slugs
const URL_CATEGORY_MAP: Record<string, string> = {
  'vibrators': 'vibrators',
  'dongs-dildos-strapons': 'dongs-dildos-strapons',
  'anal-toys': 'anal-toys',
  'bondage': 'fetish-bondage',
  'lubes-essentials': 'lubes-essentials',
  'lingerie': 'lingerie',
  'his-toys': 'his-toys',
  'her-toys': 'her-toys',
  'couples-toys': 'couples-toys',
};

// Keyword-based category detection from product name (no trailing \b — match prefixes like vibrat→vibrator)
const CATEGORY_KEYWORDS: [RegExp, string][] = [
  [/\b(vibrat|vibe\b|wand\b|massager|bullet|stimulat|pulse)/i, 'vibrators'],
  [/\b(dildo|dong\b|strap.?on)/i, 'dongs-dildos-strapons'],
  [/\b(anal|butt\s*plug|prostate|beads\b)/i, 'anal-toys'],
  [/\b(bondage|restraint|whip\b|paddle|blindfold|gag\b|fetish|handcuff|collar\b|clamp)/i, 'fetish-bondage'],
  [/\b(stroker|masturbat|cock\s*ring|penis\b|sleeve\b)/i, 'his-toys'],
  [/\b(kegel|ben\s*wa|egg\b|clitor)/i, 'her-toys'],
  [/\b(couple|remote.?control|app.?control|wearable)/i, 'couples-toys'],
  [/\b(lingerie|babydoll|bodysuit|stocking|costume|corset|bra\b|panty|panties|thong)/i, 'lingerie'],
  [/\b(lube\b|lubricant|cleaner|douche|wash\b)/i, 'lubes-essentials'],
];

function detectCategory(productName: string, sourcePageUrl?: string): string {
  // 1. Try matching from the crawl source page URL (category page)
  if (sourcePageUrl) {
    const urlPath = sourcePageUrl.replace(/https?:\/\/[^/]+/, '').replace(/^\//, '').split('/')[0].split('?')[0];
    if (URL_CATEGORY_MAP[urlPath]) return URL_CATEGORY_MAP[urlPath];
  }

  // 2. Keyword match from product name
  for (const [pattern, cat] of CATEGORY_KEYWORDS) {
    if (pattern.test(productName)) return cat;
  }

  // 3. Default
  return 'vibrators';
}

function getProductsFile() {
  return path.join(process.cwd(), 'src', 'data', 'products.json');
}

// Use getter to prevent Turbopack from tracing dynamic file paths
function getImagesDir() {
  const dir = ['public', 'images', 'products'].join(path.sep);
  return path.join(process.cwd(), dir);
}

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

async function downloadImage(imageUrl: string, savePath: string): Promise<boolean> {
  try {
    // Fix protocol-relative URLs
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

// Extract slug from Wild Secrets product URL: /p/236795/some-slug -> some-slug
function extractSlug(productUrl: string): string {
  const match = productUrl.match(/\/p\/\d+\/(.+?)(?:\?|$)/);
  return match ? match[1] : '';
}

// Parse products from Wild Secrets FilterProducts API response
function parseWildSecretsProducts(html: string, startId: number): CrawlItem[] {
  const items: CrawlItem[] = [];
  const baseUrl = 'https://www.wildsecrets.com.au';

  const productBlocks = html.split(/class="product product-brief"/);

  for (let i = 1; i < productBlocks.length; i++) {
    const block = productBlocks[i];

    const dataMatch = block.match(/data-data-layer-model="([^"]+)"/);
    if (!dataMatch) continue;

    let name = '', brand = '', code = '', price = 0;
    try {
      const decoded = dataMatch[1]
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&#x27;/g, "'");
      const obj = JSON.parse(decoded);
      name = obj.productName || '';
      brand = obj.brandName || '';
      code = obj.productCode || '';
      price = obj.price || 0;
    } catch {
      continue;
    }

    if (!name) continue;

    const dontPayMatch = block.match(/Don(?:'|&#x27;|&apos;)?t pay\s*<span>\$([\d,.]+)<\/span>/i);
    const originalPrice = dontPayMatch ? parseFloat(dontPayMatch[1].replace(',', '')) : undefined;

    // Try product-url-value first, fallback to <a href="/p/...">
    const urlMatch = block.match(/product-url-value="([^"]+)"/)
      || block.match(/href="(\/p\/\d+\/[^"]+)"/);
    const productPath = urlMatch ? urlMatch[1] : '';
    const productUrl = productPath ? `${baseUrl}${productPath}` : '';
    const slug = extractSlug(productUrl);

    const imgMatch = block.match(/src="((?:https:)?\/\/[^"]*(?:wildsecrets|searchspring|exciteonline)[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
    const image = imgMatch ? imgMatch[1] : '';

    items.push({
      id: startId + items.length,
      name: brand ? `${brand} ${name}` : name,
      brand,
      code,
      price,
      originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
      url: productUrl,
      image: image.startsWith('//') ? `https:${image}` : image,
      slug,
    });
  }

  return items;
}

interface ProductDetail {
  name: string;
  brand: string;
  description: string;
  fullDescription: string;
  features: string[];
  images: string[];
  specs: Record<string, string>;
  price: number;
  salePrice: number;
  originalPrice: number;
  isOnSale: boolean;
  saveAmount: string;
  itemCode: string;
  rewardDollars: string;
  color: string;
  sku: string;
  inStock: boolean;
}

// Fetch product detail page and extract ALL product information
async function fetchProductDetail(productUrl: string): Promise<ProductDetail | null> {
  try {
    const html = await fetchHtml(productUrl);

    // ===== 1. PRODUCT NAME (from h1 > span) =====
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    const name = h1Match
      ? h1Match[1].replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim()
      : '';

    // ===== 2. BRAND (from class="brand" > a) =====
    const brandMatch = html.match(/class="brand"[^>]*>\s*<a[^>]*>([^<]+)/);
    const brand = brandMatch ? brandMatch[1].trim() : '';

    // ===== 3. PRICE (from price container) =====
    const amountMatch = html.match(/class="amount">([^<]+)/);
    const centsMatch = html.match(/class="cents"><span>([^<]+)/);
    const salePrice = amountMatch && centsMatch
      ? parseFloat(amountMatch[1].replace('$', '').trim() + centsMatch[1].trim())
      : 0;

    const dontPayMatch = html.match(/class="dont-pay"[^>]*>[^<]*<span>\$([\d,.]+)/);
    const originalPrice = dontPayMatch ? parseFloat(dontPayMatch[1].replace(',', '')) : salePrice;

    const isOnSale = html.includes('class="sale">SALE');

    const saveMatch = html.match(/class="save">\s*Save ([^<]+)/);
    const saveAmount = saveMatch ? saveMatch[1].trim() : '';

    // Data Layer for accurate pricing
    const dlMatch = html.match(/data-data-layer-model="([^"]+)"/);
    let dlPrice = 0;
    let dlSalePrice = 0;
    if (dlMatch) {
      try {
        const dl = JSON.parse(dlMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
        dlPrice = dl.price || 0;
        dlSalePrice = dl.salePrice || 0;
      } catch { /* ignore */ }
    }

    const finalPrice = dlSalePrice || salePrice || dlPrice;
    const finalOriginalPrice = dlPrice || originalPrice;

    // ===== 4. IMAGES (from colourway JSON - best source, has all image URLs) =====
    const images: string[] = [];
    const cwMatch = html.match(/data-product-add-to-cart-selected-colourway-value='([^']+)'/);
    if (cwMatch) {
      try {
        const cw = JSON.parse(cwMatch[1].replace(/&quot;/g, '"'));
        if (cw.images) {
          for (const img of cw.images) {
            // Prefer webp large images, skip brand asset banners
            const url = img.largeImageUrlWebp || img.largeImageUrl || '';
            if (url && !url.includes('brand-assets')) {
              images.push(url.startsWith('//') ? `https:${url}` : url);
            }
          }
        }
      } catch { /* ignore */ }
    }

    // Fallback: get large images from HTML src attributes
    if (images.length === 0) {
      const largeRegex = /src="((?:https?:)?\/\/media\.exciteonlineservices[^"]*large[^"]*\.(?:webp|jpg)[^"]*)"/gi;
      let m;
      while ((m = largeRegex.exec(html)) !== null) {
        let url = m[1];
        if (url.startsWith('//')) url = `https:${url}`;
        if (!images.includes(url)) images.push(url);
      }
    }

    // ===== 5. DESCRIPTION (from product-description accordion) =====
    let description = '';
    const descIdx = html.indexOf('data-controller="product-description"');
    if (descIdx > 0) {
      const featIdx = html.indexOf('class="features"', descIdx);
      const endIdx = featIdx > descIdx ? featIdx : descIdx + 5000;
      const descSection = html.substring(descIdx, endIdx);

      // Get paragraphs
      const paras: string[] = [];
      const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/g;
      let m;
      while ((m = pRegex.exec(descSection)) !== null) {
        const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
        if (text && text.length > 10) paras.push(text);
      }
      description = paras.join('\n\n');
    }

    // Full description HTML (for rich display)
    let fullDescription = '';
    // Get the accordion content after "Description" trigger
    const descTriggerIdx = html.indexOf('product-description#toggle');
    if (descTriggerIdx > 0) {
      const afterTrigger = html.substring(descTriggerIdx);
      // Find the accordion content div
      const contentStart = afterTrigger.indexOf('</a>');
      const featuresStart = afterTrigger.indexOf('class="features"');
      if (contentStart > 0 && featuresStart > contentStart) {
        let content = afterTrigger.substring(contentStart + 4, featuresStart).trim();
        // Clean up: remove outer wrapper divs
        content = content.replace(/^\s*<\/[^>]+>\s*<div[^>]*>\s*/i, '');
        // Keep the HTML but clean it
        content = content
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        // Remove trailing closing divs
        content = content.replace(/(<\/div>\s*)+$/i, '').trim();
        if (content.length > 20) fullDescription = content;
      }
    }
    if (!fullDescription) fullDescription = description;

    // ===== 6. FEATURES (bullet points from features section) =====
    const features: string[] = [];
    const featIdx = html.indexOf('class="features"');
    if (featIdx > 0) {
      const featChunk = html.substring(featIdx, featIdx + 3000);
      // Extract * bullet points
      const starRegex = /\*\s*([^*<\n]+)/g;
      let m;
      while ((m = starRegex.exec(featChunk)) !== null) {
        const text = m[1].replace(/&amp;/g, '&').trim();
        if (text) features.push(text);
      }
    }

    // ===== 7. SPECS (Size + Material from features section) =====
    const specs: Record<string, string> = {};
    if (featIdx > 0) {
      const featChunk = html.substring(featIdx, featIdx + 3000);
      const textContent = featChunk.replace(/<[^>]+>/g, '|').replace(/\|+/g, '|').replace(/\s+/g, ' ');

      // Extract Size specs: "Total Length: X", "Insertable Length: X", etc
      const sizePatterns = [
        /Total Length:\s*([^|]+)/i,
        /Insertable Length:\s*([^|]+)/i,
        /Total Width(?:\/Base)?:\s*([^|]+)/i,
        /Width:\s*([^|]+)/i,
        /Girth:\s*([^|]+)/i,
        /Diameter:\s*([^|]+)/i,
      ];
      for (const pattern of sizePatterns) {
        const m = textContent.match(pattern);
        if (m) {
          const key = pattern.source.split(':')[0].replace(/\\/g, '').replace(/\(\?:.*?\)/g, '');
          specs[key.replace(/\|/g, '').trim()] = m[1].trim();
        }
      }

      // Material
      const matMatch = textContent.match(/Material\|([^|]+)/i);
      if (matMatch) specs['Material'] = matMatch[1].trim();
    }

    // ===== 8. ITEM CODE, SKU, COLOR, STOCK =====
    const itemCodeMatch = html.match(/Item Code:\s*([A-Z0-9]+)/);
    const itemCode = itemCodeMatch ? itemCodeMatch[1] : '';

    const inStock = html.includes('schema.org/InStock');

    let color = '';
    let sku = '';
    if (cwMatch) {
      try {
        const cw = JSON.parse(cwMatch[1].replace(/&quot;/g, '"'));
        color = cw.name || '';
        if (cw.variants?.[0]) sku = cw.variants[0].sku || '';
      } catch { /* ignore */ }
    }

    // Reward dollars
    const rewardMatch = html.match(/loyalty-dollars-value-value="([^"]+)"/);
    const rewardDollars = rewardMatch ? rewardMatch[1] : '';

    return {
      name: name || '',
      brand,
      description,
      fullDescription,
      features,
      images,
      specs,
      price: finalOriginalPrice,
      salePrice: finalPrice,
      originalPrice: finalOriginalPrice,
      isOnSale,
      saveAmount,
      itemCode,
      rewardDollars,
      color,
      sku,
      inStock,
    };
  } catch (err) {
    console.error('Error fetching product detail:', err);
    return null;
  }
}

// Download all images for a product and return local paths
async function downloadProductImages(slug: string, imageUrls: string[]): Promise<string[]> {
  const productDir = [getImagesDir(), slug].join(path.sep);
  if (!fs.existsSync(productDir)) {
    fs.mkdirSync(productDir, { recursive: true });
  }

  const localPaths: string[] = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const imageUrl = imageUrls[i];
    const ext = imageUrl.includes('.webp') ? 'webp' : imageUrl.includes('.png') ? 'png' : 'jpg';
    const filename = i === 0 ? `main.${ext}` : `${i}.${ext}`;
    const savePath = `${productDir}${path.sep}${filename}`;

    if (!fs.existsSync(savePath)) {
      const ok = await downloadImage(imageUrl, savePath);
      if (!ok) continue;
    }
    localPaths.push(`/images/products/${slug}/${filename}`);
  }

  return localPaths;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, crawlAll, action, items: importItems, sourcePageUrl } = body;

    // =================== IMPORT ONE ITEM ===================
    if (action === 'import-one' && importItems?.[0]) {
      const item = importItems[0] as ImportItem;
      const productsFile = getProductsFile();
      const products = fs.existsSync(productsFile)
        ? JSON.parse(fs.readFileSync(productsFile, 'utf-8'))
        : [];

      const slug = item.slug || extractSlug(item.url);
      if (!slug) {
        return NextResponse.json({ success: false, error: 'No slug', slug: '' });
      }

      // Skip if already exists
      const existing = products.findIndex((p: { slug: string }) => p.slug === slug);
      if (existing >= 0) {
        return NextResponse.json({ success: true, skipped: true, slug, images: 0 });
      }

      try {
        // Fetch product detail
        const detail = await fetchProductDetail(item.url);

        // Collect image URLs
        const allImageUrls: string[] = [];
        if (detail?.images && detail.images.length > 0) {
          allImageUrls.push(...detail.images);
        } else if (item.image) {
          allImageUrls.push(item.image);
        }

        // Download images
        const localImages = await downloadProductImages(slug, allImageUrls);

        const productName = detail?.name || item.name;
        const productBrand = detail?.brand || item.brand;
        const finalPrice = detail?.salePrice || item.price;
        const finalOriginalPrice = detail?.originalPrice || item.originalPrice || finalPrice;

        const maxId = products.reduce((max: number, p: { id: number }) => Math.max(max, p.id || 0), 0);

        products.push({
          id: maxId + 1,
          name: productName,
          slug,
          price: finalPrice,
          originalPrice: finalOriginalPrice,
          image: localImages[0] || item.image,
          images: localImages.length > 0 ? localImages : [item.image],
          category: item.category || detectCategory(productName, sourcePageUrl),
          brand: productBrand.toLowerCase().replace(/\s+/g, '-'),
          productLineId: '',
          description: detail?.description || `${productName} - ${productBrand}`,
          fullDescription: detail?.fullDescription || '',
          features: detail?.features || [],
          specs: detail?.specs || {},
          params: {
            brand: productBrand,
            code: detail?.itemCode || item.code,
            sku: detail?.sku || '',
            color: detail?.color || '',
            material: detail?.specs?.['Material'] || '',
            sourceUrl: item.url,
            isOnSale: detail?.isOnSale ? 'true' : 'false',
            saveAmount: detail?.saveAmount || '',
            rewardDollars: detail?.rewardDollars || '',
          },
          inStock: detail?.inStock ?? true,
          rating: 4.5,
          reviews: 0,
        });

        // Save immediately after each product
        fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf-8');

        return NextResponse.json({
          success: true,
          slug,
          name: productName,
          images: localImages.length,
          features: detail?.features?.length || 0,
          totalProducts: products.length,
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
      if (!url.includes('wildsecrets.com.au')) {
        return NextResponse.json({ error: 'Chỉ hỗ trợ wildsecrets.com.au' }, { status: 400 });
      }

      const slug = extractSlug(url);
      if (!slug) {
        return NextResponse.json({ error: 'Không thể trích xuất slug từ URL. URL phải có dạng /p/ID/slug' }, { status: 400 });
      }

      const productsFile = getProductsFile();
      const products = fs.existsSync(productsFile)
        ? JSON.parse(fs.readFileSync(productsFile, 'utf-8'))
        : [];

      const existing = products.find((p: { slug: string }) => p.slug === slug);
      if (existing) {
        return NextResponse.json({ success: true, skipped: true, slug, name: existing.name, message: 'Sản phẩm đã tồn tại' });
      }

      try {
        const detail = await fetchProductDetail(url);
        if (!detail || !detail.brand) {
          return NextResponse.json({ error: 'Không thể lấy thông tin sản phẩm. URL có thể không hợp lệ hoặc sản phẩm đã bị gỡ.' }, { status: 400 });
        }

        const allImageUrls = detail.images.length > 0 ? detail.images : [];
        const localImages = await downloadProductImages(slug, allImageUrls);

        const maxId = products.reduce((max: number, p: { id: number }) => Math.max(max, p.id || 0), 0);

        const product = {
          id: maxId + 1,
          name: detail.name,
          slug,
          price: detail.salePrice || detail.price,
          originalPrice: detail.originalPrice || detail.price,
          image: localImages[0] || '',
          images: localImages,
          category: detectCategory(detail.name),
          brand: detail.brand.toLowerCase().replace(/\s+/g, '-'),
          productLineId: '',
          description: detail.description || `${detail.name} - ${detail.brand}`,
          fullDescription: detail.fullDescription || '',
          features: detail.features || [],
          specs: detail.specs || {},
          params: {
            brand: detail.brand,
            code: detail.itemCode || '',
            sku: detail.sku || '',
            color: detail.color || '',
            material: detail.specs?.['Material'] || '',
            sourceUrl: url,
            isOnSale: detail.isOnSale ? 'true' : 'false',
            saveAmount: detail.saveAmount || '',
            rewardDollars: detail.rewardDollars || '',
          },
          inStock: detail.inStock ?? true,
          rating: 4.5,
          reviews: 0,
        };

        products.push(product);
        fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf-8');

        return NextResponse.json({
          success: true,
          slug,
          name: detail.name,
          brand: detail.brand,
          price: product.price,
          images: localImages.length,
          features: detail.features?.length || 0,
          totalProducts: products.length,
        });
      } catch (err) {
        return NextResponse.json({
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        }, { status: 500 });
      }
    }

    // =================== CHECK CATEGORY (info only) ===================
    if (action === 'check-category' && url) {
      if (!url.includes('wildsecrets.com.au')) {
        return NextResponse.json({ error: 'Chỉ hỗ trợ wildsecrets.com.au' }, { status: 400 });
      }

      const html = await fetchHtml(url);
      const isBrandPage = url.includes('/brand/');

      // Category pages use data attributes; brand pages use "X of Y pages" text
      const categoryIdMatch = html.match(/data-category-category-id-value="(\d+)"/);
      const totalPagesMatch = html.match(/data-category-pagination-total-pages-value="(\d+)"/)
        || html.match(/(\d+)\s+of\s+(\d+)\s+pages/);
      const pageSizeMatch = html.match(/data-category-sorting-current-page-size-value="(\d+)"/);
      const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);

      const categoryId = categoryIdMatch ? categoryIdMatch[1] : (isBrandPage ? 'brand' : '');
      const totalPages = totalPagesMatch
        ? parseInt(totalPagesMatch[2] || totalPagesMatch[1], 10)
        : 1;
      const pageSize = pageSizeMatch ? parseInt(pageSizeMatch[1], 10) : 24;
      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

      // Count products on current page for better estimate
      const productCount = (html.match(/class="product product-brief"/g) || []).length;
      const estimatedProducts = productCount > 0 ? (totalPages - 1) * productCount + productCount : totalPages * pageSize;

      if (!categoryId) {
        return NextResponse.json({ error: 'Không tìm thấy category trên trang này' }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        categoryId,
        title,
        totalPages,
        pageSize: productCount || pageSize,
        estimatedProducts,
        isBrandPage,
      });
    }

    // =================== CRAWL ACTION ===================
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!url.includes('wildsecrets.com.au')) {
      return NextResponse.json({ error: 'Chỉ hỗ trợ wildsecrets.com.au' }, { status: 400 });
    }

    // Step 1: Fetch the page to get pagination info
    const html = await fetchHtml(url);
    const isBrandPage = url.includes('/brand/');

    const categoryIdMatch = html.match(/data-category-category-id-value="(\d+)"/);
    const totalPagesMatch = html.match(/data-category-pagination-total-pages-value="(\d+)"/)
      || html.match(/(\d+)\s+of\s+(\d+)\s+pages/);
    const pageSizeMatch = html.match(/data-category-sorting-current-page-size-value="(\d+)"/);

    const categoryId = categoryIdMatch ? categoryIdMatch[1] : (isBrandPage ? 'brand' : '');
    const totalPages = totalPagesMatch
      ? parseInt(totalPagesMatch[2] || totalPagesMatch[1], 10)
      : 1;
    const pageSize = pageSizeMatch ? parseInt(pageSizeMatch[1], 10) : 24;

    if (!categoryId) {
      return NextResponse.json({ error: 'Không tìm thấy category ID trên trang này' }, { status: 400 });
    }

    // crawlAll = true -> all pages, crawlAll = number -> specific page, false -> page 0/1
    let startPage = isBrandPage ? 1 : 0;
    let endPage = isBrandPage ? 2 : 1;
    if (crawlAll === true) {
      startPage = isBrandPage ? 1 : 0;
      endPage = isBrandPage ? totalPages + 1 : totalPages;
    } else if (typeof crawlAll === 'number') {
      // Frontend sends 0-indexed page numbers; brand pages are 1-indexed
      startPage = isBrandPage ? crawlAll + 1 : crawlAll;
      endPage = startPage + 1;
    }

    const allItems: CrawlItem[] = [];

    for (let page = startPage; page < endPage; page++) {
      try {
        let pageHtml: string;

        if (isBrandPage) {
          // Brand pages: fetch HTML directly with ?page=N (1-indexed)
          const sep = url.includes('?') ? '&' : '?';
          const pageUrl = page === 1 ? url : `${url}${sep}page=${page}`;
          pageHtml = await fetchHtml(pageUrl);
        } else {
          // Category pages: use FilterProducts API (0-indexed)
          const apiUrl = `https://www.wildsecrets.com.au/Category/FilterProducts?id=${categoryId}&currentPage=${page}&recordsPerPage=${pageSize}`;
          const raw = await fetchHtml(apiUrl);
          pageHtml = raw;
          try {
            const json = JSON.parse(raw);
            pageHtml = json.productsHtml || '';
          } catch {
            // not JSON, use raw
          }
        }

        const pageItems = parseWildSecretsProducts(pageHtml, allItems.length + 1);
        allItems.push(...pageItems);
      } catch (err) {
        console.error(`Error fetching page ${page}:`, err);
      }
    }

    // Deduplicate by code or slug (code can be empty for brand pages)
    const seen = new Set<string>();
    const unique = allItems.filter(item => {
      const key = item.code || item.slug || item.url || item.name;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    unique.forEach((item, idx) => {
      item.id = idx + 1;
      item.category = detectCategory(item.name, url);
    });

    // Mark items that already exist in products.json
    const productsFile = getProductsFile();
    const existingProducts = fs.existsSync(productsFile)
      ? JSON.parse(fs.readFileSync(productsFile, 'utf-8'))
      : [];
    const existingSlugs = new Set(existingProducts.map((p: { slug: string }) => p.slug));

    const itemsWithStatus = unique.map(item => ({
      ...item,
      alreadyImported: existingSlugs.has(item.slug || ''),
    }));

    const newCount = itemsWithStatus.filter(i => !i.alreadyImported).length;
    const existingCount = itemsWithStatus.filter(i => i.alreadyImported).length;

    return NextResponse.json({
      success: true,
      count: unique.length,
      newCount,
      existingCount,
      pages: endPage - startPage,
      totalPages,
      categoryId,
      pageSize,
      items: itemsWithStatus,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Crawl failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
