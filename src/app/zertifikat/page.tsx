'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { onAuthChange, getUserData } from '@/lib/auth';
import { updateUserSubtasks } from '@/lib/firestore';
import { User } from '@/types';
import Navigation from '@/components/Navigation';
import { Award, Printer, CheckCircle, Circle, Edit3 } from 'lucide-react';
import { TASKS } from '@/lib/constants';

// Nur Aufgaben-Keys zählen (Format: "1-0", "2-3", etc.)
function countTaskKeys(completedSubtasks: Record<string, string> | undefined): number {
  return Object.keys(completedSubtasks || {}).filter(k => /^\d+-\d+$/.test(k)).length;
}

const SECTION_CONFIRM_KEYS = [
  'fobizz-q1', 'fobizz-q2', 'fobizz-q3', 'fobizz-q4',
  'paed-q1', 'paed-q2', 'paed-q3', 'paed-q4',
  'bsp-q1', 'bsp-q2', 'bsp-q3',
];

const PAGE_SECTIONS = [
  {
    key: 'was-ist-fobizz',
    emoji: '🎓',
    title: 'Was ist Fobizz?',
    confirmKeys: ['fobizz-q1', 'fobizz-q2', 'fobizz-q3', 'fobizz-q4'],
  },
  {
    key: 'paedagogik',
    emoji: '📚',
    title: 'Pädagogik & Didaktik',
    confirmKeys: ['paed-q1', 'paed-q2', 'paed-q3', 'paed-q4'],
  },
  {
    key: 'beispiele',
    emoji: '🛠️',
    title: 'Beispiele mit Fobizz',
    confirmKeys: ['bsp-q1', 'bsp-q2', 'bsp-q3'],
  },
];

export default function ZertifikatPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  const handlePrint = async () => {
    if (user && !user.completedSubtasks?.['cert-issued']) {
      const updated = { ...(user.completedSubtasks || {}), 'cert-issued': new Date().toISOString() };
      await updateUserSubtasks(user.userId, updated);
      setUser({ ...user, completedSubtasks: updated });
    }
    window.print();
  };

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (!currentUser) { router.push('/login'); return; }
      const userData = await getUserData(currentUser.uid);
      if (userData) {
        setUser(userData);
        setName(userData.username || '');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl text-gray-600">Lädt...</div>
    </div>
  );
  if (!user) return null;

  // Lernbereiche
  const sectionResults = PAGE_SECTIONS.map(section => {
    const done = section.confirmKeys.filter(k => user.completedSubtasks?.[k]).length;
    const total = section.confirmKeys.length;
    return { ...section, done, total, completed: done === total };
  });

  // Aufgaben
  const taskResults = TASKS.map(task => {
    const done = task.subtasks.filter((_, i) => user.completedSubtasks?.[`${task.id}-${i}`]).length;
    const total = task.subtasks.length;
    return { task, done, total, completed: done === total };
  });

  // Gesamtfortschritt: gleiche Berechnung wie Dashboard
  const totalSubtasks = TASKS.reduce((acc, task) => acc + task.subtasks.length, 0);
  const totalAll = totalSubtasks + SECTION_CONFIRM_KEYS.length;
  const completedSubtasksCount = countTaskKeys(user.completedSubtasks);
  const completedSectionCount = SECTION_CONFIRM_KEYS.filter(k => user.completedSubtasks?.[k]).length;
  const overallPct = totalAll > 0 ? Math.round(((completedSubtasksCount + completedSectionCount) / totalAll) * 100) : 0;

  // Für Anzeige im Footer
  const totalSectionsAndTasks = sectionResults.length + taskResults.length;
  const completedSectionsAndTasks = sectionResults.filter(r => r.completed).length + taskResults.filter(r => r.completed).length;

  const today = new Date().toLocaleDateString('de-CH', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #cert, #cert * { visibility: visible; }
          #cert { position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen p-4">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-5 mb-4 no-print">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Mein Lernzertifikat</h1>
                  <p className="text-gray-500 text-xs">Erfasst deinen aktuellen Lernstand</p>
                </div>
              </div>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow text-sm"
              >
                <Printer className="w-4 h-4" />
                Drucken / Speichern
              </button>
            </div>
          </motion.div>

          <div className="no-print mb-4">
            <Navigation />
          </div>

          {/* Namensfeld */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-4 mb-5 no-print">
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              <Edit3 className="w-3.5 h-3.5 inline mr-1" />
              Name für das Zertifikat
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Deinen Namen eingeben..."
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-base font-semibold text-gray-800 bg-white/80"
            />
          </motion.div>

          {/* ZERTIFIKAT */}
          <div id="cert">
            <div className="bg-white rounded-2xl overflow-hidden border-2 border-amber-200 shadow-xl">

              {/* Gold Header */}
              <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 px-8 py-5 text-center">
                <div className="text-4xl mb-1">🏆</div>
                <div className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-1">DLH – Digital Learning Hub Sek II</div>
                <h2 className="text-2xl font-bold text-white">Lernnachweis</h2>
                <div className="text-white/80 text-xs mt-0.5">Fobizz Weiterbildung – Pädagogisch-didaktische IKT im ABU</div>
              </div>

              {/* Name & Datum & Fortschritt */}
              <div className="px-8 py-4 border-b border-amber-100 bg-amber-50/40 text-center">
                <div className="text-gray-400 text-xs mb-0.5">Ausgestellt für</div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {name || <span className="text-gray-300 italic text-lg">– Name nicht eingetragen –</span>}
                </div>
                <div className="flex items-center justify-center gap-5 text-sm text-gray-600 mb-3">
                  <span>📅 {today}</span>
                  <span className="font-bold text-amber-600 text-base">{overallPct}% abgeschlossen</span>
                </div>
                {/* Fortschrittsbalken */}
                <div className="max-w-xs mx-auto">
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${overallPct}%` }}
                      className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">{completedSubtasksCount + completedSectionCount} von {totalAll} Einheiten erledigt</div>
                </div>
              </div>

              {/* 2-Spalten: Lernbereiche links, Aufgaben rechts */}
              <div className="grid grid-cols-2 gap-0 divide-x divide-gray-100">

                {/* Lernbereiche */}
                <div className="px-6 py-4">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">📚 Lernbereiche</h3>
                  <div className="space-y-2.5">
                    {sectionResults.map(s => (
                      <div key={s.key} className={`flex items-center gap-2.5 p-2.5 rounded-lg ${s.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                        {s.completed
                          ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          : <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        }
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-semibold truncate ${s.completed ? 'text-gray-800' : 'text-gray-500'}`}>
                            {s.emoji} {s.title}
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${s.completed ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                          {s.done}/{s.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Aufgaben */}
                <div className="px-6 py-4">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">✅ Praktische Aufgaben</h3>
                  <div className="space-y-2.5">
                    {taskResults.map(({ task, done, total, completed }) => (
                      <div key={task.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg ${completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                        {completed
                          ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          : <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        }
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-semibold truncate ${completed ? 'text-gray-800' : 'text-gray-500'}`}>
                            {task.iconEmoji} {task.title}
                          </div>
                          {/* Mini progress bar */}
                          <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.round((done / total) * 100)}%` }}
                              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                            />
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${completed ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                          {done}/{total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-3 bg-gray-50 border-t border-gray-100 text-center">
                {overallPct === 100 ? (
                  <p className="font-bold text-green-700 text-sm">🎉 Vollständig abgeschlossen – alle Bereiche bearbeitet!</p>
                ) : (
                  <p className="text-gray-500 text-xs">
                    Lernnachweis vom <strong>{today}</strong> · noch offen: {totalSectionsAndTasks - completedSectionsAndTasks} Bereiche
                  </p>
                )}
                <div className="mt-1 text-[10px] text-gray-400">
                  DLH – Digital Learning Hub Sek II · fobizz-weiterbildung.vercel.app
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}
