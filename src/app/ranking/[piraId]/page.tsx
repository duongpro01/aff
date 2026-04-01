'use client';

import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft, Trophy, Target, Percent, Swords } from 'lucide-react';

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

const mockPlayers: Record<string, Player> = {
  'VN001': { piraId: 'VN001', name: 'Nguyễn Văn Hùng', country: 'Vietnam', countryFlag: '🇻🇳', rating: 2150, tier: 'Pro', wins: 87, losses: 12 },
  'VN002': { piraId: 'VN002', name: 'Trần Thị Mai', country: 'Vietnam', countryFlag: '🇻🇳', rating: 2080, tier: 'Pro', wins: 74, losses: 18 },
  'US001': { piraId: 'US001', name: 'Ben Johns', country: 'USA', countryFlag: '🇺🇸', rating: 2340, tier: 'Pro+', wins: 142, losses: 8 },
  'US002': { piraId: 'US002', name: 'Anna Leigh Waters', country: 'USA', countryFlag: '🇺🇸', rating: 2290, tier: 'Pro+', wins: 128, losses: 14 },
  'TH001': { piraId: 'TH001', name: 'Somchai Rattanakorn', country: 'Thailand', countryFlag: '🇹🇭', rating: 1980, tier: 'Advanced', wins: 63, losses: 22 },
  'VN003': { piraId: 'VN003', name: 'Phạm Đức Anh', country: 'Vietnam', countryFlag: '🇻🇳', rating: 1920, tier: 'Advanced', wins: 58, losses: 25 },
  'JP001': { piraId: 'JP001', name: 'Takeshi Yamamoto', country: 'Japan', countryFlag: '🇯🇵', rating: 2010, tier: 'Advanced', wins: 69, losses: 20 },
  'VN004': { piraId: 'VN004', name: 'Lê Hoàng Phúc', country: 'Vietnam', countryFlag: '🇻🇳', rating: 1850, tier: 'Intermediate', wins: 45, losses: 30 },
  'KR001': { piraId: 'KR001', name: 'Kim Soo-jin', country: 'South Korea', countryFlag: '🇰🇷', rating: 2050, tier: 'Pro', wins: 71, losses: 19 },
  'VN005': { piraId: 'VN005', name: 'Võ Thanh Tùng', country: 'Vietnam', countryFlag: '🇻🇳', rating: 1780, tier: 'Intermediate', wins: 39, losses: 34 },
};

const mockMatchHistory = [
  { date: '2026-03-28', opponent: 'Trần Minh Khoa', result: 'W', score: '11-7, 11-5', ratingChange: +12 },
  { date: '2026-03-20', opponent: 'Lê Văn Tài', result: 'W', score: '11-9, 8-11, 11-6', ratingChange: +8 },
  { date: '2026-03-15', opponent: 'Nguyễn Hữu Phát', result: 'L', score: '7-11, 11-9, 5-11', ratingChange: -15 },
  { date: '2026-03-10', opponent: 'Park Ji-hoon', result: 'W', score: '11-3, 11-8', ratingChange: +18 },
  { date: '2026-03-05', opponent: 'Đặng Quốc Bảo', result: 'W', score: '11-6, 11-4', ratingChange: +10 },
];

export default function PlayerDetailPage({ params }: { params: Promise<{ piraId: string }> }) {
  const { piraId } = use(params);
  const player = mockPlayers[piraId];

  if (!player) {
    return (
      <div className="min-h-screen bg-[var(--gray-50)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-[var(--gray-500)] mb-4">Không tìm thấy người chơi</p>
          <Link href="/ranking" className="text-[var(--primary)] hover:underline">Quay lại bảng xếp hạng</Link>
        </div>
      </div>
    );
  }

  const totalMatches = player.wins + player.losses;
  const winRate = Math.round((player.wins / totalMatches) * 100);

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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link href="/ranking" className="inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:underline mb-6">
          <ChevronLeft className="w-4 h-4" />
          Quay lại bảng xếp hạng
        </Link>

        {/* Player Header */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--gray-200)] p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-3xl font-bold">
              {player.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-[var(--gray-900)]">{player.name}</h1>
                <span className="text-2xl">{player.countryFlag}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--gray-500)]">
                <span>PIRA ID: {player.piraId}</span>
                <span className={`badge ${getTierColor(player.tier)}`}>{player.tier}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-[var(--gray-200)] p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-[var(--gray-500)]">Rating</span>
            </div>
            <p className="text-3xl font-bold text-[var(--gray-900)]">{player.rating}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[var(--gray-200)] p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Percent className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-[var(--gray-500)]">Win Rate</span>
            </div>
            <p className="text-3xl font-bold text-[var(--gray-900)]">{winRate}%</p>
            <div className="mt-2 h-2 bg-[var(--gray-200)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--success)] rounded-full" style={{ width: `${winRate}%` }} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[var(--gray-200)] p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Swords className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-[var(--gray-500)]">Tổng trận đấu</span>
            </div>
            <p className="text-3xl font-bold text-[var(--gray-900)]">{totalMatches}</p>
            <p className="text-xs text-[var(--gray-400)] mt-1">
              <span className="text-[var(--success)]">{player.wins}W</span> / <span className="text-[var(--error)]">{player.losses}L</span>
            </p>
          </div>
        </div>

        {/* Match History */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--gray-200)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--gray-200)]">
            <h2 className="text-lg font-semibold text-[var(--gray-900)] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[var(--accent)]" />
              Lịch sử thi đấu
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--gray-50)]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--gray-500)] uppercase">Ngày</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--gray-500)] uppercase">Đối thủ</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[var(--gray-500)] uppercase">Kết quả</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[var(--gray-500)] uppercase">Tỷ số</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--gray-500)] uppercase">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gray-100)]">
                {mockMatchHistory.map((match, idx) => (
                  <tr key={idx} className="hover:bg-[var(--gray-50)] transition-colors">
                    <td className="px-6 py-3 text-sm text-[var(--gray-600)]">{match.date}</td>
                    <td className="px-6 py-3 text-sm font-medium text-[var(--gray-900)]">{match.opponent}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${match.result === 'W' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {match.result}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center text-sm text-[var(--gray-600)]">{match.score}</td>
                    <td className="px-6 py-3 text-right text-sm font-medium">
                      <span className={match.ratingChange > 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}>
                        {match.ratingChange > 0 ? '+' : ''}{match.ratingChange}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
