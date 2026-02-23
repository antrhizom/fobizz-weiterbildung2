'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { onAuthChange, checkIsAdmin } from '@/lib/auth';
import { getAllUsers, deleteUser, resetUserProgress, exportAllData } from '@/lib/firestore';
import { User } from '@/types';
import { TASKS, RATING_QUESTIONS } from '@/lib/constants';
import Navigation from '@/components/Navigation';
import { Shield, Users, Trash2, RotateCcw, Download, TrendingUp, Star } from 'lucide-react';

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

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`User "${username}" wirklich löschen?`)) return;
    try { await deleteUser(userId); setAllUsers(await getAllUsers()); }
    catch { alert('Fehler beim Löschen'); }
  };

  const handleResetUser = async (userId: string, username: string) => {
    if (!confirm(`Fortschritt von "${username}" zurücksetzen?`)) return;
    try { await resetUserProgress(userId); setAllUsers(await getAllUsers()); }
    catch { alert('Fehler beim Zurücksetzen'); }
  };

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

  // Zertifikate: User mit gesetztem cert-issued Key
  const certificatesIssued = allUsers.filter(u => u.completedSubtasks?.['cert-issued']).length;

  // ≥50% Fortschritt
  const halfwayCount = allUsers.filter(u => userProgress(u) >= 50).length;

  // Einzigartige Gruppen (aus to-teach Users)
  const allGroups = Array.from(new Set(allUsers.map(u => u.group).filter(Boolean))) as string[];

  // Aufgaben-Statistik: Gesamt + pro Gruppe + Ratings
  const taskStats = TASKS.map(task => {
    // Gesamt-Abschluss
    const completedAll = allUsers.filter(u =>
      task.subtasks.every((_, i) => u.completedSubtasks?.[`${task.id}-${i}`])
    ).length;

    // Pro Gruppe
    const byGroup = allGroups.map(group => {
      const groupUsers = allUsers.filter(u => u.group === group);
      const completed = groupUsers.filter(u =>
        task.subtasks.every((_, i) => u.completedSubtasks?.[`${task.id}-${i}`])
      ).length;
      return {
        group,
        count: groupUsers.length,
        completed,
        pct: groupUsers.length > 0 ? Math.round((completed / groupUsers.length) * 100) : 0,
      };
    });

    // Ratings
    const rated = allUsers.filter(u => u.ratings?.[task.id]);
    const avgRating = (key: 'enjoyed' | 'useful' | 'learned') =>
      rated.length > 0
        ? Math.round(rated.reduce((a, u) => a + (u.ratings[task.id]?.[key] ?? 0), 0) / rated.length * 10) / 10
        : null;

    return {
      task,
      completedAll,
      pctAll: totalParticipants > 0 ? Math.round((completedAll / totalParticipants) * 100) : 0,
      byGroup,
      ratingCount: rated.length,
      enjoyed: avgRating('enjoyed'),
      useful: avgRating('useful'),
      learned: avgRating('learned'),
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
              <p className="text-gray-600">Fobizz Weiterbildung – Verwaltung & Übersicht</p>
            </div>
          </div>
        </motion.div>

        <Navigation />

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="glass-card rounded-2xl p-6 text-center">
            <Users className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <div className="text-4xl font-bold gradient-text mb-1">{totalParticipants}</div>
            <div className="text-gray-600 text-sm">Teilnehmende gesamt</div>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">🏆</div>
            <div className="text-4xl font-bold gradient-text mb-1">{certificatesIssued}</div>
            <div className="text-gray-600 text-sm">Ausgestellte Zertifikate</div>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <div className="text-4xl font-bold gradient-text mb-1">{halfwayCount}</div>
            <div className="text-gray-600 text-sm">Teilnehmende mit ≥50% erledigt</div>
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

        {/* Aufgaben-Auswertung: immer offen */}
        <div className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-primary-600" />
            Aufgaben-Auswertung
          </h2>
          <div className="space-y-6">
            {taskStats.map(({ task, completedAll, pctAll, byGroup, ratingCount, enjoyed, useful, learned }) => (
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

                {/* Gruppen-Aufschlüsselung */}
                {allGroups.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Nach Gruppe
                    </h4>
                    <div className="space-y-1.5">
                      {byGroup.map(g => (
                        <div key={g.group} className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-gray-600 w-24 truncate capitalize">{g.group}</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div style={{ width: `${g.pct}%` }}
                              className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full" />
                          </div>
                          <span className="text-xs font-bold text-gray-600 w-20 text-right">
                            {g.completed}/{g.count} ({g.pct}%)
                          </span>
                        </div>
                      ))}
                      {/* Ohne Gruppe */}
                      {(() => {
                        const noGroup = allUsers.filter(u => !u.group);
                        if (noGroup.length === 0) return null;
                        const completed = noGroup.filter(u =>
                          task.subtasks.every((_, i) => u.completedSubtasks?.[`${task.id}-${i}`])
                        ).length;
                        const pct = Math.round(completed / noGroup.length * 100);
                        return (
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-gray-400 w-24">Ohne Gruppe</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div style={{ width: `${pct}%` }}
                                className="h-full bg-gray-400 rounded-full" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 w-20 text-right">
                              {completed}/{noGroup.length} ({pct}%)
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>

        {/* Benutzerverwaltung */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">Benutzerverwaltung</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold">Name</th>
                  <th className="text-left py-4 px-4 font-semibold">Gruppe</th>
                  <th className="text-left py-4 px-4 font-semibold">Code</th>
                  <th className="text-left py-4 px-4 font-semibold">Fortschritt</th>
                  <th className="text-left py-4 px-4 font-semibold">Zertifikat</th>
                  <th className="text-right py-4 px-4 font-semibold">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map(user => {
                  const pct = userProgress(user);
                  const hasCert = !!user.completedSubtasks?.['cert-issued'];
                  return (
                    <tr key={user.userId} className="border-b border-gray-100 hover:bg-white/50">
                      <td className="py-3 px-4 font-medium">{user.username}</td>
                      <td className="py-3 px-4">
                        {user.group
                          ? <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full capitalize">{user.group}</span>
                          : <span className="text-xs text-gray-300">–</span>
                        }
                      </td>
                      <td className="py-3 px-4">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">{user.code}</code>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-[100px]">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div style={{ width: `${pct}%` }}
                                className="h-full bg-gradient-to-r from-primary-500 to-accent-500" />
                            </div>
                          </div>
                          <span className="font-semibold text-sm">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {hasCert
                          ? <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">🏆 erstellt</span>
                          : <span className="text-xs text-gray-300">–</span>
                        }
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleResetUser(user.userId, user.username)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Fortschritt zurücksetzen">
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteUser(user.userId, user.username)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="User löschen">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {allUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Noch keine Teilnehmenden registriert</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
