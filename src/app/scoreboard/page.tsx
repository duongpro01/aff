'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';

export default function ScoreboardPage() {
  const [teamA, setTeamA] = useState('Team A');
  const [teamB, setTeamB] = useState('Team B');
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [currentGame, setCurrentGame] = useState(1);
  const [gamesA, setGamesA] = useState(0);
  const [gamesB, setGamesB] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimer(0);
  };

  const endGame = (winner: 'A' | 'B') => {
    if (winner === 'A') setGamesA(g => g + 1);
    else setGamesB(g => g + 1);
    setScoreA(0);
    setScoreB(0);
    setCurrentGame(g => g + 1);
    resetTimer();
  };

  const newMatch = () => {
    setScoreA(0);
    setScoreB(0);
    setGamesA(0);
    setGamesB(0);
    setCurrentGame(1);
    resetTimer();
  };

  return (
    <div className="min-h-screen bg-[var(--gray-900)] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center mb-2">Bảng tỷ số trực tiếp</h1>
        <p className="text-center text-[var(--gray-400)] text-sm mb-8">Game {currentGame} | Sets: {gamesA} - {gamesB}</p>

        {/* Timer */}
        <div className="text-center mb-8">
          <div className="text-5xl font-mono font-bold mb-4 tracking-wider">{formatTime(timer)}</div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`p-3 rounded-full ${isRunning ? 'bg-[var(--warning)]' : 'bg-[var(--success)]'} text-white transition-colors`}
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button
              onClick={resetTimer}
              className="p-3 rounded-full bg-[var(--gray-600)] text-white hover:bg-[var(--gray-500)] transition-colors"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="grid grid-cols-3 gap-4 items-center mb-8">
          {/* Team A */}
          <div className="text-center">
            <input
              type="text"
              value={teamA}
              onChange={(e) => setTeamA(e.target.value)}
              className="bg-transparent text-center text-xl font-bold w-full border-b-2 border-[var(--gray-600)] focus:border-[var(--accent)] outline-none pb-1 mb-4"
            />
            <div className="text-8xl sm:text-9xl font-bold animate-count-up" key={`a-${scoreA}`}>
              {scoreA}
            </div>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setScoreA(s => Math.max(0, s - 1))}
                className="w-14 h-14 rounded-xl bg-[var(--gray-700)] hover:bg-[var(--gray-600)] flex items-center justify-center transition-colors"
              >
                <Minus className="w-6 h-6" />
              </button>
              <button
                onClick={() => setScoreA(s => s + 1)}
                className="w-14 h-14 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-light)] flex items-center justify-center transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* VS */}
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--gray-500)]">VS</div>
          </div>

          {/* Team B */}
          <div className="text-center">
            <input
              type="text"
              value={teamB}
              onChange={(e) => setTeamB(e.target.value)}
              className="bg-transparent text-center text-xl font-bold w-full border-b-2 border-[var(--gray-600)] focus:border-[var(--accent)] outline-none pb-1 mb-4"
            />
            <div className="text-8xl sm:text-9xl font-bold animate-count-up" key={`b-${scoreB}`}>
              {scoreB}
            </div>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setScoreB(s => Math.max(0, s - 1))}
                className="w-14 h-14 rounded-xl bg-[var(--gray-700)] hover:bg-[var(--gray-600)] flex items-center justify-center transition-colors"
              >
                <Minus className="w-6 h-6" />
              </button>
              <button
                onClick={() => setScoreB(s => s + 1)}
                className="w-14 h-14 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-light)] flex items-center justify-center transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => endGame('A')}
            className="py-3 bg-[var(--primary)] hover:bg-[var(--primary-light)] rounded-lg font-semibold transition-colors"
          >
            {teamA} thắng game
          </button>
          <button
            onClick={() => endGame('B')}
            className="py-3 bg-[var(--primary)] hover:bg-[var(--primary-light)] rounded-lg font-semibold transition-colors"
          >
            {teamB} thắng game
          </button>
        </div>

        <button
          onClick={newMatch}
          className="w-full py-3 bg-[var(--error)] hover:opacity-90 rounded-lg font-semibold transition-opacity"
        >
          Trận đấu mới
        </button>

        {/* Sets Summary */}
        {(gamesA > 0 || gamesB > 0) && (
          <div className="mt-6 bg-[var(--gray-800)] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[var(--gray-400)] mb-2">Tổng kết Sets</h3>
            <div className="flex items-center justify-between text-lg font-bold">
              <span>{teamA}</span>
              <span className="text-2xl">{gamesA} - {gamesB}</span>
              <span>{teamB}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
