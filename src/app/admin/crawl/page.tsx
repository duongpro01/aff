'use client';

import { useState, useRef } from 'react';
import { Download, Play, PlayCircle, Import, CheckSquare, Square, Loader2, ExternalLink, Info, X } from 'lucide-react';

type CrawlItem = {
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
  alreadyImported?: boolean;
};

type CategoryInfo = {
  categoryId: string;
  title: string;
  totalPages: number;
  pageSize: number;
  estimatedProducts: number;
} | null;

const suggestedUrls = [
  { label: 'Dildos & Strap Ons', url: 'https://www.wildsecrets.com.au/dongs-dildos-strapons' },
  { label: 'Vibrators', url: 'https://www.wildsecrets.com.au/vibrators' },
  { label: 'Anal Toys', url: 'https://www.wildsecrets.com.au/anal-toys' },
  { label: 'Bondage', url: 'https://www.wildsecrets.com.au/bondage' },
  { label: 'Lubes & Essentials', url: 'https://www.wildsecrets.com.au/lubes-essentials' },
  { label: 'Lingerie', url: 'https://www.wildsecrets.com.au/lingerie' },
  { label: 'His Toys', url: 'https://www.wildsecrets.com.au/his-toys' },
  { label: 'Her Toys', url: 'https://www.wildsecrets.com.au/her-toys' },
];

export default function AdminCrawl() {
  const [url, setUrl] = useState('');
  const [crawling, setCrawling] = useState(false);
  const [results, setResults] = useState<CrawlItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // Category info
  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo>(null);
  const [checking, setChecking] = useState(false);

  // Import state
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, success: 0, failed: 0, skipped: 0, images: 0, startTime: 0 });
  const cancelRef = useRef(false);

  // Single product import state
  const [importingProduct, setImportingProduct] = useState(false);

  const isProductUrl = (u: string) => /wildsecrets\.com\.au\/p\/\d+\//.test(u);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('vi-VN');
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  // ===== IMPORT SINGLE PRODUCT URL =====
  const importSingleProduct = async () => {
    if (!url) { addLog('Lỗi: Vui lòng nhập URL'); return; }
    setImportingProduct(true);
    addLog(`Đang import sản phẩm: ${url}`);

    try {
      const res = await fetch('/api/admin/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import-product-url', url: url.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.skipped) {
          addLog(`⏭ Sản phẩm đã tồn tại: ${data.name} (${data.slug})`);
        } else {
          addLog(`✓ Import thành công: ${data.name} — ${data.brand} — $${data.price} — ${data.images} ảnh, ${data.features} features`);
        }
      } else {
        addLog(`✗ Lỗi: ${data.error || 'Import thất bại'}`);
      }
    } catch (err) {
      addLog(`✗ Lỗi: ${err instanceof Error ? err.message : 'Lỗi kết nối'}`);
    } finally {
      setImportingProduct(false);
    }
  };

  // ===== CHECK CATEGORY =====
  const checkCategory = async () => {
    if (!url) { addLog('Lỗi: Vui lòng nhập URL'); return; }
    setChecking(true);
    setCategoryInfo(null);
    addLog(`Đang kiểm tra danh mục: ${url}`);

    try {
      const res = await fetch('/api/admin/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check-category', url: url.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCategoryInfo(data);
        addLog(`Danh mục: "${data.title}" — ${data.totalPages} trang, ~${data.estimatedProducts} SP, ${data.pageSize} SP/trang`);
      } else {
        addLog(`Lỗi: ${data.error}`);
      }
    } catch (err) {
      addLog(`Lỗi: ${err instanceof Error ? err.message : 'Lỗi kết nối'}`);
    } finally {
      setChecking(false);
    }
  };

  // ===== CRAWL =====
  const handleCrawl = async (mode: 'one' | 'all' | number) => {
    if (!url) { addLog('Lỗi: Vui lòng nhập URL'); return; }

    setCrawling(true);
    setResults([]);
    setSelectedItems(new Set());
    const label = mode === 'all' ? 'tất cả trang' : mode === 'one' ? 'trang 1' : `trang ${(mode as number) + 1}`;
    setProgress(`Đang crawl ${label}...`);
    addLog(`Bắt đầu crawl ${label} từ ${url}`);

    try {
      const crawlAll = mode === 'all' ? true : mode === 'one' ? false : mode;
      const res = await fetch('/api/admin/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), crawlAll }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        addLog(`Lỗi: ${data.error || 'Crawl thất bại'}`);
        setProgress('');
        setCrawling(false);
        return;
      }

      const items: CrawlItem[] = data.items || [];
      setResults(items);

      // Auto-select only NEW items (not already imported)
      const newItems = items.filter(i => !i.alreadyImported);
      setSelectedItems(new Set(newItems.map(i => i.id)));

      setProgress(`Hoàn tất: ${items.length} SP (${data.newCount || 0} mới, ${data.existingCount || 0} đã có)`);
      addLog(`Crawl xong: ${items.length} SP từ ${data.pages}/${data.totalPages} trang — ${data.newCount || 0} mới, ${data.existingCount || 0} đã import`);
    } catch (err) {
      addLog(`Lỗi: ${err instanceof Error ? err.message : 'Lỗi kết nối'}`);
      setProgress('');
    } finally {
      setCrawling(false);
    }
  };

  // ===== IMPORT =====
  const importSelected = async () => {
    // Filter: only items that are selected AND not already imported
    const toImport = results.filter(r => selectedItems.has(r.id) && !r.alreadyImported);
    if (toImport.length === 0) {
      addLog('Không có SP mới nào để import (tất cả đã tồn tại).');
      return;
    }

    setImporting(true);
    cancelRef.current = false;
    setImportProgress({ current: 0, total: toImport.length, success: 0, failed: 0, skipped: 0, images: 0, startTime: Date.now() });
    addLog(`--- Bắt đầu import ${toImport.length} SP mới ---`);

    let success = 0, failed = 0, skipped = 0, totalImages = 0;

    for (let i = 0; i < toImport.length; i++) {
      if (cancelRef.current) {
        addLog(`Đã dừng import tại ${i}/${toImport.length}`);
        break;
      }

      const item = toImport[i];
      const shortName = item.name.length > 50 ? item.name.substring(0, 50) + '...' : item.name;

      try {
        const res = await fetch('/api/admin/crawl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'import-one', items: [item], sourcePageUrl: url }),
        });
        const data = await res.json();

        if (data.success) {
          if (data.skipped) {
            skipped++;
            addLog(`[${i + 1}/${toImport.length}] ⏭ Đã tồn tại: ${shortName}`);
          } else {
            success++;
            totalImages += data.images || 0;
            addLog(`[${i + 1}/${toImport.length}] ✓ ${shortName} (${data.images} ảnh, ${data.features} features)`);
          }
          // Mark as imported in results
          setResults(prev => prev.map(r => r.id === item.id ? { ...r, alreadyImported: true } : r));
        } else {
          failed++;
          addLog(`[${i + 1}/${toImport.length}] ✗ ${shortName}: ${data.error || 'Lỗi'}`);
        }
      } catch (err) {
        failed++;
        addLog(`[${i + 1}/${toImport.length}] ✗ ${shortName}: ${err instanceof Error ? err.message : 'Lỗi'}`);
      }

      setImportProgress(prev => ({ ...prev, current: i + 1, success, failed, skipped, images: totalImages }));
    }

    addLog(`--- Hoàn tất: ${success} mới, ${skipped} bỏ qua, ${failed} lỗi, ${totalImages} ảnh ---`);
    setImporting(false);
  };

  // ===== HELPERS =====
  const toggleItem = (id: number) => {
    setSelectedItems(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const toggleAll = () => {
    const selectable = filteredResults.filter(r => !r.alreadyImported);
    if (selectable.every(r => selectedItems.has(r.id))) {
      setSelectedItems(prev => { const next = new Set(prev); selectable.forEach(r => next.delete(r.id)); return next; });
    } else {
      setSelectedItems(prev => { const next = new Set(prev); selectable.forEach(r => next.add(r.id)); return next; });
    }
  };

  const filteredResults = results
    .filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name);
        case 'brand': return a.brand.localeCompare(b.brand);
        case 'new-first': return (a.alreadyImported ? 1 : 0) - (b.alreadyImported ? 1 : 0);
        default: return 0;
      }
    });

  const newCount = results.filter(r => !r.alreadyImported).length;
  const existingCount = results.filter(r => r.alreadyImported).length;
  const selectedNewCount = results.filter(r => selectedItems.has(r.id) && !r.alreadyImported).length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Crawl dữ liệu</h2>

      {/* Source config */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL nguồn (wildsecrets.com.au)</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setCategoryInfo(null); }}
              placeholder="URL danh mục hoặc sản phẩm — vd: /vibrators hoặc /p/236593/..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={isProductUrl(url) ? importSingleProduct : checkCategory}
              disabled={(isProductUrl(url) ? importingProduct : checking) || !url}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap disabled:opacity-50 ${isProductUrl(url) ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {(isProductUrl(url) ? importingProduct : checking) ? <Loader2 size={14} className="animate-spin" /> : isProductUrl(url) ? <Import size={14} /> : <Info size={14} />}
              {isProductUrl(url) ? 'Import' : 'Check'}
            </button>
          </div>
          {isProductUrl(url) && (
            <p className="text-xs text-green-600 font-medium">Link sản phẩm — nhấn &quot;Import sản phẩm này&quot; để nhập trực tiếp</p>
          )}
        </div>

        {/* Quick URLs */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-400 leading-7">Gợi ý:</span>
          {suggestedUrls.map(s => (
            <button
              key={s.url}
              onClick={() => { setUrl(s.url); setCategoryInfo(null); }}
              className={`text-xs px-3 py-1.5 rounded-full transition ${url === s.url ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Category Info Panel */}
        {categoryInfo && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-indigo-800">{categoryInfo.title}</h4>
              <button onClick={() => setCategoryInfo(null)} className="text-indigo-400 hover:text-indigo-600"><X size={14} /></button>
            </div>
            <div className="text-xs text-indigo-600 mb-3">
              Category ID: {categoryInfo.categoryId} · {categoryInfo.totalPages} trang · {categoryInfo.pageSize} SP/trang · ~{categoryInfo.estimatedProducts} SP
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCrawl('all')}
                disabled={crawling}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                <PlayCircle size={14} /> Crawl tất cả ({categoryInfo.totalPages} trang)
              </button>
              {Array.from({ length: categoryInfo.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleCrawl(i)}
                  disabled={crawling}
                  className="px-3 py-1.5 bg-white text-indigo-700 border border-indigo-300 rounded-lg text-xs font-medium hover:bg-indigo-100 disabled:opacity-50"
                >
                  Trang {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Crawl buttons (when no category info) */}
        {!categoryInfo && (
          <div className="flex gap-3">
            {isProductUrl(url) ? (
              <button onClick={importSingleProduct} disabled={importingProduct || !url}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                {importingProduct ? <Loader2 size={16} className="animate-spin" /> : <Import size={16} />}
                Import sản phẩm này
              </button>
            ) : (
              <>
                <button onClick={() => handleCrawl('one')} disabled={crawling || !url}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#262260] text-white rounded-lg text-sm font-medium hover:bg-[#1e1b4b] disabled:opacity-50">
                  {crawling ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                  Crawl 1 trang
                </button>
                <button onClick={() => handleCrawl('all')} disabled={crawling || !url}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                  {crawling ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                  Crawl tất cả
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

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={toggleAll} className="text-gray-500 hover:text-gray-700">
                  {filteredResults.filter(r => !r.alreadyImported).every(r => selectedItems.has(r.id)) && newCount > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                </button>
                <h3 className="text-sm font-semibold text-gray-700">
                  {filteredResults.length} SP
                  {existingCount > 0 && <span className="text-gray-400 font-normal"> ({newCount} mới, {existingCount} đã có)</span>}
                </h3>
              </div>
              <div className="flex gap-2">
                {importing && (
                  <button onClick={() => { cancelRef.current = true; }} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">
                    Dừng
                  </button>
                )}
                <button
                  onClick={importSelected}
                  disabled={selectedNewCount === 0 || importing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {importing ? (
                    <><Loader2 size={16} className="animate-spin" /> Importing {importProgress.current}/{importProgress.total}...</>
                  ) : (
                    <><Import size={16} /> Import {selectedNewCount} SP mới</>
                  )}
                </button>
              </div>
            </div>
            {/* Search & Sort */}
            <div className="flex gap-3">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm..." className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                <option value="default">Mặc định</option>
                <option value="new-first">Mới trước</option>
                <option value="price-asc">Giá tăng</option>
                <option value="price-desc">Giá giảm</option>
                <option value="name">Tên A-Z</option>
                <option value="brand">Brand</option>
              </select>
            </div>
          </div>

          {/* Import Progress Bar */}
          {importing && (() => {
            const pct = importProgress.total > 0 ? Math.round((importProgress.current / importProgress.total) * 100) : 0;
            const elapsed = importProgress.startTime > 0 ? (Date.now() - importProgress.startTime) / 1000 : 0;
            const avg = importProgress.current > 0 ? elapsed / importProgress.current : 3;
            const rem = Math.round((importProgress.total - importProgress.current) * avg);
            const remStr = rem > 60 ? `${Math.floor(rem / 60)}m ${rem % 60}s` : `${rem}s`;
            return (
              <div className="px-4 py-3 border-b border-gray-200 bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">{importProgress.current}/{importProgress.total}</span>
                  <span className="text-xs text-blue-600">{importProgress.success} OK · {importProgress.skipped} skip · {importProgress.failed} fail · {importProgress.images} ảnh</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-xs text-blue-500 mt-1">{pct}% — ~{remStr} ({avg.toFixed(1)}s/SP)</div>
              </div>
            );
          })()}

          {/* Product list */}
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {filteredResults.map((item) => (
              <div key={item.id} className={`p-3 flex items-center gap-3 hover:bg-gray-50 ${item.alreadyImported ? 'opacity-50 bg-gray-50' : ''}`}>
                <button
                  onClick={() => !item.alreadyImported && toggleItem(item.id)}
                  className={`shrink-0 ${item.alreadyImported ? 'cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}`}
                  disabled={item.alreadyImported}
                >
                  {item.alreadyImported ? (
                    <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">Đã có</span>
                  ) : selectedItems.has(item.id) ? (
                    <CheckSquare size={18} className="text-blue-600" />
                  ) : (
                    <Square size={18} />
                  )}
                </button>

                <div className="w-14 h-14 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Download size={16} className="text-gray-400" /></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${item.alreadyImported ? 'text-gray-500' : 'text-gray-800'}`}>{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-indigo-600 font-medium">{item.brand}</span>
                    <span className="text-xs text-gray-400">SKU: {item.code}</span>
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-0.5">
                        <ExternalLink size={10} /> Link
                      </a>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-red-600">${item.price.toFixed(2)}</p>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <>
                      <p className="text-xs text-gray-400 line-through">${item.originalPrice.toFixed(2)}</p>
                      <p className="text-xs text-green-600 font-medium">-{Math.round((item.originalPrice - item.price) / item.originalPrice * 100)}%</p>
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
          {logs.length > 0 && <button onClick={() => setLogs([])} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>}
        </div>
        <div
          className="bg-gray-900 text-green-400 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs space-y-0.5"
          ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}
        >
          {logs.length === 0 ? (
            <p className="text-gray-500">Chưa có hoạt động nào...</p>
          ) : (
            logs.map((log, i) => (
              <p key={i} className={log.includes('✗') ? 'text-red-400' : log.includes('✓') ? 'text-green-400' : log.includes('⏭') ? 'text-yellow-400' : log.includes('---') ? 'text-cyan-400 font-bold' : 'text-gray-400'}>
                {log}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
