'use client';

import { useState } from 'react';
import { Download, Play, PlayCircle, Import, CheckSquare, Square, Loader2 } from 'lucide-react';

type CrawlItem = {
  id: number;
  name: string;
  price: string;
  url: string;
  image: string;
};

const sources = [
  { value: 'pickleball.vn', label: 'pickleball.vn' },
  { value: 'pickzone.vn', label: 'pickzone.vn' },
  { value: 'votpickleballvn.com', label: 'votpickleballvn.com' },
  { value: 'sneakerdaily.vn', label: 'sneakerdaily.vn' },
];

export default function AdminCrawl() {
  const [url, setUrl] = useState('');
  const [sourceType, setSourceType] = useState(sources[0].value);
  const [crawling, setCrawling] = useState(false);
  const [results, setResults] = useState<CrawlItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState('');

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('vi-VN');
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  const simulateCrawl = (all: boolean) => {
    if (!url) {
      addLog('Lỗi: Vui lòng nhập URL nguồn');
      return;
    }

    setCrawling(true);
    setResults([]);
    setSelectedItems(new Set());
    setProgress('Đang crawl...');
    addLog(`Bắt đầu crawl ${all ? 'tất cả' : '1 trang'} từ ${url} (${sourceType})`);

    // Simulate crawl with timeout
    setTimeout(() => {
      const mockResults: CrawlItem[] = [
        { id: 1, name: 'Vợt Pickleball Joola Scorpeus CFS 14mm', price: '4.290.000đ', url: `${url}/product-1`, image: '/images/products/placeholder.jpg' },
        { id: 2, name: 'Vợt Pickleball Selkirk LUXX Control Air S2', price: '4.690.000đ', url: `${url}/product-2`, image: '/images/products/placeholder.jpg' },
        { id: 3, name: 'Vợt Pickleball Head Radical Tour CO', price: '3.990.000đ', url: `${url}/product-3`, image: '/images/products/placeholder.jpg' },
        { id: 4, name: 'Bóng Pickleball Franklin X-40 (hộp 12 quả)', price: '590.000đ', url: `${url}/product-4`, image: '/images/products/placeholder.jpg' },
        { id: 5, name: 'Giày Pickleball Head Motion Pro Padel', price: '2.790.000đ', url: `${url}/product-5`, image: '/images/products/placeholder.jpg' },
      ];

      const count = all ? mockResults.length : 3;
      setResults(mockResults.slice(0, count));
      setProgress(`Hoàn tất: ${count} sản phẩm`);
      addLog(`Crawl hoàn tất. Tìm thấy ${count} sản phẩm.`);
      setCrawling(false);
    }, 2000);
  };

  const toggleItem = (id: number) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedItems.size === results.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(results.map((r) => r.id)));
    }
  };

  const importSelected = () => {
    if (selectedItems.size === 0) return;
    addLog(`Đang import ${selectedItems.size} sản phẩm...`);
    setTimeout(() => {
      addLog(`Import hoàn tất: ${selectedItems.size} sản phẩm đã được thêm vào hệ thống.`);
      setSelectedItems(new Set());
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Crawl dữ liệu</h2>

      {/* Source config */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL nguồn</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://pickleball.vn/collections/vot-pickleball"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Loại nguồn</label>
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {sources.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => simulateCrawl(false)}
            disabled={crawling}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#262260] text-white rounded-lg text-sm font-medium hover:bg-[#1e1b4b] disabled:opacity-50"
          >
            {crawling ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Crawl 1 trang
          </button>
          <button
            onClick={() => simulateCrawl(true)}
            disabled={crawling}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {crawling ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
            Crawl tất cả
          </button>
        </div>
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
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={toggleAll} className="text-gray-500 hover:text-gray-700">
                {selectedItems.size === results.length ? <CheckSquare size={18} /> : <Square size={18} />}
              </button>
              <h3 className="text-sm font-semibold text-gray-700">Kết quả ({results.length} sản phẩm)</h3>
            </div>
            <button
              onClick={importSelected}
              disabled={selectedItems.size === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              <Import size={16} />
              Import đã chọn ({selectedItems.size})
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {results.map((item) => (
              <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                <button onClick={() => toggleItem(item.id)} className="text-gray-500 hover:text-gray-700 shrink-0">
                  {selectedItems.has(item.id) ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} />}
                </button>
                <div className="w-12 h-12 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center">
                  <Download size={16} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 truncate">{item.url}</p>
                </div>
                <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log output */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Log</h3>
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs space-y-1">
          {logs.length === 0 ? (
            <p className="text-gray-500">Chưa có hoạt động nào...</p>
          ) : (
            logs.map((log, i) => <p key={i}>{log}</p>)
          )}
        </div>
      </div>
    </div>
  );
}
