'use client';

import { useState, useRef } from 'react';
import {
  Download,
  Play,
  PlayCircle,
  Import,
  CheckSquare,
  Square,
  Loader2,
  ExternalLink,
  Info,
  X,
} from 'lucide-react';
import { CrawlSource, sourceColors } from '@/lib/crawl-sources';

type CrawlItem = {
  id: number;
  name: string;
  slug?: string;
  code?: string;
  brand: string;
  price: number;
  originalPrice?: number;
  url: string;
  image: string;
  category?: string;
  alreadyImported?: boolean;
};

type CollectionInfo = {
  title: string;
  totalProducts?: number;
  estimatedProducts?: number;
  totalPages: number;
  productsPerPage?: number;
  pageSize?: number;
  categoryId?: string;
} | null;

interface CrawlPanelProps {
  source: CrawlSource;
}

export default function CrawlPanel({ source }: CrawlPanelProps) {
  const colors = sourceColors[source.color] || sourceColors.indigo;

  const [url, setUrl] = useState(source.suggestedCollections[0]?.url || '');
  const [crawling, setCrawling] = useState(false);
  const [results, setResults] = useState<CrawlItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // Collection info
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo>(null);
  const [checking, setChecking] = useState(false);

  // Import state
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({
    current: 0,
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    images: 0,
    startTime: 0,
  });
  const cancelRef = useRef(false);

  // Single product import state (Wild Secrets)
  const [importingProduct, setImportingProduct] = useState(false);

  // Brand crawl state (Wild Secrets)
  const [brandUrl, setBrandUrl] = useState('');
  const [crawlingBrand, setCrawlingBrand] = useState(false);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('vi-VN');
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  const isProductUrl = source.isProductUrl(url);
  const hasBrandCrawl = !!source.isBrandUrl;

  // ===== CRAWL BRAND CONTENT (Wild Secrets) =====
  const crawlBrandContent = async (urlToUse?: string) => {
    const targetUrl = urlToUse || brandUrl;
    if (!targetUrl) {
      addLog('Loi: Vui long nhap URL brand');
      return;
    }
    if (source.isBrandUrl && !source.isBrandUrl(targetUrl)) {
      addLog('Loi: URL phai la trang brand');
      return;
    }

    setCrawlingBrand(true);
    addLog(`Dang crawl brand content: ${targetUrl}`);

    try {
      const res = await fetch(source.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'crawl-brand-content', url: targetUrl.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        const status = data.isNew ? '+ Them moi' : '~ Cap nhat';
        addLog(
          `${status} brand: ${data.brand.name} (${data.brand.slug}) — ${data.brand.contentLength} ky tu content`
        );
        addLog(`  └ Description: ${data.brand.description.substring(0, 100)}...`);
      } else {
        addLog(`X Loi: ${data.error || 'Crawl brand that bai'}`);
      }
    } catch (err) {
      addLog(`X Loi: ${err instanceof Error ? err.message : 'Loi ket noi'}`);
    } finally {
      setCrawlingBrand(false);
    }
  };

  // ===== IMPORT SINGLE PRODUCT URL (Wild Secrets) =====
  const importSingleProduct = async () => {
    if (!url) {
      addLog('Loi: Vui long nhap URL');
      return;
    }
    setImportingProduct(true);
    addLog(`Dang import san pham: ${url}`);

    try {
      const res = await fetch(source.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import-product-url', url: url.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.skipped) {
          addLog(`>> San pham da ton tai: ${data.name} (${data.slug})`);
        } else {
          addLog(
            `OK Import thanh cong: ${data.name} — ${data.brand} — $${data.price} — ${data.images} anh, ${data.features} features`
          );
        }
      } else {
        addLog(`X Loi: ${data.error || 'Import that bai'}`);
      }
    } catch (err) {
      addLog(`X Loi: ${err instanceof Error ? err.message : 'Loi ket noi'}`);
    } finally {
      setImportingProduct(false);
    }
  };

  // ===== CHECK COLLECTION =====
  const checkCollection = async () => {
    if (!url) {
      addLog('Loi: Vui long nhap URL');
      return;
    }
    setChecking(true);
    setCollectionInfo(null);
    addLog(`Dang kiem tra: ${url}`);

    try {
      const action = source.dataType === 'dolls' ? 'check-collection' : 'check-category';
      const res = await fetch(source.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, url: url.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCollectionInfo(data);
        const productCount = data.totalProducts || data.estimatedProducts || 0;
        const perPage = data.productsPerPage || data.pageSize || 0;
        addLog(
          `Collection: "${data.title}" — ${data.totalPages} trang, ${productCount} SP, ${perPage} SP/trang`
        );
      } else {
        addLog(`Loi: ${data.error}`);
      }
    } catch (err) {
      addLog(`Loi: ${err instanceof Error ? err.message : 'Loi ket noi'}`);
    } finally {
      setChecking(false);
    }
  };

  // ===== CRAWL =====
  const handleCrawl = async (mode: 'one' | 'all' | number) => {
    if (!url) {
      addLog('Loi: Vui long nhap URL');
      return;
    }

    setCrawling(true);
    setResults([]);
    setSelectedItems(new Set());
    const label =
      mode === 'all'
        ? 'tat ca trang'
        : mode === 'one'
          ? 'trang 1'
          : `trang ${typeof mode === 'number' ? mode + 1 : mode}`;
    setProgress(`Dang crawl ${label}...`);
    addLog(`Bat dau crawl ${label} tu ${url}`);

    try {
      let crawlAll: boolean | number;
      if (source.dataType === 'dolls') {
        crawlAll = mode === 'all' ? true : mode === 'one' ? 0 : (mode as number) - 1;
      } else {
        crawlAll = mode === 'all' ? true : mode === 'one' ? false : mode;
      }

      const res = await fetch(source.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), crawlAll }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        addLog(`Loi: ${data.error || 'Crawl that bai'}`);
        setProgress('');
        setCrawling(false);
        return;
      }

      const items: CrawlItem[] = data.items || [];
      setResults(items);

      // Auto-select only NEW items (not already imported)
      const newItems = items.filter((i) => !i.alreadyImported);
      setSelectedItems(new Set(newItems.map((i) => i.id)));

      const pagesInfo = data.pages || data.currentPage || 1;
      setProgress(
        `Hoan tat: ${items.length} SP (${data.newCount || 0} moi, ${data.existingCount || 0} da co)`
      );
      addLog(
        `Crawl xong: ${items.length} SP tu trang ${pagesInfo}/${data.totalPages} — ${data.newCount || 0} moi, ${data.existingCount || 0} da import`
      );
    } catch (err) {
      addLog(`Loi: ${err instanceof Error ? err.message : 'Loi ket noi'}`);
      setProgress('');
    } finally {
      setCrawling(false);
    }
  };

  // ===== IMPORT =====
  const importSelected = async () => {
    const toImport = results.filter((r) => selectedItems.has(r.id) && !r.alreadyImported);
    if (toImport.length === 0) {
      addLog('Khong co SP moi nao de import.');
      return;
    }

    setImporting(true);
    cancelRef.current = false;
    setImportProgress({
      current: 0,
      total: toImport.length,
      success: 0,
      failed: 0,
      skipped: 0,
      images: 0,
      startTime: Date.now(),
    });
    addLog(`--- Bat dau import ${toImport.length} SP moi ---`);

    let success = 0,
      failed = 0,
      skipped = 0,
      totalImages = 0;

    for (let i = 0; i < toImport.length; i++) {
      if (cancelRef.current) {
        addLog(`Da dung import tai ${i}/${toImport.length}`);
        break;
      }

      const item = toImport[i];
      const shortName = item.name.length > 50 ? item.name.substring(0, 50) + '...' : item.name;

      try {
        const res = await fetch(source.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'import-one', items: [item], sourcePageUrl: url }),
        });
        const data = await res.json();

        if (data.success) {
          if (data.skipped) {
            skipped++;
            addLog(`[${i + 1}/${toImport.length}] >> Da ton tai: ${shortName}`);
          } else {
            success++;
            totalImages += data.images || 0;
            addLog(
              `[${i + 1}/${toImport.length}] OK ${shortName} (${data.images} anh, ${data.features} features)`
            );
          }
          setResults((prev) =>
            prev.map((r) => (r.id === item.id ? { ...r, alreadyImported: true } : r))
          );
        } else {
          failed++;
          addLog(`[${i + 1}/${toImport.length}] X ${shortName}: ${data.error || 'Loi'}`);
        }
      } catch (err) {
        failed++;
        addLog(
          `[${i + 1}/${toImport.length}] X ${shortName}: ${err instanceof Error ? err.message : 'Loi'}`
        );
      }

      setImportProgress((prev) => ({
        ...prev,
        current: i + 1,
        success,
        failed,
        skipped,
        images: totalImages,
      }));
    }

    addLog(`--- Hoan tat: ${success} moi, ${skipped} bo qua, ${failed} loi, ${totalImages} anh ---`);
    setImporting(false);
  };

  // ===== HELPERS =====
  const toggleItem = (id: number) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const selectable = filteredResults.filter((r) => !r.alreadyImported);
    if (selectable.every((r) => selectedItems.has(r.id))) {
      setSelectedItems((prev) => {
        const next = new Set(prev);
        selectable.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelectedItems((prev) => {
        const next = new Set(prev);
        selectable.forEach((r) => next.add(r.id));
        return next;
      });
    }
  };

  const filteredResults = results
    .filter((item) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        (item.code && item.code.toLowerCase().includes(q)) ||
        (item.slug && item.slug.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'brand':
          return a.brand.localeCompare(b.brand);
        case 'new-first':
          return (a.alreadyImported ? 1 : 0) - (b.alreadyImported ? 1 : 0);
        default:
          return 0;
      }
    });

  const newCount = results.filter((r) => !r.alreadyImported).length;
  const existingCount = results.filter((r) => r.alreadyImported).length;
  const selectedNewCount = results.filter((r) => selectedItems.has(r.id) && !r.alreadyImported).length;

  // Generate page buttons
  const renderPageButtons = () => {
    if (!collectionInfo) return null;
    const total = collectionInfo.totalPages;
    const pages: number[] = [];

    for (let i = 0; i < Math.min(10, total); i++) pages.push(i);
    if (total > 15) {
      for (let i = total - 5; i < total; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
    } else {
      for (let i = 10; i < total; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
    }

    return pages.sort((a, b) => a - b).map((p, idx) => {
      const prevPage = idx > 0 ? pages[idx - 1] : -1;
      const showEllipsis = p - prevPage > 1;

      return (
        <span key={p}>
          {showEllipsis && <span className="px-2 text-gray-400">...</span>}
          <button
            onClick={() => handleCrawl(p)}
            disabled={crawling}
            className={`px-3 py-1.5 bg-white border rounded-lg text-xs font-medium disabled:opacity-50 ${colors.text} ${colors.border} hover:bg-gray-50`}
          >
            Trang {p + 1}
          </button>
        </span>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Source config */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL nguon ({source.domain})
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setCollectionInfo(null);
              }}
              placeholder={`URL collection hoac san pham — vd: ${source.suggestedCollections[0]?.url}`}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={isProductUrl ? importSingleProduct : checkCollection}
              disabled={(isProductUrl ? importingProduct : checking) || !url}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap disabled:opacity-50 ${
                isProductUrl
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {(isProductUrl ? importingProduct : checking) ? (
                <Loader2 size={14} className="animate-spin" />
              ) : isProductUrl ? (
                <Import size={14} />
              ) : (
                <Info size={14} />
              )}
              {isProductUrl ? 'Import' : 'Check'}
            </button>
          </div>
          {isProductUrl && (
            <p className="text-xs text-green-600 font-medium mt-1">
              Link san pham — nhan &quot;Import&quot; de nhap truc tiep
            </p>
          )}
        </div>

        {/* Quick URLs - Collections */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-400 leading-7">Collections:</span>
          {source.suggestedCollections.map((s) => (
            <button
              key={s.url}
              onClick={() => {
                setUrl(s.url);
                setCollectionInfo(null);
              }}
              className={`text-xs px-3 py-1.5 rounded-full transition ${
                url === s.url ? `${colors.bg} text-white` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Quick URLs - Brands (if available) */}
        {source.suggestedBrands && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-400 leading-7">Brands:</span>
            {source.suggestedBrands.map((s) => (
              <button
                key={s.url}
                onClick={() => {
                  setUrl(s.url);
                  setCollectionInfo(null);
                }}
                className={`text-xs px-3 py-1.5 rounded-full transition ${
                  url === s.url
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Collection Info Panel */}
        {collectionInfo && (
          <div className={`${colors.bgLight} ${colors.border} border rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className={`text-sm font-bold ${colors.text}`}>{collectionInfo.title}</h4>
              <button
                onClick={() => setCollectionInfo(null)}
                className={`${colors.text} opacity-60 hover:opacity-100`}
              >
                <X size={14} />
              </button>
            </div>
            <div className={`text-xs ${colors.text} opacity-80 mb-3`}>
              {collectionInfo.categoryId && `ID: ${collectionInfo.categoryId} · `}
              {collectionInfo.totalPages} trang ·{' '}
              {collectionInfo.productsPerPage || collectionInfo.pageSize} SP/trang ·{' '}
              {collectionInfo.totalProducts || collectionInfo.estimatedProducts} SP
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => handleCrawl('all')}
                disabled={crawling}
                className={`flex items-center gap-1 px-3 py-1.5 ${colors.bg} text-white rounded-lg text-xs font-medium ${colors.hover} disabled:opacity-50`}
              >
                <PlayCircle size={14} /> Crawl tat ca ({collectionInfo.totalPages} trang)
              </button>
              {renderPageButtons()}
            </div>
          </div>
        )}

        {/* Crawl buttons (when no collection info) */}
        {!collectionInfo && (
          <div className="flex gap-3">
            {isProductUrl ? (
              <button
                onClick={importSingleProduct}
                disabled={importingProduct || !url}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {importingProduct ? <Loader2 size={16} className="animate-spin" /> : <Import size={16} />}
                Import san pham nay
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleCrawl('one')}
                  disabled={crawling || !url}
                  className={`flex items-center gap-1.5 px-4 py-2 ${colors.bg} text-white rounded-lg text-sm font-medium ${colors.hover} disabled:opacity-50`}
                >
                  {crawling ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                  Crawl 1 trang
                </button>
                <button
                  onClick={() => handleCrawl('all')}
                  disabled={crawling || !url}
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                >
                  {crawling ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                  Crawl tat ca
                </button>
              </>
            )}
          </div>
        )}

        {progress && (
          <div className={`text-sm font-medium ${crawling ? 'text-yellow-600' : 'text-green-600'}`}>
            {crawling && <Loader2 size={14} className="inline animate-spin mr-1" />}
            {progress}
          </div>
        )}
      </div>

      {/* Brand Content Crawl (Wild Secrets only) */}
      {hasBrandCrawl && source.suggestedBrands && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Crawl Brand Content</h3>
          <p className="text-sm text-gray-500">
            Lay thong tin mo ta brand de hien thi trang brand.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL trang brand</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={brandUrl}
                onChange={(e) => setBrandUrl(e.target.value)}
                placeholder={source.suggestedBrands[0]?.url}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={() => crawlBrandContent()}
                disabled={crawlingBrand || !brandUrl}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {crawlingBrand ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                Crawl Brand
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-400 leading-7">Quick:</span>
            {source.suggestedBrands.map((b) => (
              <button
                key={b.url}
                onClick={() => {
                  setBrandUrl(b.url);
                  crawlBrandContent(b.url);
                }}
                disabled={crawlingBrand}
                className={`text-xs px-3 py-1.5 rounded-full transition disabled:opacity-50 ${
                  brandUrl === b.url
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={toggleAll} className="text-gray-500 hover:text-gray-700">
                  {filteredResults.filter((r) => !r.alreadyImported).every((r) => selectedItems.has(r.id)) &&
                  newCount > 0 ? (
                    <CheckSquare size={18} />
                  ) : (
                    <Square size={18} />
                  )}
                </button>
                <h3 className="text-sm font-semibold text-gray-700">
                  {filteredResults.length} SP
                  {existingCount > 0 && (
                    <span className="text-gray-400 font-normal">
                      {' '}
                      ({newCount} moi, {existingCount} da co)
                    </span>
                  )}
                </h3>
              </div>
              <div className="flex gap-2">
                {importing && (
                  <button
                    onClick={() => {
                      cancelRef.current = true;
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                  >
                    Dung
                  </button>
                )}
                <button
                  onClick={importSelected}
                  disabled={selectedNewCount === 0 || importing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Importing{' '}
                      {importProgress.current}/{importProgress.total}...
                    </>
                  ) : (
                    <>
                      <Import size={16} /> Import {selectedNewCount} SP moi
                    </>
                  )}
                </button>
              </div>
            </div>
            {/* Search & Sort */}
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tim kiem..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="default">Mac dinh</option>
                <option value="new-first">Moi truoc</option>
                <option value="price-asc">Gia tang</option>
                <option value="price-desc">Gia giam</option>
                <option value="name">Ten A-Z</option>
                <option value="brand">Brand</option>
              </select>
            </div>
          </div>

          {/* Import Progress Bar */}
          {importing && (() => {
            const pct =
              importProgress.total > 0
                ? Math.round((importProgress.current / importProgress.total) * 100)
                : 0;
            const elapsed =
              importProgress.startTime > 0 ? (Date.now() - importProgress.startTime) / 1000 : 0;
            const avg = importProgress.current > 0 ? elapsed / importProgress.current : 3;
            const rem = Math.round((importProgress.total - importProgress.current) * avg);
            const remStr = rem > 60 ? `${Math.floor(rem / 60)}m ${rem % 60}s` : `${rem}s`;
            return (
              <div className={`px-4 py-3 border-b border-gray-200 ${colors.bgLight}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${colors.text}`}>
                    {importProgress.current}/{importProgress.total}
                  </span>
                  <span className={`text-xs ${colors.text} opacity-80`}>
                    {importProgress.success} OK · {importProgress.skipped} skip ·{' '}
                    {importProgress.failed} fail · {importProgress.images} anh
                  </span>
                </div>
                <div className={`w-full ${colors.bgLight} rounded-full h-3 overflow-hidden`}>
                  <div
                    className={`${colors.bg} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className={`text-xs ${colors.text} opacity-70 mt-1`}>
                  {pct}% — ~{remStr} ({avg.toFixed(1)}s/SP)
                </div>
              </div>
            );
          })()}

          {/* Product list */}
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {filteredResults.map((item) => (
              <div
                key={item.id}
                className={`p-3 flex items-center gap-3 hover:bg-gray-50 ${
                  item.alreadyImported ? 'opacity-50 bg-gray-50' : ''
                }`}
              >
                <button
                  onClick={() => !item.alreadyImported && toggleItem(item.id)}
                  className={`shrink-0 ${
                    item.alreadyImported ? 'cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  disabled={item.alreadyImported}
                >
                  {item.alreadyImported ? (
                    <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                      Da co
                    </span>
                  ) : selectedItems.has(item.id) ? (
                    <CheckSquare size={18} className={colors.text} />
                  ) : (
                    <Square size={18} />
                  )}
                </button>

                <div className="w-14 h-14 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Download size={16} className="text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      item.alreadyImported ? 'text-gray-500' : 'text-gray-800'
                    }`}
                  >
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs font-medium ${colors.text}`}>
                      {item.brand || 'Unknown'}
                    </span>
                    {source.itemFields.hasCode && item.code && (
                      <span className="text-xs text-gray-400">SKU: {item.code}</span>
                    )}
                    {!source.itemFields.hasCode && item.slug && (
                      <span className="text-xs text-gray-400">{item.slug}</span>
                    )}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center gap-0.5"
                      >
                        <ExternalLink size={10} /> Link
                      </a>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${colors.text}`}>
                    ${source.dataType === 'dolls' ? item.price.toLocaleString() : item.price.toFixed(2)}
                  </p>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <>
                      <p className="text-xs text-gray-400 line-through">
                        $
                        {source.dataType === 'dolls'
                          ? item.originalPrice.toLocaleString()
                          : item.originalPrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log output */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Log ({logs.length})</h3>
          {logs.length > 0 && (
            <button onClick={() => setLogs([])} className="text-xs text-gray-400 hover:text-gray-600">
              Clear
            </button>
          )}
        </div>
        <div
          className="bg-gray-900 text-green-400 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs space-y-0.5"
          ref={(el) => {
            if (el) el.scrollTop = el.scrollHeight;
          }}
        >
          {logs.length === 0 ? (
            <p className="text-gray-500">Chua co hoat dong nao...</p>
          ) : (
            logs.map((log, i) => (
              <p
                key={i}
                className={
                  log.includes('X ')
                    ? 'text-red-400'
                    : log.includes('OK')
                      ? 'text-green-400'
                      : log.includes('>>')
                        ? 'text-yellow-400'
                        : log.includes('---')
                          ? 'text-cyan-400 font-bold'
                          : 'text-gray-400'
                }
              >
                {log}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
