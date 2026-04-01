'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Trophy, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface Player {
  piraId: string;
  name: string;
  country: string;
  countryFlag: string;
  rating: number;
  tier: string;
  wins: number;
  losses: number;
}

const mockPlayers: Player[] = [
  { piraId: 'VN001', name: 'Nguyễn Văn Hùng', country: 'Vietnam', countryFlag: '🇻🇳', rating: 2150, tier: 'Pro', wins: 87, losses: 12 },
  { piraId: 'VN002', name: 'Trần Thị Mai', country: 'Vietnam', countryFlag: '🇻🇳', rating: 2080, tier: 'Pro', wins: 74, losses: 18 },
  { piraId: 'US001', name: 'Ben Johns', country: 'USA', countryFlag: '🇺🇸', rating: 2340, tier: 'Pro+', wins: 142, losses: 8 },
  { piraId: 'US002', name: 'Anna Leigh Waters', country: 'USA', countryFlag: '🇺🇸', rating: 2290, tier: 'Pro+', wins: 128, losses: 14 },
  { piraId: 'TH001', name: 'Somchai Rattanakorn', country: 'Thailand', countryFlag: '🇹🇭', rating: 1980, tier: 'Advanced', wins: 63, losses: 22 },
  { piraId: 'VN003', name: 'Phạm Đức Anh', country: 'Vietnam', countryFlag: '🇻🇳', rating: 1920, tier: 'Advanced', wins: 58, losses: 25 },
  { piraId: 'JP001', name: 'Takeshi Yamamoto', country: 'Japan', countryFlag: '🇯🇵', rating: 2010, tier: 'Advanced', wins: 69, losses: 20 },
  { piraId: 'VN004', name: 'Lê Hoàng Phúc', country: 'Vietnam', countryFlag: '🇻🇳', rating: 1850, tier: 'Intermediate', wins: 45, losses: 30 },
  { piraId: 'KR001', name: 'Kim Soo-jin', country: 'South Korea', countryFlag: '🇰🇷', rating: 2050, tier: 'Pro', wins: 71, losses: 19 },
  { piraId: 'VN005', name: 'Võ Thanh Tùng', country: 'Vietnam', countryFlag: '🇻🇳', rating: 1780, tier: 'Intermediate', wins: 39, losses: 34 },
];

const countries = ['Tất cả', 'Vietnam', 'USA', 'Thailand', 'Japan', 'South Korea'];
const genders = ['Tất cả', 'Nam', 'Nữ'];
const types = ['Singles', 'Doubles', 'Mixed Doubles'];

const ITEMS_PER_PAGE = 5;

export default function RankingPage() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Tất cả');
  const [selectedGender, setSelectedGender] = useState('Tất cả');
  const [selectedType, setSelectedType] = useState('Singles');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const filteredPlayers = useMemo(() => {
    let result = [...mockPlayers];
    if (selectedCountry !== 'Tất cả') {
      result = result.filter(p => p.country === selectedCountry);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.piraId.toLowerCase().includes(q));
    }
    result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [selectedCountry, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE));
  const paginatedPlayers = filteredPlayers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Pro+': return 'bg-yellow-100 text-yellow-800';
      case 'Pro': return 'bg-purple-100 text-purple-800';
      case 'Advanced': return 'bg-blue-100 text-blue-800';
      case 'Intermediate': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gray-50)]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="w-8 h-8 text-[var(--accent)]" />
          <h1 className="text-3xl font-bold text-[var(--gray-900)]">Bảng xếp hạng PIRA</h1>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--gray-200)] p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gray-400)]" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc PIRA ID..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 border border-[var(--gray-200)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-[var(--gray-200)] rounded-lg text-sm font-medium hover:bg-[var(--gray-50)] transition-colors"
            >
              <Filter className="w-4 h-4" />
              Bộ lọc
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[var(--gray-200)] animate-slide-down">
              <div>
                <label className="block text-xs font-medium text-[var(--gray-500)] mb-1">Quốc gia</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => { setSelectedCountry(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 border border-[var(--gray-200)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--gray-500)] mb-1">Giới tính</label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--gray-200)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  {genders.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--gray-500)] mb-1">Loại</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--gray-200)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Ranking Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--gray-200)] overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-8 h-8 bg-[var(--gray-200)] rounded-full" />
                  <div className="flex-1 h-4 bg-[var(--gray-200)] rounded" />
                  <div className="w-20 h-4 bg-[var(--gray-200)] rounded" />
                  <div className="w-16 h-4 bg-[var(--gray-200)] rounded" />
                  <div className="w-24 h-4 bg-[var(--gray-200)] rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[var(--primary)] text-white">
                      <th className="px-4 py-3 text-left text-sm font-semibold w-16">Hạng</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Tên</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold w-24">Quốc gia</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold w-20">Rating</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold w-24">Tier</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold w-24">Thắng/Thua</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold w-40">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPlayers.map((player, idx) => {
                      const rank = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                      const winRate = Math.round((player.wins / (player.wins + player.losses)) * 100);
                      return (
                        <Link key={player.piraId} href={`/ranking/${player.piraId}`} className="contents">
                          <tr className="border-b border-[var(--gray-100)] hover:bg-[var(--gray-50)] cursor-pointer transition-colors">
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${rank <= 3 ? 'bg-[var(--accent)] text-white' : 'bg-[var(--gray-100)] text-[var(--gray-600)]'}`}>
                                {rank}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-[var(--gray-900)]">{player.name}</td>
                            <td className="px-4 py-3 text-center text-lg">{player.countryFlag}</td>
                            <td className="px-4 py-3 text-center font-bold text-[var(--primary)]">{player.rating}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`badge ${getTierColor(player.tier)}`}>{player.tier}</span>
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              <span className="text-[var(--success)] font-medium">{player.wins}</span>
                              <span className="text-[var(--gray-400)] mx-1">/</span>
                              <span className="text-[var(--error)] font-medium">{player.losses}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-[var(--gray-200)] rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${winRate}%`,
                                      backgroundColor: winRate >= 70 ? 'var(--success)' : winRate >= 50 ? 'var(--warning)' : 'var(--error)',
                                    }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-[var(--gray-600)] w-10 text-right">{winRate}%</span>
                              </div>
                            </td>
                          </tr>
                        </Link>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-[var(--gray-100)]">
                {paginatedPlayers.map((player, idx) => {
                  const rank = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                  const winRate = Math.round((player.wins / (player.wins + player.losses)) * 100);
                  return (
                    <Link key={player.piraId} href={`/ranking/${player.piraId}`} className="block p-4 hover:bg-[var(--gray-50)] transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${rank <= 3 ? 'bg-[var(--accent)] text-white' : 'bg-[var(--gray-100)] text-[var(--gray-600)]'}`}>
                          {rank}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-[var(--gray-900)]">{player.name} {player.countryFlag}</div>
                          <div className="text-xs text-[var(--gray-500)]">Rating: {player.rating} | <span className={`badge ${getTierColor(player.tier)}`}>{player.tier}</span></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-11">
                        <div className="flex-1 h-2 bg-[var(--gray-200)] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${winRate}%`, backgroundColor: winRate >= 70 ? 'var(--success)' : 'var(--warning)' }} />
                        </div>
                        <span className="text-xs font-medium text-[var(--gray-600)]">{winRate}% ({player.wins}W/{player.losses}L)</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {filteredPlayers.length === 0 && (
                <div className="p-12 text-center text-[var(--gray-400)]">
                  Không tìm thấy kết quả phù hợp.
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-[var(--gray-200)] hover:bg-[var(--gray-100)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-[var(--primary)] text-white' : 'border border-[var(--gray-200)] hover:bg-[var(--gray-100)]'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-[var(--gray-200)] hover:bg-[var(--gray-100)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
