'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getCurrentUser, checkIsAdmin } from '@/lib/auth';
import { getAllUsers, deleteUser, resetUserProgress, exportAllData } from '@/lib/firestore';
import { User } from '@/types';
import { TASKS } from '@/lib/constants';
import Navigation from '@/components/Navigation';
import { Shield, Users, Trash2, RotateCcw, Download, TrendingUp } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) { router.push('/login?mode=admin'); return; }
      const adminStatus = await checkIsAdmin();
      if (!adminStatus) { alert('Keine Admin-Berechtigung!'); router.push('/'); return; }
      setIsAdmin(true);
      const users = await getAllUsers();
      setAllUsers(users);
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`User "${username}" wirklich löschen?`)) return;
    try {
      await deleteUser(userId);
      setAllUsers(await getAllUsers());
    } catch { alert('Fehler beim Löschen'); }
  };

  const handleResetUser = async (userId: string, username: string) => {
    if (!confirm(`Fortschritt von "${username}" zurücksetzen?`)) return;
    try {
      await resetUserProgress(userId);
      setAllUsers(await getAllUsers());
    } catch { alert('Fehler beim Zurücksetzen'); }
  };

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fobizz-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { alert('Fehler beim Export'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-2xl text-gray-600">Lädt Admin-Dashboard...</div></div>;
  if (!isAdmin) return null;

  const totalSubtasks = TASKS.reduce((acc, task) => acc + task.subtasks.length, 0);

  // Durchschnittsfortschritt
  const avgProgress = allUsers.length > 0
    ? Math.round(allUsers.reduce((acc, u) => {
        const done = Object.keys(u.completedSubtasks || {}).length;
        return acc + (done / totalSubtasks) * 100;
      }, 0) / allUsers.length)
    : 0;

  // Aufgaben-Abschlussquoten
  const taskStats = TASKS.map(task => {
    const completed = allUsers.filter(u =>
      task.subtasks.every((_, i) => u.completedSubtasks?.[`${task.id}-${i}`])
    ).length;
    return { task, completed, pct: allUsers.length > 0 ? Math.round((completed / allUsers.length) * 100) : 0 };
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
            <div className="text-4xl font-bold gradient-text mb-1">{allUsers.length}</div>
            <div className="text-gray-600 text-sm">Teilnehmende gesamt</div>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <TrendingUp className="w-8 h-8 text-accent-600 mx-auto mb-3" />
            <div className="text-4xl font-bold gradient-text mb-1">{avgProgress}%</div>
            <div className="text-gray-600 text-sm">Ø Fortschritt</div>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <div className="text-4xl font-bold gradient-text mb-1">
              {taskStats.filter(t => t.pct >= 50).length}
            </div>
            <div className="text-gray-600 text-sm">Aufgaben von ≥50% abgeschlossen</div>
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

        {/* Aufgaben-Fortschritt */}
        <div className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-primary-600" />
            Fortschritt nach Aufgabe
          </h2>
          <div className="space-y-4">
            {taskStats.map(({ task, completed, pct }, idx) => (
              <div key={task.id} className="bg-white/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{task.iconEmoji}</span>
                    <span className="font-semibold text-gray-800 text-sm">{idx + 1}. {task.title}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-700">{completed}/{allUsers.length} ({pct}%)</span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div style={{ width: `${pct}%` }}
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all" />
                </div>
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
                  <th className="text-left py-4 px-4 font-semibold">Code</th>
                  <th className="text-left py-4 px-4 font-semibold">Fortschritt</th>
                  <th className="text-left py-4 px-4 font-semibold">Registriert</th>
                  <th className="text-right py-4 px-4 font-semibold">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map(user => {
                  const done = Object.keys(user.completedSubtasks || {}).length;
                  const pct = Math.round((done / totalSubtasks) * 100);
                  return (
                    <tr key={user.userId} className="border-b border-gray-100 hover:bg-white/50">
                      <td className="py-4 px-4 font-medium">{user.username}</td>
                      <td className="py-4 px-4">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">{user.code}</code>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-[120px]">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div style={{ width: `${pct}%` }}
                                className="h-full bg-gradient-to-r from-primary-500 to-accent-500" />
                            </div>
                          </div>
                          <span className="font-semibold text-sm">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="py-4 px-4">
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
