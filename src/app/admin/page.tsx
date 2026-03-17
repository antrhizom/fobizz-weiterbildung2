'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { onAuthChange, checkIsAdmin } from '@/lib/auth';
import { getAllUsers, exportAllData } from '@/lib/firestore';
import { User } from '@/types';
import { TASKS, RATING_QUESTIONS } from '@/lib/constants';
import Navigation from '@/components/Navigation';
import { Shield, Users, Download, TrendingUp, Star } from 'lucide-react';

// Nur Aufgaben-Keys (Format: "1-0", "2-3")
function countTaskKeys(subs: Record<string, string> | undefined): number {
  return Object.keys(subs || {}).filter(k => /^\d+-\d+$/.test(k)).length;
}

const SECTION_CONFIRM_KEYS = [
  'fobizz-q1', 'fobizz-q2', 'fobizz-q3', 'fobizz-q4',
  'paed-q1', 'paed-q2', 'paed-q3', 'paed-q4',
  'bsp-q1', 'bsp-q2', 'bsp-q3',
];

const TOTAL_SUBTASKS = TASKS.reduce((acc, task) => acc + task.subtasks.length, 0);
const TOTAL_ALL = TOTAL_SUBTASKS + SECTION_CONFIRM_KEYS.length;

function userProgress(u: User): number {
  const taskDone = countTaskKeys(u.completedSubtasks);
  const sectionDone = SECTION_CONFIRM_KEYS.filter(k => u.completedSubtasks?.[k]).length;
  return Math.min(Math.round(((taskDone + sectionDone) / TOTAL_ALL) * 100), 100);
}


export default function AdminPage() {
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (!currentUser) { router.push('/login?mode=admin'); return; }
      const adminStatus = await checkIsAdmin();
      if (!adminStatus) { alert('Keine Admin-Berechtigung!'); router.push('/'); return; }
      setIsAdmin(true);
      try {
        setAllUsers(await getAllUsers());
      } catch (e: any) {
        setLoadError('Fehler beim Laden: ' + (e?.message || String(e)));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fobizz-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch { alert('Fehler beim Export'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-2xl text-gray-600">Lädt Admin-Dashboard...</div></div>;
  if (!isAdmin) return null;
  if (loadError) return <div className="min-h-screen flex items-center justify-center"><div className="text-red-600 text-lg p-8 text-center">{loadError}</div></div>;

  const totalParticipants = allUsers.length;
  const certificatesIssued = allUsers.filter(u => u.completedSubtasks?.['cert-issued']).length;
  const halfwayCount = allUsers.filter(u => userProgress(u) >= 50).length;
  const completedCount = allUsers.filter(u => userProgress(u) === 100).length;

  // Durchschnittlicher Fortschritt
  const avgProgress = totalParticipants > 0
    ? Math.round(allUsers.reduce((acc, u) => acc + userProgress(u), 0) / totalParticipants)
    : 0;

  // Fortschritts-Verteilung
  const progressBuckets = [
    { label: '0–25%', count: allUsers.filter(u => userProgress(u) <= 25).length, color: 'bg-red-400' },
    { label: '26–50%', count: allUsers.filter(u => { const p = userProgress(u); return p > 25 && p <= 50; }).length, color: 'bg-orange-400' },
    { label: '51–75%', count: allUsers.filter(u => { const p = userProgress(u); return p > 50 && p <= 75; }).length, color: 'bg-yellow-400' },
    { label: '76–100%', count: allUsers.filter(u => userProgress(u) > 75).length, color: 'bg-green-400' },
  ];

  // Aufgaben-Statistik mit Ratings (ohne Gruppen)
  const taskStats = TASKS.map(task => {
    const completedAll = allUsers.filter(u =>
      task.subtasks.every((_, i) => u.completedSubtasks?.[`${task.id}-${i}`])
    ).length;

    const rated = allUsers.filter(u => u.ratings?.[task.id]);
    const avgRating = (key: 'enjoyed' | 'useful' | 'learned') =>
      rated.length > 0
        ? Math.round(rated.reduce((a, u) => a + (u.ratings[task.id]?.[key] ?? 0), 0) / rated.length * 10) / 10
        : null;

    // Anonymisierte Rückmeldungen (ohne Nutzernamen)
    const comments = allUsers
      .filter(u => u.ratings?.[task.id]?.comment)
      .map(u => ({ text: u.ratings[task.id].comment!, date: u.ratings[task.id].timestamp }));

    return {
      task,
      completedAll,
      pctAll: totalParticipants > 0 ? Math.round((completedAll / totalParticipants) * 100) : 0,
      ratingCount: rated.length,
      enjoyed: avgRating('enjoyed'),
      useful: avgRating('useful'),
      learned: avgRating('learned'),
      comments,
    };
  });

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <Shield className="w-10 h-10 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600">Fobizz Weiterbildung – Anonymisierte Übersicht</p>
            </div>
          </div>
        </motion.div>

        <Navigation />

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card rounded-2xl p-6 text-center">
            <Users className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <div className="text-4xl font-bold gradient-text mb-1">{totalParticipants}</div>
            <div className="text-gray-600 text-sm">Teilnehmende</div>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">📊</div>
            <div className="text-4xl font-bold gradient-text mb-1">{avgProgress}%</div>
            <div className="text-gray-600 text-sm">Ø Fortschritt</div>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <div className="text-4xl font-bold gradient-text mb-1">{completedCount}</div>
            <div className="text-gray-600 text-sm">100% abgeschlossen</div>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">🏆</div>
            <div className="text-4xl font-bold gradient-text mb-1">{certificatesIssued}</div>
            <div className="text-gray-600 text-sm">Zertifikate erstellt</div>
          </div>
        </div>

        {/* Fortschritts-Verteilung */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Fortschritts-Verteilung</h2>
          <div className="grid grid-cols-4 gap-4">
            {progressBuckets.map(b => (
              <div key={b.label} className="text-center">
                <div className="text-sm font-semibold text-gray-600 mb-2">{b.label}</div>
                <div className="relative h-32 flex items-end justify-center">
                  <div
                    className={`w-16 ${b.color} rounded-t-lg transition-all`}
                    style={{ height: `${totalParticipants > 0 ? Math.max((b.count / totalParticipants) * 100, 4) : 4}%` }}
                  />
                </div>
                <div className="text-lg font-bold mt-2">{b.count}</div>
                <div className="text-xs text-gray-500">
                  {totalParticipants > 0 ? Math.round((b.count / totalParticipants) * 100) : 0}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aktionen */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Aktionen</h2>
          <button onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">
            <Download className="w-5 h-5" />
            Alle Daten exportieren (JSON)
          </button>
        </div>

        {/* Aufgaben-Auswertung */}
        <div className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-primary-600" />
            Aufgaben-Auswertung
          </h2>
          <div className="space-y-6">
            {taskStats.map(({ task, completedAll, pctAll, ratingCount, enjoyed, useful, learned, comments }) => (
              <div key={task.id} className="bg-white/60 rounded-xl border border-gray-100 p-5">

                {/* Aufgaben-Kopf + Fortschrittsbalken */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{task.iconEmoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800 text-sm">{task.title}</span>
                      <span className="text-sm font-bold text-primary-600">
                        {completedAll}/{totalParticipants} ({pctAll}%)
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div style={{ width: `${pctAll}%` }}
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Bewertungen */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Star className="w-3 h-3" /> Bewertungen ({ratingCount} von {totalParticipants})
                  </h4>
                  {ratingCount === 0 ? (
                    <p className="text-sm text-gray-400 italic">Noch keine Bewertungen eingegangen</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {RATING_QUESTIONS.map(q => {
                        const val = q.id === 'enjoyed' ? enjoyed : q.id === 'useful' ? useful : learned;
                        return (
                          <div key={q.id} className="bg-white rounded-lg p-3 text-center border border-gray-100">
                            <div className="text-2xl mb-1">{q.emoji}</div>
                            <div className="text-xs text-gray-500 mb-1">{q.label}</div>
                            <div className="text-amber-500 text-sm font-bold">
                              {val !== null ? (
                                <>{'★'.repeat(Math.round(val))}{'☆'.repeat(3 - Math.round(val))}</>
                              ) : '–'}
                            </div>
                            <div className="text-xs text-gray-500">{val !== null ? `${val.toFixed(1)} / 3` : ''}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Anonymisierte Rückmeldungen (ohne Namen) */}
                {comments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      💬 Rückmeldungen ({comments.length})
                    </h4>
                    <div className="space-y-2">
                      {comments.map((c, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 border border-gray-100 text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-400">Teilnehmer/in</span>
                            <span className="text-xs text-gray-400">{new Date(c.date).toLocaleDateString('de-CH')}</span>
                          </div>
                          <p className="text-gray-600 italic">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
