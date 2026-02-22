'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { onAuthChange, getUserData } from '@/lib/auth';
import { User } from '@/types';
import Navigation from '@/components/Navigation';
import { Award, Printer, CheckCircle, Circle, Edit3 } from 'lucide-react';
import { TASKS } from '@/lib/constants';

// Alle bestätigbaren Seiten-Inhalte
const PAGE_SECTIONS = [
  {
    key: 'was-ist-fobizz',
    title: 'Was ist Fobizz?',
    color: 'blue',
    confirmKeys: ['fobizz-q1', 'fobizz-q2', 'fobizz-q3', 'fobizz-q4'],
    confirmLabels: [
      'Fobizz als KI-Werkzeug & Autor/innen-Oberfläche verstanden',
      'Lernraum-Funktionsweise & Code-Zugang verstanden',
      'Lizenzsituation Kanton Zürich 2026/2027 bekannt',
      'Fobizz-Zugang geprüft',
    ],
  },
  {
    key: 'paedagogik',
    title: 'Pädagogik & Didaktik',
    color: 'violet',
    confirmKeys: ['paed-q1', 'paed-q2', 'paed-q3', 'paed-q4'],
    confirmLabels: [
      'Pädagogisch-didaktische Ausgangsfrage für Digitalität verstanden',
      'Grundmerkmale des Lernens benennen können',
      'Leistungsanforderungen an digitale Werkzeuge kennen',
      'Einsatzmöglichkeiten von Fobizz im eigenen Unterricht identifiziert',
    ],
  },
  {
    key: 'beispiele',
    title: 'Beispiele mit Fobizz',
    color: 'amber',
    confirmKeys: ['bsp-q1', 'bsp-q2', 'bsp-q3'],
    confirmLabels: [
      'Mindestens zwei Fobizz-Werkzeuge für ABU-Unterricht benannt',
      'Datenschutzkonforme KI-Tool-Bereitstellung via Lernraum verstanden',
      'Potenzial Lernende als Autor/innen erkannt',
    ],
  },
];

export default function ZertifikatPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

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

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-2xl text-gray-600">Lädt...</div></div>;
  if (!user) return null;

  // Aufgaben-Fortschritt berechnen
  const taskResults = TASKS.map(task => {
    const completedCount = task.subtasks.filter((_, i) =>
      user.completedSubtasks?.[`${task.id}-${i}`]
    ).length;
    const done = completedCount === task.subtasks.length;
    return { task, completedCount, done };
  });
  const completedTasks = taskResults.filter(r => r.done).length;
  const totalTasks = TASKS.length;

  // Seiten-Bestätigungsfortschritt
  const sectionResults = PAGE_SECTIONS.map(section => {
    const completedKeys = section.confirmKeys.filter(key =>
      user.completedSubtasks?.[key]
    );
    const done = completedKeys.length === section.confirmKeys.length;
    return { section, completedKeys, done };
  });
  const completedSections = sectionResults.filter(r => r.done).length;
  const totalSections = PAGE_SECTIONS.length;

  // Gesamtfortschritt
  const totalItems = totalTasks + totalSections;
  const completedItems = completedTasks + completedSections;
  const overallPct = Math.round((completedItems / totalItems) * 100);

  const today = new Date().toLocaleDateString('de-CH', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200', light: 'bg-blue-50' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-700', border: 'border-violet-200', light: 'bg-violet-50' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200', light: 'bg-amber-50' },
    green: { bg: 'bg-green-500', text: 'text-green-700', border: 'border-green-200', light: 'bg-green-50' },
  };

  return (
    <>
      {/* Print-Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: fixed; top: 0; left: 0; width: 100%; padding: 24px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 mb-6 no-print">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Abschluss</div>
                  <h1 className="text-2xl font-bold">Mein Lernzertifikat</h1>
                  <p className="text-gray-600 text-sm">Erfasst deinen aktuellen Stand – auch zwischendurch</p>
                </div>
              </div>
              <button
                onClick={handlePrint}
                className="no-print flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow"
              >
                <Printer className="w-5 h-5" />
                Zertifikat drucken / speichern
              </button>
            </div>
          </motion.div>

          <div className="no-print">
            <Navigation />
          </div>

          {/* Namensfeld */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6 mb-6 no-print">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <Edit3 className="w-4 h-4 inline mr-1" />
              Name für das Zertifikat
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Deinen Namen eingeben..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-lg font-semibold text-gray-800 bg-white/80"
            />
            <p className="text-xs text-gray-400 mt-2">Dieser Name erscheint nur auf dem Zertifikat und wird nicht gespeichert.</p>
          </motion.div>

          {/* ZERTIFIKAT (wird gedruckt) */}
          <div id="print-area" ref={printRef}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl overflow-hidden border-4 border-amber-200 shadow-2xl">

              {/* Zertifikat-Header */}
              <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 p-8 text-center">
                <div className="text-5xl mb-3">🏆</div>
                <div className="text-white text-xs font-bold uppercase tracking-[0.3em] mb-2">DLH – Digital Learning Hub Sek II</div>
                <h2 className="text-3xl font-bold text-white mb-1">Lernnachweis</h2>
                <div className="text-white/80 text-sm">Fobizz Weiterbildung – Pädagogisch-didaktische IKT im ABU</div>
              </div>

              {/* Name & Datum */}
              <div className="px-8 py-6 text-center border-b border-amber-100 bg-amber-50/50">
                <div className="text-gray-500 text-sm mb-1">Ausgestellt für</div>
                <div className="text-3xl font-bold text-gray-800 mb-3">
                  {name || <span className="text-gray-300 italic">– Name nicht eingetragen –</span>}
                </div>
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                  <span>📅 {today}</span>
                  <span className="font-bold text-amber-600 text-lg">{overallPct}% abgeschlossen</span>
                </div>

                {/* Gesamtfortschritt-Balken */}
                <div className="mt-4 max-w-md mx-auto">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${overallPct}%` }}
                      className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{completedItems} von {totalItems} Bereichen abgeschlossen</div>
                </div>
              </div>

              {/* Lernbereiche – Seiten-Bestätigungen */}
              <div className="px-8 py-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-4">📚 Lernbereiche</h3>
                <div className="space-y-4">
                  {sectionResults.map(({ section, completedKeys, done }) => {
                    const c = colorMap[section.color] || colorMap.blue;
                    return (
                      <div key={section.key} className={`rounded-xl border-2 ${c.border} ${c.light} p-4`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {done
                              ? <CheckCircle className={`w-5 h-5 ${c.text}`} />
                              : <Circle className="w-5 h-5 text-gray-300" />
                            }
                            <span className={`font-bold ${done ? c.text : 'text-gray-500'}`}>{section.title}</span>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${done ? `${c.light} ${c.text}` : 'bg-gray-100 text-gray-500'}`}>
                            {completedKeys.length}/{section.confirmKeys.length} bestätigt
                          </span>
                        </div>
                        <div className="space-y-1">
                          {section.confirmLabels.map((label, i) => {
                            const isDone = !!user.completedSubtasks?.[section.confirmKeys[i]];
                            return (
                              <div key={i} className={`flex items-start gap-2 text-xs ${isDone ? 'text-gray-700' : 'text-gray-400'}`}>
                                <span className="flex-shrink-0 mt-0.5">{isDone ? '✓' : '○'}</span>
                                <span className={isDone ? '' : 'line-through'}>{label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Aufgaben */}
              <div className="px-8 py-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-4">✅ Praktische Aufgaben</h3>
                <div className="space-y-3">
                  {taskResults.map(({ task, completedCount, done }) => {
                    const c = colorMap.green;
                    return (
                      <div key={task.id} className={`rounded-xl border-2 p-4 ${done ? `${c.border} ${c.light}` : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{task.iconEmoji}</span>
                            {done
                              ? <CheckCircle className={`w-5 h-5 ${c.text}`} />
                              : <Circle className="w-5 h-5 text-gray-300" />
                            }
                            <span className={`font-bold text-sm ${done ? c.text : 'text-gray-500'}`}>{task.title}</span>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${done ? `${c.light} ${c.text}` : 'bg-gray-100 text-gray-500'}`}>
                            {completedCount}/{task.subtasks.length}
                          </span>
                        </div>
                        <div className="space-y-1 ml-7">
                          {task.subtasks.map((subtask, i) => {
                            const isDone = !!user.completedSubtasks?.[`${task.id}-${i}`];
                            return (
                              <div key={i} className={`flex items-start gap-2 text-xs ${isDone ? 'text-gray-700' : 'text-gray-400'}`}>
                                <span className="flex-shrink-0 mt-0.5">{isDone ? '✓' : '○'}</span>
                                <span className={isDone ? '' : 'line-through'}>{subtask}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-amber-50/30 text-center">
                {overallPct === 100 ? (
                  <div>
                    <div className="text-3xl mb-2">🎉</div>
                    <p className="font-bold text-green-700 text-lg">Vollständig abgeschlossen!</p>
                    <p className="text-gray-500 text-sm mt-1">Alle Lernbereiche und Aufgaben wurden erfolgreich bearbeitet.</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 text-sm">
                      Dieser Nachweis erfasst den Stand vom <strong>{today}</strong>.
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Noch offen: {totalItems - completedItems} Bereiche – das Zertifikat kann jederzeit aktualisiert werden.
                    </p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-2">
                  <span className="text-xs text-gray-400">DLH – Digital Learning Hub Sek II · fobizz-weiterbildung.vercel.app</span>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </>
  );
}
