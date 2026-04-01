'use client';

import { useState } from 'react';
import { Shuffle, Users, Dices } from 'lucide-react';

export default function BocThamPage() {
  const [input, setInput] = useState('');
  const [numGroups, setNumGroups] = useState(2);
  const [mode, setMode] = useState<'groups' | 'pairs'>('groups');
  const [results, setResults] = useState<string[][] | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const shuffle = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const handleDraw = () => {
    const names = input
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (names.length < 2) return;

    setIsAnimating(true);
    setResults(null);

    setTimeout(() => {
      const shuffled = shuffle(names);

      if (mode === 'pairs') {
        const pairs: string[][] = [];
        for (let i = 0; i < shuffled.length; i += 2) {
          if (i + 1 < shuffled.length) {
            pairs.push([shuffled[i], shuffled[i + 1]]);
          } else {
            pairs.push([shuffled[i]]);
          }
        }
        setResults(pairs);
      } else {
        const groups: string[][] = Array.from({ length: numGroups }, () => []);
        shuffled.forEach((name, idx) => {
          groups[idx % numGroups].push(name);
        });
        setResults(groups);
      }

      setIsAnimating(false);
    }, 1200);
  };

  const groupColors = [
    'border-blue-400 bg-blue-50',
    'border-red-400 bg-red-50',
    'border-green-400 bg-green-50',
    'border-yellow-400 bg-yellow-50',
    'border-purple-400 bg-purple-50',
    'border-pink-400 bg-pink-50',
    'border-cyan-400 bg-cyan-50',
    'border-orange-400 bg-orange-50',
  ];

  return (
    <div className="min-h-screen bg-[var(--gray-50)]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Dices className="w-8 h-8 text-[var(--accent)]" />
          <h1 className="text-3xl font-bold text-[var(--gray-900)]">Bốc thăm Pickleball</h1>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--gray-200)] p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[var(--gray-700)] mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Danh sách người chơi / đội (mỗi dòng một tên)
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-[var(--gray-200)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none font-mono"
              placeholder={"Nguyễn Văn A\nTrần Thị B\nLê Văn C\nPhạm Thị D\nHoàng Văn E\nVõ Thị F"}
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Chế độ</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode('groups')}
                  className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    mode === 'groups'
                      ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                      : 'border-[var(--gray-200)] hover:border-[var(--primary)]'
                  }`}
                >
                  Chia bảng
                </button>
                <button
                  onClick={() => setMode('pairs')}
                  className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    mode === 'pairs'
                      ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                      : 'border-[var(--gray-200)] hover:border-[var(--primary)]'
                  }`}
                >
                  Ghép cặp
                </button>
              </div>
            </div>
            {mode === 'groups' && (
              <div>
                <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Số bảng</label>
                <select
                  value={numGroups}
                  onChange={(e) => setNumGroups(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-[var(--gray-200)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  {[2, 3, 4, 5, 6, 7, 8].map(n => (
                    <option key={n} value={n}>{n} bảng</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Draw Button */}
          <button
            onClick={handleDraw}
            disabled={isAnimating || input.trim().split('\n').filter(l => l.trim()).length < 2}
            className="w-full py-3 bg-[var(--accent)] text-white rounded-lg font-semibold text-lg hover:bg-[var(--accent-light)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shuffle className={`w-5 h-5 ${isAnimating ? 'animate-spin' : ''}`} />
            {isAnimating ? 'Đang bốc thăm...' : 'Bốc thăm'}
          </button>
        </div>

        {/* Animation */}
        {isAnimating && (
          <div className="flex items-center justify-center py-12">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-[var(--accent)] border-t-transparent animate-spin" />
              <div className="absolute inset-3 rounded-full border-4 border-[var(--primary)] border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Dices className="w-8 h-8 text-[var(--accent)]" />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results && !isAnimating && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold text-[var(--gray-900)] mb-4">
              {mode === 'groups' ? 'Kết quả chia bảng' : 'Kết quả ghép cặp'}
            </h2>
            <div className={`grid gap-4 ${mode === 'pairs' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {results.map((group, gIdx) => (
                <div
                  key={gIdx}
                  className={`rounded-xl border-2 p-4 ${groupColors[gIdx % groupColors.length]}`}
                  style={{ animationDelay: `${gIdx * 100}ms` }}
                >
                  <h3 className="font-semibold text-[var(--gray-800)] mb-3">
                    {mode === 'groups' ? `Bảng ${String.fromCharCode(65 + gIdx)}` : `Cặp ${gIdx + 1}`}
                  </h3>
                  <ul className="space-y-1.5">
                    {group.map((name, nIdx) => (
                      <li key={nIdx} className="flex items-center gap-2 text-sm">
                        <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-[var(--gray-600)]">
                          {nIdx + 1}
                        </span>
                        <span className="font-medium text-[var(--gray-800)]">{name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Redraw button */}
            <button
              onClick={handleDraw}
              className="mt-6 w-full py-2.5 border-2 border-[var(--accent)] text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)] hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Bốc thăm lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
