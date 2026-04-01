'use client';

import { useState } from 'react';
import { Calendar, MapPin, Users, Plus, Trophy, X } from 'lucide-react';
import tournamentsData from '@/data/tournaments.json';

interface Tournament {
  id: number;
  name: string;
  date: string;
  location: string;
  teams: string[];
  format: string;
  status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  upcoming: { label: 'Sắp diễn ra', className: 'bg-blue-100 text-blue-800' },
  ongoing: { label: 'Đang diễn ra', className: 'bg-green-100 text-green-800' },
  completed: { label: 'Đã kết thúc', className: 'bg-gray-100 text-gray-600' },
};

const formats = ['Round Robin', 'Single Elimination', 'Double Elimination'];

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>(tournamentsData as Tournament[]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    format: formats[0],
    teams: [''],
  });

  const addTeam = () => {
    setFormData(prev => ({ ...prev, teams: [...prev.teams, ''] }));
  };

  const removeTeam = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teams: prev.teams.filter((_, i) => i !== index),
    }));
  };

  const updateTeam = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      teams: prev.teams.map((t, i) => (i === index ? value : t)),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.location) return;
    const newTournament: Tournament = {
      id: Date.now(),
      name: formData.name,
      date: formData.date,
      location: formData.location,
      teams: formData.teams.filter(t => t.trim()),
      format: formData.format,
      status: 'upcoming',
    };
    setTournaments(prev => [newTournament, ...prev]);
    setFormData({ name: '', date: '', location: '', format: formats[0], teams: [''] });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-[var(--gray-50)]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-[var(--accent)]" />
            <h1 className="text-3xl font-bold text-[var(--gray-900)]">Giải đấu Pickleball</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white rounded-lg font-semibold hover:bg-[var(--accent-light)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tạo giải đấu
          </button>
        </div>

        {/* Create Tournament Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-[var(--gray-200)] p-6 mb-6 animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--gray-900)]">Tạo giải đấu mới</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-[var(--gray-100)] rounded">
                <X className="w-5 h-5 text-[var(--gray-400)]" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Tên giải đấu</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--gray-200)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="VD: YeuPick Open 2026"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Ngày thi đấu</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--gray-200)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Địa điểm</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--gray-200)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="VD: Nhà thi đấu Phú Thọ, TP.HCM"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Thể thức</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--gray-200)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    {formats.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              {/* Teams */}
              <div>
                <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Nội dung thi đấu</label>
                <div className="space-y-2">
                  {formData.teams.map((team, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={team}
                        onChange={(e) => updateTeam(idx, e.target.value)}
                        className="flex-1 px-3 py-2 border border-[var(--gray-200)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        placeholder={`Nội dung ${idx + 1} (VD: Đôi Nam)`}
                      />
                      {formData.teams.length > 1 && (
                        <button
                          type="button"
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
                  type="button"
                  onClick={addTeam}
                  className="mt-2 text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Thêm nội dung
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[var(--primary)] text-white rounded-lg font-semibold hover:bg-[var(--primary-light)] transition-colors"
              >
                Tạo giải đấu
              </button>
            </form>
          </div>
        )}

        {/* Tournament Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tournaments.map((tournament) => {
            const status = statusConfig[tournament.status] || statusConfig.upcoming;
            return (
              <div key={tournament.id} className="bg-white rounded-xl shadow-sm border border-[var(--gray-200)] p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-[var(--gray-900)] leading-tight">{tournament.name}</h3>
                  <span className={`badge shrink-0 ml-2 ${status.className}`}>{status.label}</span>
                </div>
                <div className="space-y-2 text-sm text-[var(--gray-600)]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[var(--gray-400)]" />
                    <span>{tournament.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--gray-400)]" />
                    <span>{tournament.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[var(--gray-400)]" />
                    <span>{tournament.teams.length} nội dung: {tournament.teams.join(', ')}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--gray-100)] text-xs text-[var(--gray-500)]">
                  Thể thức: {tournament.format}
                </div>
              </div>
            );
          })}
        </div>

        {tournaments.length === 0 && (
          <div className="text-center py-12 text-[var(--gray-400)]">
            Chưa có giải đấu nào. Hãy tạo giải đấu đầu tiên!
          </div>
        )}
      </div>
    </div>
  );
}
