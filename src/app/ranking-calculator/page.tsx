'use client';

import { useState } from 'react';
import { Calculator, ArrowUp, ArrowDown } from 'lucide-react';

export default function RankingCalculatorPage() {
  const [ratingA, setRatingA] = useState('1500');
  const [ratingB, setRatingB] = useState('1500');
  const [winner, setWinner] = useState<'A' | 'B'>('A');
  const [result, setResult] = useState<{
    newRatingA: number;
    newRatingB: number;
    changeA: number;
    changeB: number;
  } | null>(null);

  const calculate = () => {
    const K = 32;
    const ra = parseFloat(ratingA) || 1500;
    const rb = parseFloat(ratingB) || 1500;

    const expectedA = 1 / (1 + Math.pow(10, (rb - ra) / 400));
    const expectedB = 1 / (1 + Math.pow(10, (ra - rb) / 400));

    const scoreA = winner === 'A' ? 1 : 0;
    const scoreB = winner === 'B' ? 1 : 0;

    const newRatingA = Math.round(ra + K * (scoreA - expectedA));
    const newRatingB = Math.round(rb + K * (scoreB - expectedB));

    setResult({
      newRatingA,
      newRatingB,
      changeA: newRatingA - ra,
      changeB: newRatingB - rb,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--gray-50)]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Calculator className="w-8 h-8 text-[var(--accent)]" />
          <h1 className="text-3xl font-bold text-[var(--gray-900)]">Tính điểm Ranking</h1>
        </div>

        {/* Calculator Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--gray-200)] p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Player A */}
            <div>
              <label className="block text-sm font-semibold text-[var(--gray-700)] mb-2">
                Player A - Rating
              </label>
              <input
                type="number"
                value={ratingA}
                onChange={(e) => { setRatingA(e.target.value); setResult(null); }}
                className="w-full px-4 py-3 border border-[var(--gray-200)] rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-center"
                placeholder="1500"
              />
            </div>

            {/* Player B */}
            <div>
              <label className="block text-sm font-semibold text-[var(--gray-700)] mb-2">
                Player B - Rating
              </label>
              <input
                type="number"
                value={ratingB}
                onChange={(e) => { setRatingB(e.target.value); setResult(null); }}
                className="w-full px-4 py-3 border border-[var(--gray-200)] rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-center"
                placeholder="1500"
              />
            </div>
          </div>

          {/* Winner Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[var(--gray-700)] mb-2">
              Kết quả
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setWinner('A'); setResult(null); }}
                className={`py-3 px-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                  winner === 'A'
                    ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                    : 'border-[var(--gray-200)] text-[var(--gray-600)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                }`}
              >
                Player A thắng
              </button>
              <button
                onClick={() => { setWinner('B'); setResult(null); }}
                className={`py-3 px-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                  winner === 'B'
                    ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                    : 'border-[var(--gray-200)] text-[var(--gray-600)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                }`}
              >
                Player B thắng
              </button>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculate}
            className="w-full py-3 bg-[var(--accent)] text-white rounded-lg font-semibold text-lg hover:bg-[var(--accent-light)] transition-colors flex items-center justify-center gap-2"
          >
            <Calculator className="w-5 h-5" />
            Tính điểm
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-xl shadow-sm border border-[var(--gray-200)] p-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-[var(--gray-900)] mb-4 text-center">Kết quả</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Player A Result */}
              <div className={`rounded-xl p-5 text-center ${winner === 'A' ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                <p className="text-sm font-medium text-[var(--gray-500)] mb-1">Player A</p>
                <p className="text-3xl font-bold text-[var(--gray-900)] mb-2">{result.newRatingA}</p>
                <div className={`inline-flex items-center gap-1 text-lg font-bold ${result.changeA >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                  {result.changeA >= 0 ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                  {result.changeA >= 0 ? '+' : ''}{result.changeA}
                </div>
              </div>

              {/* Player B Result */}
              <div className={`rounded-xl p-5 text-center ${winner === 'B' ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                <p className="text-sm font-medium text-[var(--gray-500)] mb-1">Player B</p>
                <p className="text-3xl font-bold text-[var(--gray-900)] mb-2">{result.newRatingB}</p>
                <div className={`inline-flex items-center gap-1 text-lg font-bold ${result.changeB >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                  {result.changeB >= 0 ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                  {result.changeB >= 0 ? '+' : ''}{result.changeB}
                </div>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="mt-6 pt-4 border-t border-[var(--gray-200)]">
              <div className="flex items-center justify-between text-sm text-[var(--gray-500)] mb-2">
                <span>Player A: {ratingA} → {result.newRatingA}</span>
                <span>Player B: {ratingB} → {result.newRatingB}</span>
              </div>
              <div className="h-4 bg-[var(--gray-200)] rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[var(--primary)] transition-all duration-700"
                  style={{ width: `${(result.newRatingA / (result.newRatingA + result.newRatingB)) * 100}%` }}
                />
                <div
                  className="h-full bg-[var(--accent)] transition-all duration-700"
                  style={{ width: `${(result.newRatingB / (result.newRatingA + result.newRatingB)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[var(--gray-400)] mt-1">
                <span>Player A</span>
                <span>Player B</span>
              </div>
            </div>
          </div>
        )}

        {/* Formula Info */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-[var(--gray-200)] p-5">
          <h3 className="text-sm font-semibold text-[var(--gray-700)] mb-2">Công thức ELO</h3>
          <div className="text-xs text-[var(--gray-500)] space-y-1 font-mono">
            <p>K = 32</p>
            <p>Expected = 1 / (1 + 10^((RatingB - RatingA) / 400))</p>
            <p>New Rating = Rating + K * (Score - Expected)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
