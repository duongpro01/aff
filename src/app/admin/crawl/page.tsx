'use client';

import { useState } from 'react';
import { Globe, Database } from 'lucide-react';
import CrawlPanel from '@/components/admin/CrawlPanel';
import { crawlSources, sourceColors } from '@/lib/crawl-sources';

export default function AdminCrawl() {
  const [activeSource, setActiveSource] = useState(crawlSources[0].id);
  const currentSource = crawlSources.find((s) => s.id === activeSource) || crawlSources[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Import du lieu</h2>
          <p className="text-sm text-gray-500 mt-1">
            Crawl va import san pham tu cac nguon ben ngoai
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Database size={16} />
          <span>{crawlSources.length} nguon</span>
        </div>
      </div>

      {/* Source Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {crawlSources.map((source) => {
              const colors = sourceColors[source.color] || sourceColors.indigo;
              const isActive = activeSource === source.id;

              return (
                <button
                  key={source.id}
                  onClick={() => setActiveSource(source.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? `${colors.text} border-current`
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Globe size={16} />
                  <span>{source.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? `${colors.bgLight} ${colors.text}` : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {source.dataType}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Source Info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">{currentSource.name}</h3>
              <p className="text-sm text-gray-500">{currentSource.domain}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-gray-500">
                <span className="font-medium text-gray-700">
                  {currentSource.suggestedCollections.length}
                </span>{' '}
                collections
              </div>
              {currentSource.suggestedBrands && (
                <div className="text-gray-500">
                  <span className="font-medium text-gray-700">
                    {currentSource.suggestedBrands.length}
                  </span>{' '}
                  brands
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Crawl Panel */}
      <CrawlPanel key={currentSource.id} source={currentSource} />
    </div>
  );
}
