'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { onAuthChange, getUserData } from '@/lib/auth';
import { updateUserSubtasks, updateUserRatings } from '@/lib/firestore';
import { User, TaskRating } from '@/types';
import { TASKS, RATING_QUESTIONS, RATING_OPTIONS } from '@/lib/constants';
import Navigation from '@/components/Navigation';
import { CheckSquare, ExternalLink } from 'lucide-react';

export default function AufgabenPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState<number | null>(null);
  const [tempRating, setTempRating] = useState<Record<string, number>>({});

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (!currentUser) { router.push('/login'); return; }
      const userData = await getUserData(currentUser.uid);
      if (userData) setUser(userData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const toggleSubtask = async (taskId: number, subtaskIndex: number) => {
    if (!user) return;
    const key = `${taskId}-${subtaskIndex}`;
    const newSubtasks = { ...user.completedSubtasks };
    if (newSubtasks[key]) {
      delete newSubtasks[key];
    } else {
      newSubtasks[key] = new Date().toISOString();
    }
    setUser({ ...user, completedSubtasks: newSubtasks });
    await updateUserSubtasks(user.userId, newSubtasks);

    const task = TASKS.find(t => t.id === taskId);
    if (task) {
      const allCompleted = task.subtasks.every((_, i) => newSubtasks[`${taskId}-${i}`]);
      if (allCompleted && !user.ratings[taskId]) {
        setTimeout(() => { setShowRatingModal(taskId); setTempRating({}); }, 300);
      }
    }
  };

  const submitRating = async () => {
    if (!user || showRatingModal === null) return;
    const ratingData: TaskRating = {
      enjoyed: tempRating['enjoyed'] ?? 0,
      useful: tempRating['useful'] ?? 0,
      learned: tempRating['learned'] ?? 0,
      timestamp: new Date().toISOString()
    };
    const newRatings = { ...user.ratings, [showRatingModal]: ratingData };
    setUser({ ...user, ratings: newRatings });
    await updateUserRatings(user.userId, newRatings);
    setShowRatingModal(null);
    setTempRating({});
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-2xl text-gray-600">Lädt...</div></div>;
  if (!user) return null;

  const totalSubtasks = TASKS.reduce((acc, task) => acc + task.subtasks.length, 0);
  const completedCount = Object.keys(user.completedSubtasks || {}).length;
  const progress = Math.round((completedCount / totalSubtasks) * 100);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-accent-600 rounded-xl flex items-center justify-center">
                <CheckSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Seite 4</div>
                <h1 className="text-2xl font-bold">Deine Aufgaben</h1>
                <p className="text-gray-600">Umsetzungsbeispiele selber erstellen – Schritt für Schritt</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold gradient-text">{progress}%</div>
              <div className="text-xs text-gray-500">{completedCount}/{totalSubtasks} abgehakt</div>
            </div>
          </div>

          {/* Fortschrittsbalken */}
          <div className="mt-4">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-green-500 to-accent-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        <Navigation />

        {/* Aufgabenliste */}
        <div className="space-y-5">
          {TASKS.map((task, idx) => {
            const taskCompleted = task.subtasks.every((_, i) => user.completedSubtasks[`${task.id}-${i}`]);
            const taskSubtasksDone = task.subtasks.filter((_, i) => user.completedSubtasks[`${task.id}-${i}`]).length;

            return (
              <motion.div key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className={`glass-card rounded-2xl p-6 ${taskCompleted ? 'ring-2 ring-green-500' : ''}`}>

                {/* Task Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl flex-shrink-0">{task.iconEmoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-xl font-bold text-gray-800">
                        {idx + 1}. {task.title}
                      </h3>
                      {taskCompleted && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                          ✓ Abgeschlossen
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-500">
                        {taskSubtasksDone} / {task.subtasks.length} abgehakt
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subtasks */}
                <div className="space-y-2">
                  {task.subtasks.map((subtask, subIdx) => {
                    const isCompleted = !!user.completedSubtasks[`${task.id}-${subIdx}`];
                    return (
                      <label key={subIdx}
                        className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                          isCompleted
                            ? 'bg-green-50 border-2 border-green-300'
                            : 'bg-white/70 hover:bg-white border-2 border-transparent hover:border-gray-200'
                        }`}>
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={() => toggleSubtask(task.id, subIdx)}
                          className="w-5 h-5 mt-0.5 cursor-pointer accent-green-600"
                        />
                        <span className={`flex-1 ${isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {subtask}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Externe Links */}
                {(task.whiteboardUrl || task.padletUrl || task.pdfId) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3 flex-wrap">
                    {task.pdfId && (
                      <span className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                        <ExternalLink className="w-4 h-4" />
                        PDF-Anleitung (wird vom Admin hochgeladen)
                      </span>
                    )}
                    {task.whiteboardUrl && (
                      <a href={task.whiteboardUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold">
                        <ExternalLink className="w-4 h-4" />
                        Whiteboard öffnen
                      </a>
                    )}
                    {task.padletUrl && (
                      <a href={task.padletUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm font-semibold">
                        <ExternalLink className="w-4 h-4" />
                        Padlet öffnen
                      </a>
                    )}
                  </div>
                )}

                {/* Bewertungsanzeige */}
                {user.ratings[task.id] && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="font-semibold mb-2 text-sm text-gray-700">✅ Deine Bewertung:</p>
                    <div className="flex gap-4 text-sm flex-wrap">
                      {RATING_QUESTIONS.map(q => {
                        const rating = user.ratings[task.id]?.[q.id];
                        const option = RATING_OPTIONS.find(opt => opt.value === rating);
                        return option ? (
                          <span key={q.id} className="flex items-center gap-1">
                            <span>{q.emoji}</span>
                            <span>{option.emoji}</span>
                            <span className="text-gray-600">{option.label}</span>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bewertungs-Modal */}
        {showRatingModal !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowRatingModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-2">🎉 Aufgabe abgeschlossen!</h2>
              <p className="text-gray-600 mb-6">
                {TASKS.find(t => t.id === showRatingModal)?.title}
              </p>

              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Hinweis:</strong> Deine Bewertungen werden anonymisiert in der Statistik angezeigt.
                </p>
              </div>

              <div className="space-y-6">
                {RATING_QUESTIONS.map(q => (
                  <div key={q.id}>
                    <label className="block font-semibold mb-3 text-gray-800">
                      {q.emoji} {q.label}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {RATING_OPTIONS.map(opt => (
                        <button key={opt.value}
                          onClick={() => setTempRating({ ...tempRating, [q.id]: opt.value })}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            tempRating[q.id] === opt.value
                              ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}>
                          <div className="text-3xl mb-2">{opt.emoji}</div>
                          <div className="text-sm font-semibold">{opt.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowRatingModal(null)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                  Überspringen
                </button>
                <button onClick={submitRating}
                  disabled={Object.keys(tempRating).length === 0}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                  Speichern
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
