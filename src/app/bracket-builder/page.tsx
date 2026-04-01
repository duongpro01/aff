'use client';

import { useState, useMemo } from 'react';
import { GitBranch, Plus, X, Trophy } from 'lucide-react';

interface Match {
  id: string;
  round: number;
  position: number;
  teamA: string | null;
  teamB: string | null;
  winner: string | null;
}

function generateBracket(teams: string[], format: string): Match[] {
  const n = teams.length;
  if (n < 2) return [];

  // Pad to next power of 2
  const size = Math.pow(2, Math.ceil(Math.log2(n)));
  const paddedTeams: (string | null)[] = [...teams];
  while (paddedTeams.length < size) paddedTeams.push(null);

  const totalRounds = Math.log2(size);
  const matches: Match[] = [];

  // First round
  for (let i = 0; i < size / 2; i++) {
    const teamA = paddedTeams[i * 2];
    const teamB = paddedTeams[i * 2 + 1];
    const match: Match = {
      id: `1-${i}`,
      round: 1,
      position: i,
      teamA,
      teamB,
      winner: teamB === null ? teamA : null,
    };
    matches.push(match);
  }

  // Subsequent rounds
  for (let round = 2; round <= totalRounds; round++) {
    const matchesInRound = size / Math.pow(2, round);
    for (let i = 0; i < matchesInRound; i++) {
      // Check if feeder matches have byes
      const feederA = matches.find(m => m.round === round - 1 && m.position === i * 2);
      const feederB = matches.find(m => m.round === round - 1 && m.position === i * 2 + 1);
      const match: Match = {
        id: `${round}-${i}`,
        round,
        position: i,
        teamA: feederA?.winner || null,
        teamB: feederB?.winner || null,
        winner: null,
      };
      matches.push(match);
    }
  }

  return matches;
}

export default function BracketBuilderPage() {
  const [teams, setTeams] = useState<string[]>(['', '']);
  const [format, setFormat] = useState('single');
  const [bracket, setBracket] = useState<Match[] | null>(null);

  const addTeam = () => setTeams(prev => [...prev, '']);

  const removeTeam = (index: number) => {
    if (teams.length <= 2) return;
    setTeams(prev => prev.filter((_, i) => i !== index));
  };

  const updateTeam = (index: number, value: string) => {
    setTeams(prev => prev.map((t, i) => (i === index ? value : t)));
  };

  const generateBracketHandler = () => {
    const validTeams = teams.filter(t => t.trim());
    if (validTeams.length < 2) return;
    const matches = generateBracket(validTeams, format);
    setBracket(matches);
  };

  const setWinner = (matchId: string, winner: string) => {
    if (!bracket) return;

    const newBracket = [...bracket];
    const matchIndex = newBracket.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;

    const match = { ...newBracket[matchIndex] };
    match.winner = winner;
    newBracket[matchIndex] = match;

    // Propagate winner to next round
    const nextRound = match.round + 1;
    const nextPosition = Math.floor(match.position / 2);
    const nextMatchIndex = newBracket.findIndex(m => m.round === nextRound && m.position === nextPosition);

    if (nextMatchIndex !== -1) {
      const nextMatch = { ...newBracket[nextMatchIndex] };
      if (match.position % 2 === 0) {
        nextMatch.teamA = winner;
      } else {
        nextMatch.teamB = winner;
      }
      // Reset winner if teams changed
      nextMatch.winner = null;
      newBracket[nextMatchIndex] = nextMatch;

      // Clear subsequent rounds from this match forward
      const clearFromRound = nextRound + 1;
      const clearMatches = (round: number, pos: number) => {
        const idx = newBracket.findIndex(m => m.round === round && m.position === pos);
        if (idx === -1) return;
        const m = { ...newBracket[idx] };
        if (Math.floor(pos / 2) === pos / 2) {
          // This could be affected
        }
        m.winner = null;
        newBracket[idx] = m;
      };
    }

    setBracket(newBracket);
  };

  const rounds = useMemo(() => {
    if (!bracket) return [];
    const maxRound = Math.max(...bracket.map(m => m.round));
    return Array.from({ length: maxRound }, (_, i) => i + 1);
  }, [bracket]);

  const getRoundName = (round: number, totalRounds: number) => {
    if (round === totalRounds) return 'Chung kết';
    if (round === totalRounds - 1) return 'Bán kết';
    if (round === totalRounds - 2) return 'Tứ kết';
    return `Vòng ${round}`;
  };

  return (
    <div className="min-h-screen bg-[var(--gray-50)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <GitBranch className="w-8 h-8 text-[var(--accent)]" />
          <h1 className="text-3xl font-bold text-[var(--gray-900)]">Bracket Giải đấu</h1>
        </div>

        {/* Input Section */}
        {!bracket && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-[var(--gray-200)] p-6 mb-6">
              {/* Format */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--gray-700)] mb-2">Thể thức</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFormat('single')}
                    className={`py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                      format === 'single'
                        ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                        : 'border-[var(--gray-200)] hover:border-[var(--primary)]'
                    }`}
                  >
                    Single Elimination
                  </button>
                  <button
                    onClick={() => setFormat('double')}
                    className={`py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                      format === 'double'
                        ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                        : 'border-[var(--gray-200)] hover:border-[var(--primary)]'
                    }`}
                  >
                    Double Elimination
                  </button>
                </div>
              </div>

              {/* Teams */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--gray-700)] mb-2">Đội / Người chơi</label>
                <div className="space-y-2">
                  {teams.map((team, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="w-8 h-10 flex items-center justify-center text-sm font-bold text-[var(--gray-400)]">
                        {idx + 1}
                      </div>
                      <input
                        type="text"
                        value={team}
                        onChange={(e) => updateTeam(idx, e.target.value)}
                        className="flex-1 px-3 py-2 border border-[var(--gray-200)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        placeholder={`Đội ${idx + 1}`}
                      />
                      {teams.length > 2 && (
                        <button
                          onClick={() => removeTeam(idx)}
                          className="p-2 text-[var(--error)] hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addTeam}
                  className="mt-2 text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Thêm đội
                </button>
              </div>

              {/* Generate */}
              <button
                onClick={generateBracketHandler}
                disabled={teams.filter(t => t.trim()).length < 2}
                className="w-full py-3 bg-[var(--accent)] text-white rounded-lg font-semibold text-lg hover:bg-[var(--accent-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <GitBranch className="w-5 h-5" />
                Tạo Bracket
              </button>
            </div>
          </div>
        )}

        {/* Bracket Display */}
        {bracket && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--gray-900)]">
                {format === 'single' ? 'Single' : 'Double'} Elimination Bracket
              </h2>
              <button
                onClick={() => setBracket(null)}
                className="px-4 py-2 text-sm border border-[var(--gray-200)] rounded-lg hover:bg-[var(--gray-100)] transition-colors"
              >
                Tạo bracket mới
              </button>
            </div>

            <div className="overflow-x-auto pb-4">
              <div className="flex gap-8 min-w-max">
                {rounds.map((round) => {
                  const roundMatches = bracket.filter(m => m.round === round).sort((a, b) => a.position - b.position);
                  const totalRounds = rounds.length;
                  const isFinal = round === totalRounds;

                  return (
                    <div key={round} className="flex flex-col items-center">
                      <div className={`text-sm font-semibold mb-4 px-3 py-1 rounded-full ${isFinal ? 'bg-[var(--accent)] text-white' : 'bg-[var(--gray-200)] text-[var(--gray-700)]'}`}>
                        {getRoundName(round, totalRounds)}
                      </div>
                      <div
                        className="flex flex-col justify-around flex-1 gap-4"
                        style={{ minHeight: `${roundMatches.length * 100}px` }}
                      >
                        {roundMatches.map((match) => (
                          <div
                            key={match.id}
                            className={`w-56 rounded-lg border-2 overflow-hidden ${isFinal ? 'border-[var(--accent)] shadow-lg' : 'border-[var(--gray-200)]'}`}
                          >
                            {/* Team A */}
                            <button
                              onClick={() => match.teamA && match.teamB && setWinner(match.id, match.teamA)}
                              disabled={!match.teamA || !match.teamB}
                              className={`w-full px-3 py-2.5 text-left text-sm font-medium border-b border-[var(--gray-200)] flex items-center justify-between transition-colors ${
                                match.winner === match.teamA
                                  ? 'bg-green-100 text-green-800'
                                  : match.teamA
                                  ? 'bg-white hover:bg-[var(--gray-50)] cursor-pointer'
                                  : 'bg-[var(--gray-50)] text-[var(--gray-300)]'
                              } disabled:cursor-default`}
                            >
                              <span className="truncate">{match.teamA || 'TBD'}</span>
                              {match.winner === match.teamA && <Trophy className="w-3.5 h-3.5 text-green-600 shrink-0" />}
                            </button>
                            {/* Team B */}
                            <button
                              onClick={() => match.teamA && match.teamB && setWinner(match.id, match.teamB)}
                              disabled={!match.teamA || !match.teamB}
                              className={`w-full px-3 py-2.5 text-left text-sm font-medium flex items-center justify-between transition-colors ${
                                match.winner === match.teamB
                                  ? 'bg-green-100 text-green-800'
                                  : match.teamB
                                  ? 'bg-white hover:bg-[var(--gray-50)] cursor-pointer'
                                  : 'bg-[var(--gray-50)] text-[var(--gray-300)]'
                              } disabled:cursor-default`}
                            >
                              <span className="truncate">{match.teamB || 'TBD'}</span>
                              {match.winner === match.teamB && <Trophy className="w-3.5 h-3.5 text-green-600 shrink-0" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Champion */}
                {bracket.some(m => m.round === rounds.length && m.winner) && (
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-sm font-semibold mb-4 px-3 py-1 rounded-full bg-yellow-400 text-yellow-900">
                      Vô địch
                    </div>
                    <div className="w-56 rounded-xl border-2 border-yellow-400 bg-yellow-50 p-4 text-center shadow-lg">
                      <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                      <p className="text-lg font-bold text-[var(--gray-900)]">
                        {bracket.find(m => m.round === rounds.length)?.winner}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bracket lines hint */}
            <p className="text-xs text-[var(--gray-400)] mt-4 text-center">
              Click vào tên đội để chọn đội thắng. Kết quả sẽ tự động cập nhật vào vòng tiếp theo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
