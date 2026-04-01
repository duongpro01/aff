'use client';

import { useState } from 'react';
import { Save, Plus, Pencil, Trash2, Code, X } from 'lucide-react';
import seoSettingsData from '@/data/seo-settings.json';
import redirectsData from '@/data/redirects.json';

type Redirect = {
  id: number;
  from: string;
  to: string;
  statusCode: number;
};

export default function AdminSEO() {
  const [activeTab, setActiveTab] = useState<'general' | 'redirects'>('general');

  // General SEO
  const [ga4Id, setGa4Id] = useState(seoSettingsData.ga4Id || '');
  const [searchConsole, setSearchConsole] = useState(seoSettingsData.searchConsole || '');
  const [noindex, setNoindex] = useState(seoSettingsData.noindex || false);
  const [customHead, setCustomHead] = useState(seoSettingsData.customHeadCode || '');
  const [saved, setSaved] = useState(false);

  // Redirects
  const [redirects, setRedirects] = useState<Redirect[]>(
    (redirectsData as Redirect[]).length > 0
      ? (redirectsData as Redirect[])
      : []
  );
  const [newFrom, setNewFrom] = useState('');
  const [newTo, setNewTo] = useState('');
  const [newStatus, setNewStatus] = useState(301);
  const [editRedirect, setEditRedirect] = useState<Redirect | null>(null);
  const [showNginx, setShowNginx] = useState(false);

  const saveGeneral = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addRedirect = () => {
    if (!newFrom || !newTo) return;
    const id = redirects.length > 0 ? Math.max(...redirects.map((r) => r.id)) + 1 : 1;
    setRedirects((prev) => [...prev, { id, from: newFrom, to: newTo, statusCode: newStatus }]);
    setNewFrom('');
    setNewTo('');
    setNewStatus(301);
  };

  const updateRedirect = () => {
    if (!editRedirect) return;
    setRedirects((prev) => prev.map((r) => (r.id === editRedirect.id ? editRedirect : r)));
    setEditRedirect(null);
  };

  const deleteRedirect = (id: number) => {
    if (!confirm('Xóa redirect này?')) return;
    setRedirects((prev) => prev.filter((r) => r.id !== id));
  };

  const nginxConfig = redirects
    .map((r) => {
      const code = r.statusCode === 302 ? 'redirect' : 'permanent';
      return `rewrite ^${r.from}$ ${r.to} ${code};`;
    })
    .join('\n');

  const tabs = [
    { key: 'general' as const, label: 'Cài đặt chung' },
    { key: 'redirects' as const, label: 'Redirects' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Cài đặt SEO</h2>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GA4 Measurement ID</label>
            <input
              type="text"
              value={ga4Id}
              onChange={(e) => setGa4Id(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Search Console Verification Code</label>
            <input
              type="text"
              value={searchConsole}
              onChange={(e) => setSearchConsole(e.target.value)}
              placeholder="google-site-verification=..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Noindex toàn site</label>
            <button
              onClick={() => setNoindex(!noindex)}
              className={`relative w-11 h-6 rounded-full transition-colors ${noindex ? 'bg-red-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${noindex ? 'translate-x-5' : ''}`} />
            </button>
            {noindex && <span className="text-xs text-red-500 font-medium">Site sẽ không được Google index!</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Head Code</label>
            <textarea
              rows={5}
              value={customHead}
              onChange={(e) => setCustomHead(e.target.value)}
              placeholder="<!-- Thêm script, meta tags... -->"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={saveGeneral}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#262260] text-white rounded-lg text-sm font-medium hover:bg-[#1e1b4b]"
            >
              <Save size={16} /> Lưu cài đặt
            </button>
            {saved && <span className="text-sm text-green-600 font-medium">Đã lưu!</span>}
          </div>
        </div>
      )}

      {/* Redirects Tab */}
      {activeTab === 'redirects' && (
        <div className="space-y-6">
          {/* Add Redirect */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Thêm Redirect</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newFrom}
                onChange={(e) => setNewFrom(e.target.value)}
                placeholder="Đường dẫn nguồn: /old-path"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={newTo}
                onChange={(e) => setNewTo(e.target.value)}
                placeholder="Đường dẫn đích: /new-path"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24"
              >
                <option value={301}>301</option>
                <option value={302}>302</option>
              </select>
              <button
                onClick={addRedirect}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#262260] text-white rounded-lg text-sm font-medium hover:bg-[#1e1b4b]"
              >
                <Plus size={16} /> Thêm
              </button>
            </div>
          </div>

          {/* Redirects Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Danh sách Redirects ({redirects.length})</h3>
              {redirects.length > 0 && (
                <button
                  onClick={() => setShowNginx(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  <Code size={14} /> Generate Nginx Config
                </button>
              )}
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-3 text-left">From</th>
                  <th className="p-3 text-left">To</th>
                  <th className="p-3 text-left">Status Code</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {redirects.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-mono text-gray-700">{r.from}</td>
                    <td className="p-3 font-mono text-gray-700">{r.to}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${r.statusCode === 301 ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {r.statusCode}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditRedirect({ ...r })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Sửa">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => deleteRedirect(r.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Xóa">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {redirects.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">Chưa có redirect nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Edit Redirect Modal */}
          {editRedirect && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditRedirect(null)}>
              <div className="bg-white rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Sửa Redirect</h3>
                  <button onClick={() => setEditRedirect(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <input type="text" value={editRedirect.from} onChange={(e) => setEditRedirect({ ...editRedirect, from: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <input type="text" value={editRedirect.to} onChange={(e) => setEditRedirect({ ...editRedirect, to: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status Code</label>
                    <select value={editRedirect.statusCode} onChange={(e) => setEditRedirect({ ...editRedirect, statusCode: Number(e.target.value) })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option value={301}>301</option>
                      <option value={302}>302</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={updateRedirect} className="flex-1 py-2.5 bg-[#262260] text-white rounded-lg text-sm font-medium hover:bg-[#1e1b4b]">Lưu</button>
                    <button onClick={() => setEditRedirect(null)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Hủy</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nginx Config Modal */}
          {showNginx && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowNginx(false)}>
              <div className="bg-white rounded-xl w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Nginx Config</h3>
                  <button onClick={() => setShowNginx(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                </div>
                <div className="p-6">
                  <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                    {nginxConfig || '# Chưa có redirect nào'}
                  </pre>
                  <button
                    onClick={() => { navigator.clipboard.writeText(nginxConfig); }}
                    className="mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Copy to clipboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
