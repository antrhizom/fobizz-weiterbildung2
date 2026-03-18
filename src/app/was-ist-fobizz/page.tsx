'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthChange, getUserData, logout } from '@/lib/auth';
import { updateUserSubtasks } from '@/lib/firestore';
import { User } from '@/types';
import Navigation from '@/components/Navigation';
import { GraduationCap, Shield, Wrench, Users, CheckCircle, Circle, ChevronDown, ExternalLink, Eye, EyeOff } from 'lucide-react';

// Gesamtzahl der interaktiven Aktionen (4 Accordion + 4 Reveal + 3 Quiz = 11)
const TOTAL_ACTIONS = 11;
const UNLOCK_THRESHOLD = 0.8; // 80%

export default function WasIstFobizzPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [openedAccordions, setOpenedAccordions] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<Record<string, boolean | null>>({});

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (!currentUser) { router.push('/login'); return; }
      const userData = await getUserData(currentUser.uid);
      if (!userData) { await logout(); router.push('/login'); return; }
      if (userData) {
        setUser(userData);
        const subs = userData.completedSubtasks || {};

        // Bestätigungs-Checkboxen
        const existing: Record<string, boolean> = {};
        for (const key of confirmItems.map(q => q.key)) {
          if (subs[key]) existing[key] = true;
        }
        setChecked(existing);

        // Aktivitäten wiederherstellen (80%-Gate)
        const restoredAccordions = new Set<string>();
        accordionItems.forEach(item => {
          if (subs[`wif-acc-${item.id}`]) restoredAccordions.add(item.id);
        });
        setOpenedAccordions(restoredAccordions);

        const restoredRevealed: Record<string, boolean> = {};
        revealCards.forEach(card => {
          if (subs[`wif-rev-${card.id}`]) restoredRevealed[card.id] = true;
        });
        setRevealed(restoredRevealed);

        const restoredQuiz: Record<string, string> = {};
        const restoredResults: Record<string, boolean | null> = {};
        quizQuestions.forEach(q => {
          const savedAnswer = subs[`wif-quiz-${q.key}`];
          if (savedAnswer) {
            restoredQuiz[q.key] = savedAnswer;
            restoredResults[q.key] = savedAnswer === q.correct;
          }
        });
        setQuizAnswers(restoredQuiz);
        setQuizResults(restoredResults);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleCheck = async (key: string) => {
    if (!user) return;
    const newChecked = { ...checked, [key]: !checked[key] };
    setChecked(newChecked);
    setSaving(true);
    try {
      const updated = { ...(user.completedSubtasks || {}) };
      if (newChecked[key]) {
        updated[key] = new Date().toISOString();
      } else {
        delete updated[key];
      }
      await updateUserSubtasks(user.userId, updated);
      setUser({ ...user, completedSubtasks: updated });
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const persistActivity = async (key: string, value: string) => {
    if (!user) return;
    const updated = { ...(user.completedSubtasks || {}), [key]: value };
    await updateUserSubtasks(user.userId, updated);
    setUser({ ...user, completedSubtasks: updated });
  };

  const handleQuizAnswer = async (qKey: string, answer: string, correct: string) => {
    setQuizAnswers({ ...quizAnswers, [qKey]: answer });
    setQuizResults({ ...quizResults, [qKey]: answer === correct });
    await persistActivity(`wif-quiz-${qKey}`, answer);
  };

  const handleAccordionToggle = async (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
    if (!openedAccordions.has(id)) {
      setOpenedAccordions(prev => new Set(prev).add(id));
      await persistActivity(`wif-acc-${id}`, 'opened');
    }
  };

  const handleReveal = async (cardId: string) => {
    const newRevealed = { ...revealed, [cardId]: !revealed[cardId] };
    setRevealed(newRevealed);
    if (!revealed[cardId]) {
      await persistActivity(`wif-rev-${cardId}`, 'revealed');
    }
  };

  // Fortschritt der Interaktionen berechnen
  const completedActions =
    openedAccordions.size +
    Object.values(revealed).filter(Boolean).length +
    Object.keys(quizAnswers).length;
  const activityProgress = Math.round((completedActions / TOTAL_ACTIONS) * 100);
  const confirmUnlocked = completedActions / TOTAL_ACTIONS >= UNLOCK_THRESHOLD;

  const allChecked = confirmItems.every(q => checked[q.key]);
  const checkedCount = confirmItems.filter(q => checked[q.key]).length;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-2xl text-gray-600">Lädt...</div></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-primary-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Seite 1</div>
                <h1 className="text-2xl font-bold">Was ist Fobizz?</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">{checkedCount}/{confirmItems.length} bestätigt</div>
              {allChecked && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold text-sm">
                  <CheckCircle className="w-5 h-5" />
                  Abgeschlossen!
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        <Navigation />

        {/* ACCORDION: Kerninfos aufdecken */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold mb-2">📖 Was musst du wissen?</h2>
          <p className="text-gray-500 text-sm mb-5">Klicke auf einen Bereich um ihn aufzuklappen.</p>
          <div className="space-y-3">
            {accordionItems.map((item) => (
              <div key={item.id} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => handleAccordionToggle(item.id)}
                  className="w-full flex items-center justify-between p-4 bg-white/60 hover:bg-primary-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="font-semibold text-gray-800">{item.title}</span>
                  </div>
                  <motion.div animate={{ rotate: openAccordion === item.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openAccordion === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 border-t border-gray-100 bg-white/40 text-gray-700 text-sm leading-relaxed space-y-2">
                        {item.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* REVEAL CARDS: Begriffe aufdecken */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold mb-2">🃏 Begriffe aufdecken</h2>
          <p className="text-gray-500 text-sm mb-5">Überlege kurz – dann klicke um die Erklärung zu sehen.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {revealCards.map((card) => (
              <div key={card.id}
                onClick={() => handleReveal(card.id)}
                className="cursor-pointer rounded-xl border-2 border-dashed border-primary-200 overflow-hidden">
                <div className="p-4 bg-primary-50 flex items-center justify-between">
                  <span className="font-bold text-primary-700">{card.term}</span>
                  {revealed[card.id]
                    ? <EyeOff className="w-4 h-4 text-primary-400" />
                    : <Eye className="w-4 h-4 text-primary-400" />
                  }
                </div>
                <AnimatePresence>
                  {revealed[card.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-white text-gray-700 text-sm leading-relaxed border-t border-primary-100">
                        {card.explanation}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* QUIZ: Multiple Choice */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold mb-2">🧠 Kleiner Wissens-Check</h2>
          <p className="text-gray-500 text-sm mb-5">Wähle die richtige Antwort.</p>
          <div className="space-y-6">
            {quizQuestions.map((q) => (
              <div key={q.key} className="bg-white/60 rounded-xl p-5 border border-gray-100">
                <p className="font-semibold text-gray-800 mb-3">{q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const selected = quizAnswers[q.key] === opt;
                    const answered = quizAnswers[q.key] !== undefined;
                    const isCorrect = opt === q.correct;
                    let style = 'border-gray-200 bg-white/60';
                    if (answered && selected && isCorrect) style = 'border-green-400 bg-green-50';
                    else if (answered && selected && !isCorrect) style = 'border-red-400 bg-red-50';
                    else if (answered && isCorrect) style = 'border-green-300 bg-green-50';
                    return (
                      <button key={opt}
                        onClick={() => !answered && handleQuizAnswer(q.key, opt, q.correct)}
                        disabled={answered}
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${style} ${!answered ? 'hover:border-primary-300 hover:bg-primary-50 cursor-pointer' : 'cursor-default'}`}
                      >
                        {opt}
                        {answered && isCorrect && <span className="ml-2 text-green-600 font-bold">✓</span>}
                        {answered && selected && !isCorrect && <span className="ml-2 text-red-600 font-bold">✗</span>}
                      </button>
                    );
                  })}
                </div>
                {quizResults[q.key] === false && (
                  <p className="mt-2 text-sm text-red-600">Nicht ganz – die richtige Antwort ist grün markiert.</p>
                )}
                {quizResults[q.key] === true && (
                  <p className="mt-2 text-sm text-green-600 font-medium">Richtig! 🎉</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Fobizz-Link */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6 mb-6 flex items-center gap-4">
          <Wrench className="w-8 h-8 text-primary-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-gray-800">Start mit Fobizz</p>
            <p className="text-gray-600 text-sm">Du hast dich registriert – kontrolliere ob der Zugriff funktioniert.</p>
          </div>
          <a href="https://fobizz.com" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-primary-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex-shrink-0">
            <ExternalLink className="w-4 h-4" />
            fobizz.com
          </a>
        </motion.div>

        {/* Bestätigung */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-2">✅ Ich bestätige...</h2>

          {!confirmUnlocked ? (
            <div className="mb-6">
              <p className="text-gray-500 text-sm mb-3">
                Schliesse zuerst mindestens 80% der Aktivitäten ab, um die Bestätigung freizuschalten.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${activityProgress}%` }}
                    transition={{ duration: 0.4 }}
                    className="h-full bg-gradient-to-r from-blue-400 to-primary-500 rounded-full"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-600 w-12 text-right">{activityProgress}%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{completedActions} von {TOTAL_ACTIONS} Aktionen abgeschlossen</p>
            </div>
          ) : (
            <p className="text-green-600 text-sm mb-5 font-medium">🔓 Freigeschaltet – du hast {activityProgress}% der Aktivitäten absolviert!</p>
          )}

          <div className={`space-y-3 transition-all duration-500 ${!confirmUnlocked ? 'opacity-40 pointer-events-none select-none' : ''}`}>
            {confirmItems.map((item, i) => (
              <motion.button
                key={item.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.07 }}
                onClick={() => handleCheck(item.key)}
                disabled={saving || !confirmUnlocked}
                className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                  checked[item.key]
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 bg-white/60 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                {checked[item.key]
                  ? <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  : <Circle className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                }
                <span className={`text-sm leading-relaxed ${checked[item.key] ? 'text-green-800 font-medium' : 'text-gray-700'}`}>
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>
          {allChecked && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-green-100 border border-green-300 rounded-xl text-center">
              <p className="text-green-800 font-semibold">🎉 Super! Diese Seite ist abgeschlossen.</p>
              <p className="text-green-700 text-sm mt-1">Dein Fortschritt wird im Dashboard angezeigt.</p>
            </motion.div>
          )}
        </motion.div>

      </div>
    </div>
  );
}

const accordionItems = [
  {
    id: 'acc1', emoji: '🤖', title: 'Was ist Fobizz genau?',
    content: (
      <>
        <p>Fobizz ist ein <strong>Lernort für Weiterbildungen</strong> sowie eine Plattform für <strong>KI-Werkzeuge</strong> und <strong>Autor/innen-Werkzeuge</strong>.</p>
        <p>Fobizz ist <em>kein</em> Unterrichtsmaterialgenerator wie to-teach.ai, sondern eine digitale Autor/innen-Werkzeug-Oberfläche und ein KI-Werkzeugtool.</p>
        <p>Eine Hauptfunktion ist der <strong>KI-Assistent</strong>, den Lehrpersonen für eigene Zwecke nutzen können – der aber auch Lernenden zur Verfügung gestellt werden kann.</p>
      </>
    )
  },
  {
    id: 'acc2', emoji: '🔐', title: 'Datenschutz & Lernräume',
    content: (
      <>
        <p>Lernende haben <strong>nur mit Codes Zugriff</strong>, die durch die Erzeugung von Lernräumen erstellt werden – das macht Fobizz datenschutzkonform.</p>
        <p><strong>Ausnahme:</strong> Bei einem 24h-Lernraum-Link ist Zugriff auch ohne Login möglich. Lernräume bestehen maximal 12 Monate, danach werden sie automatisch gelöscht.</p>
        <p>Lernende können in Lernräumen auch zu <strong>Autor/innen werden</strong> – besonders wertvoll für handlungskompetenzorientierten Unterricht.</p>
      </>
    )
  },
  {
    id: 'acc3', emoji: '🏫', title: 'Lizenz Kanton Zürich',
    content: (
      <>
        <p><strong>2026:</strong> Der Kanton Zürich hat eine Gesamtlizenz für alle SekII-Schulen gelöst.</p>
        <p><strong>2027:</strong> Jede Schule muss für sich selbst die Fortführung der Lizenz organisieren.</p>
      </>
    )
  },
  {
    id: 'acc4', emoji: '👩‍💻', title: 'Lernende als Autor/innen',
    content: (
      <>
        <p>Mit Lernräumen können Lehrpersonen den Lernenden nicht nur Werkzeuge zur Verfügung stellen, sondern Lernende können dort selbst zu <strong>Autor/innen</strong> werden.</p>
        <p>Die von den Lernenden erzeugten Lerninhalte und Lernwege können durch die Lehrperson mit einem individuellen Zugang angeschaut werden.</p>
      </>
    )
  },
];

const revealCards = [
  { id: 'r1', term: 'Lernraum', explanation: 'Ein geschützter Bereich auf Fobizz, zu dem Lernende nur mit einem Code Zugang haben. Lehrpersonen erstellen Lernräume und verteilen die Codes separat.' },
  { id: 'r2', term: '24h-Lernraum-Link', explanation: 'Eine Ausnahme: Über diesen Link ist Zugriff 24 Stunden lang auch ohne Login möglich – praktisch für einmalige Einsätze.' },
  { id: 'r3', term: 'KI-Assistent', explanation: 'Die Hauptfunktion von Fobizz: Ein datenschutzkonformer KI-Assistent für Lehrpersonen – kann aber auch in Lernräumen für Lernende aktiviert werden.' },
  { id: 'r4', term: 'Autor/innen-Werkzeug', explanation: 'Fobizz ist keine reine Materialplattform – Lehrpersonen und sogar Lernende können selbst Inhalte und Lernwege erstellen.' },
];

const quizQuestions = [
  {
    key: 'q1',
    question: 'Was ist der Hauptunterschied zwischen Fobizz und to-teach.ai?',
    options: [
      'Fobizz ist kostenlos, to-teach.ai nicht.',
      'Fobizz ist ein KI-Werkzeug und Autor/innen-Tool, to-teach.ai ein Unterrichtsmaterialgenerator.',
      'to-teach.ai ist datenschutzkonformer als Fobizz.',
      'Fobizz funktioniert nur auf dem iPad.',
    ],
    correct: 'Fobizz ist ein KI-Werkzeug und Autor/innen-Tool, to-teach.ai ein Unterrichtsmaterialgenerator.',
  },
  {
    key: 'q2',
    question: 'Wie erhalten Lernende Zugang zu einem Fobizz-Lernraum?',
    options: [
      'Sie registrieren sich selbst mit ihrer Schul-Email.',
      'Die Lehrperson gibt ihnen einen Code, der beim Erstellen des Lernraums generiert wird.',
      'Sie brauchen gar keinen Zugang – alles ist öffentlich.',
      'Nur über den 24h-Link.',
    ],
    correct: 'Die Lehrperson gibt ihnen einen Code, der beim Erstellen des Lernraums generiert wird.',
  },
  {
    key: 'q3',
    question: 'Was passiert 2027 mit der Fobizz-Lizenz?',
    options: [
      'Der Kanton Zürich verlängert automatisch.',
      'Fobizz wird kostenlos für alle.',
      'Jede Schule muss für sich selbst die Fortführung der Lizenz organisieren.',
      'Fobizz wird eingestellt.',
    ],
    correct: 'Jede Schule muss für sich selbst die Fortführung der Lizenz organisieren.',
  },
];

const confirmItems = [
  { key: 'fobizz-q1', label: 'Ich weiss, dass Fobizz kein Unterrichtsmaterialgenerator ist, sondern ein KI-Werkzeug und eine Autor/innen-Oberfläche.' },
  { key: 'fobizz-q2', label: 'Ich verstehe, wie Lernräume funktionieren und dass Lernende Codes erhalten, um Zugang zu erhalten.' },
  { key: 'fobizz-q3', label: 'Ich weiss, dass für 2026 eine Gesamtlizenz des Kantons Zürich besteht und 2027 jede Schule selbst entscheiden muss.' },
  { key: 'fobizz-q4', label: 'Ich habe geprüft, ob mein Fobizz-Zugang funktioniert.' },
];
