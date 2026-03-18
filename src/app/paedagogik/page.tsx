'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthChange, getUserData, logout } from '@/lib/auth';
import { updateUserSubtasks } from '@/lib/firestore';
import { User } from '@/types';
import Navigation from '@/components/Navigation';
import { BookOpen, CheckCircle, Circle, ChevronDown, Eye, EyeOff } from 'lucide-react';

// Gesamtzahl der interaktiven Aktionen (3 Accordion + 8 Reveal + 3 Quiz = 14)
const TOTAL_ACTIONS = 14;
const UNLOCK_THRESHOLD = 0.8; // 80%

export default function PaedagogikPage() {
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
          if (subs[`paed-acc-${item.id}`]) restoredAccordions.add(item.id);
        });
        setOpenedAccordions(restoredAccordions);

        const restoredRevealed: Record<string, boolean> = {};
        revealCards.forEach(card => {
          if (subs[`paed-rev-${card.id}`]) restoredRevealed[card.id] = true;
        });
        setRevealed(restoredRevealed);

        const restoredQuiz: Record<string, string> = {};
        const restoredResults: Record<string, boolean | null> = {};
        quizQuestions.forEach(q => {
          const savedAnswer = subs[`paed-quiz-${q.key}`];
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

  const persistActivity = async (key: string, value: string) => {
    if (!user) return;
    const updated = { ...(user.completedSubtasks || {}), [key]: value };
    await updateUserSubtasks(user.userId, updated);
    setUser({ ...user, completedSubtasks: updated });
  };

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

  const handleQuizAnswer = async (qKey: string, answer: string, correct: string) => {
    if (quizAnswers[qKey] !== undefined) return;
    setQuizAnswers({ ...quizAnswers, [qKey]: answer });
    setQuizResults({ ...quizResults, [qKey]: answer === correct });
    await persistActivity(`paed-quiz-${qKey}`, answer);
  };

  const handleAccordionToggle = async (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
    if (!openedAccordions.has(id)) {
      setOpenedAccordions(prev => new Set(prev).add(id));
      await persistActivity(`paed-acc-${id}`, 'opened');
    }
  };

  const handleReveal = async (cardId: string) => {
    const newRevealed = { ...revealed, [cardId]: !revealed[cardId] };
    setRevealed(newRevealed);
    if (!revealed[cardId]) {
      await persistActivity(`paed-rev-${cardId}`, 'revealed');
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
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">Seite 2</div>
                <h1 className="text-2xl font-bold">Pädagogik & Didaktik</h1>
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

        {/* Einstieg: Schlagzeile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-8 mb-6 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-2xl font-bold gradient-text mb-3">
            Lernen, Unterricht und die Digitalität sind datenintensiv.
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Digitaler Unterricht ermöglicht eine <strong>Pluralität der Lernräume und der Lernwege</strong>.
            Doch die entscheidende Frage ist nicht, welches Tool interessant ist – sondern welche pädagogischen Probleme gelöst werden sollen.
          </p>
        </motion.div>

        {/* ACCORDION: Kernthemen */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold mb-2">📖 Die wichtigsten Themen</h2>
          <p className="text-gray-500 text-sm mb-5">Klicke auf einen Bereich um ihn aufzuklappen.</p>
          <div className="space-y-3">
            {accordionItems.map((item) => (
              <div key={item.id} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => handleAccordionToggle(item.id)}
                  className="w-full flex items-center justify-between p-4 bg-white/60 hover:bg-violet-50 transition-colors text-left"
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
                      <div className="p-5 border-t border-gray-100 bg-white/40 text-gray-700 text-sm leading-relaxed space-y-3">
                        {item.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Grundmerkmale des Lernens: Reveal-Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold mb-2">🃏 Grundmerkmale des Lernens</h2>
          <p className="text-gray-500 text-sm mb-5">Klicke auf ein Merkmal um die Erklärung zu sehen.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {revealCards.map((card) => (
              <div key={card.id}
                onClick={() => handleReveal(card.id)}
                className="cursor-pointer rounded-xl border-2 border-dashed border-violet-200 overflow-hidden">
                <div className="p-4 bg-violet-50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{card.emoji}</span>
                    <span className="font-bold text-violet-700">{card.term}</span>
                  </div>
                  {revealed[card.id]
                    ? <EyeOff className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    : <Eye className="w-4 h-4 text-violet-400 flex-shrink-0" />
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
                      <div className="p-4 bg-white text-gray-700 text-sm leading-relaxed border-t border-violet-100">
                        {card.explanation}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Was sollen digitale Werkzeuge leisten */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold mb-5">⚙️ Was sollen digitale Werkzeuge leisten?</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {digitalGoals.map((goal, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-gray-100">
                <span className="text-xl flex-shrink-0">{goal.emoji}</span>
                <p className="text-gray-700 text-sm leading-relaxed">{goal.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quiz */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
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
                        onClick={() => handleQuizAnswer(q.key, opt, q.correct)}
                        disabled={answered}
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${style} ${!answered ? 'hover:border-violet-300 hover:bg-violet-50 cursor-pointer' : 'cursor-default'}`}
                      >
                        {opt}
                        {answered && isCorrect && <span className="ml-2 text-green-600 font-bold">✓</span>}
                        {answered && selected && !isCorrect && <span className="ml-2 text-red-600 font-bold">✗</span>}
                      </button>
                    );
                  })}
                </div>
                {quizResults[q.key] === false && <p className="mt-2 text-sm text-red-600">Nicht ganz – die richtige Antwort ist grün markiert.</p>}
                {quizResults[q.key] === true && <p className="mt-2 text-sm text-green-600 font-medium">Richtig! 🎉</p>}
              </div>
            ))}
          </div>
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
                    className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full"
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
                    : 'border-gray-200 bg-white/60 hover:border-violet-300 hover:bg-violet-50'
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
    id: 'acc1', emoji: '❓', title: 'Wieso digitaler Unterricht?',
    content: (
      <>
        <p>Digitaler Unterricht ermöglicht eine <strong>Pluralität der Lernräume und der Lernwege</strong>.</p>
        <p>Die entscheidenden Fragen sind <em>nicht</em>: „Welches Tool finde ich interessant?" oder „Welches Tool möchte ich einmal ausprobieren?"</p>
        <p>Sondern: <strong>Wo bestehen Probleme in meinem Unterricht? Wie soll das Lernen aussehen? Wie möchte ich meinen Unterricht verändern?</strong></p>
        <p>Es ist am Anfang eine grundsätzlich kritische pädagogisch-didaktische Frage gegenüber dem eigenen Unterricht. Dann kommt die Anschlussfrage: Wie kann die digitale Pädagogik/Didaktik dabei helfen?</p>
      </>
    )
  },
  {
    id: 'acc2', emoji: '🔧', title: 'Voraussetzungen für digitale Hilfsmittel',
    content: (
      <>
        <p>Damit digitale Hilfsmittel Probleme des Unterrichts tatsächlich lösen können, braucht es:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li><strong>Kollaboration von Anfang an</strong> unter den Lehrpersonen</li>
          <li><strong>Asynchrones Lernen</strong> bzw. entsprechende Unterrichtsgestaltung</li>
          <li>Lehrpersonen sind auch <strong>Medienpädagog/innen</strong> und Expert/innen in Lerntechnologien</li>
        </ul>
      </>
    )
  },
  {
    id: 'acc3', emoji: '🎯', title: 'Wo kommt Fobizz zum Zug? – Beispiele mit ABU-Bezug',
    content: (
      <div className="space-y-5">
        <p className="text-gray-600 italic text-xs">Jedes Beispiel zeigt, welche pädagogischen Merkmale es unterstützt und wie es im ABU-Unterricht eingesetzt werden kann.</p>

        {/* Beispiel 1 */}
        <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔗</span>
            <strong className="text-violet-800">QR-Code & Kurzlink erstellen</strong>
          </div>
          <p className="text-sm text-gray-700 mb-2">Einen Lerninhalt per Smartphone oder Papierunterlage zugänglich machen – mit Nutzungsauswertung. Wenn der QR-Code über einen verkürzten Link erzeugt wird, ist die Häufigkeit der Nutzung automatisch sichtbar.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">🧭 Orientierung</span>
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">👁️ Lernprozesse einsehbar</span>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">ABU: Lernmaterial zu Themen wie Arbeit, Recht, Gesellschaft direkt verlinken</span>
          </div>
        </div>

        {/* Beispiel 2 */}
        <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📌</span>
            <strong className="text-violet-800">Pinnwand, Umfrage & Wortwolke</strong>
          </div>
          <p className="text-sm text-gray-700 mb-2">Einfache Padlet-Alternative – schnell erstellt, direkt in einen Lernraum integrierbar. Mit Umfragen und Wortwolken Vorwissen aktivieren und Wissensreflexion ermöglichen.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">💬 Feedbackorientiert</span>
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">🏃 Aktivitätsmotivierend</span>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">ABU: Einstieg in Themen wie Konsum, Demokratie, Migration mit Wortwolke zum Vorwissen</span>
          </div>
        </div>

        {/* Beispiel 3 */}
        <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎙️</span>
            <strong className="text-violet-800">Unterrichtsmaterial mit KI-Multimediatools aufbereiten</strong>
          </div>
          <p className="text-sm text-gray-700 mb-2">Als Lehrperson einen Podcast erstellen lassen oder Transkripte von Videos und Audiodateien erzeugen – als Unterlagenbasis für Lernende.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">🎬 Multimedial</span>
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">⏱️ Zeitlich entlastend</span>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">ABU: Podcast zu einem ABU-Thema (z.B. AHV, Mietrecht) als Lerngrundlage aufbereiten</span>
          </div>
        </div>

        {/* Beispiel 4 */}
        <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🛠️</span>
            <strong className="text-violet-800">KI-Tools im Lernraum für Lernende bereitstellen</strong>
          </div>
          <p className="text-sm text-gray-700 mb-2">Lernende erhalten Zugang zu Transkribierungs-Tools und Bildgeneratoren im geschützten Lernraum – ohne eigene Accounts.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">🛤️ Individuelle Lernwege</span>
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">🏫 Lernraum-Pluralität</span>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">ABU: Lernende transkribieren ein Interview zu einem Gesellschaftsthema selbstständig</span>
          </div>
        </div>

        {/* Beispiel 5 */}
        <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🤖</span>
            <strong className="text-violet-800">KI-Assistent für Lernende bereitstellen</strong>
          </div>
          <p className="text-sm text-gray-700 mb-2">Lernende erhalten einen konfigurierten KI-Assistenten – als Dialogpartner, Lernassistent zur Wissensvermittlung oder Bot zur Dokumentenanalyse.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">🤖 KI-Assistenz</span>
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">💬 Feedbackorientiert</span>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">ABU/SLP: KI erklärt Lernenden Rechtstexte, gibt Feedback auf Argumentationen in Dialogen</span>
          </div>
        </div>

        {/* Beispiel 6 */}
        <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎓</span>
            <strong className="text-violet-800">Lernende als Medienexpert/innen ausbilden</strong>
          </div>
          <p className="text-sm text-gray-700 mb-2">Lernende erstellen selbst KI-Assistenten oder Podcasts, erfassen Merkmale unterschiedlicher Sprachmodelle und werden so zu kompetenten Nutzer/innen digitaler Werkzeuge.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">💪 Übungsintensiv</span>
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">🏃 Aktivitätsabhängig</span>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">SLP: Handlungskompetenz «Medien & Digitalität» – Lernende produzieren und reflektieren</span>
          </div>
        </div>
      </div>
    )
  },
];

const revealCards = [
  { id: 'r1', emoji: '💬', term: 'Feedbackorientiert', explanation: 'Digitale Werkzeuge ermöglichen direktes, unmittelbares Feedback für Lernende – ohne auf die nächste Lehrperson warten zu müssen.' },
  { id: 'r2', emoji: '🛤️', term: 'Individuelle Lernwege', explanation: 'Jede Person lernt anders. Digitale Tools – besonders mit KI-Assistenz – machen individuelle Lernwege in grossem Massstab möglich.' },
  { id: 'r3', emoji: '🎬', term: 'Multimedial', explanation: 'Rezeption, Produktion, Interaktion und Kollaboration – digitaler Unterricht verbindet verschiedene Medienformen und Lernhandlungen.' },
  { id: 'r4', emoji: '🏫', term: 'Lernraum-Pluralität', explanation: 'Lernen findet nicht nur im Schulzimmer statt. Digitale Räume erweitern den Unterricht zeitlich und örtlich.' },
  { id: 'r5', emoji: '🧩', term: 'Komplexitätsreduktion', explanation: 'Gute digitale Werkzeuge reduzieren Komplexität für Lernende – sie fokussieren auf das Wesentliche und blenden Ablenkungen aus.' },
  { id: 'r6', emoji: '🏃', term: 'Aktivitätsabhängig', explanation: 'Lernen passiert durch Tun. Digitale Tools sollten Aktivität und Praxis ermöglichen – nicht nur passiven Konsum.' },
  { id: 'r7', emoji: '💪', term: 'Übungsintensiv', explanation: 'Wiederholung und Übung sind zentral für nachhaltiges Lernen. Digitale Plattformen ermöglichen intensivere Übungsfelder.' },
  { id: 'r8', emoji: '🤖', term: 'KI-Assistenz', explanation: 'KI macht Lernen individuell: Lernende erhalten massgeschneiderte Unterstützung, Erklärungen und Aufgaben – angepasst an ihr Niveau.' },
];

const digitalGoals = [
  { emoji: '⏱️', text: 'Zeitlich entlasten – für Lehrpersonen und Lernende' },
  { emoji: '💬', text: 'Direktes Feedback gegenüber den Lernenden ermöglichen' },
  { emoji: '🧭', text: 'Orientierung der Lernaufgaben und des Geleisteten schaffen' },
  { emoji: '👁️', text: 'Lernprozesse der Lernenden einsehbar machen' },
  { emoji: '🧩', text: 'Komplexität reduzieren' },
  { emoji: '🏃', text: 'Aktivitätsmotivierend sein und Praxis ermöglichen' },
  { emoji: '💪', text: 'Übungsfelder intensivieren' },
];

const quizQuestions = [
  {
    key: 'p1',
    question: 'Was ist die richtige Ausgangsfrage für den Einsatz digitaler Tools?',
    options: [
      'Welches Tool finde ich persönlich am interessantesten?',
      'Wo bestehen Probleme in meinem Unterricht und wie kann Digitalität helfen?',
      'Welches Tool ist am einfachsten zu bedienen?',
      'Was nutzen die meisten Lehrpersonen an anderen Schulen?',
    ],
    correct: 'Wo bestehen Probleme in meinem Unterricht und wie kann Digitalität helfen?',
  },
  {
    key: 'p2',
    question: 'Was ist eine Voraussetzung dafür, dass digitale Hilfsmittel Unterrichtsprobleme lösen können?',
    options: [
      'Alle Lernenden müssen ein iPad haben.',
      'Lehrpersonen brauchen keine speziellen Kenntnisse.',
      'Kollaboration unter Lehrpersonen von Anfang an.',
      'Die Schule muss eine eigene App entwickeln.',
    ],
    correct: 'Kollaboration unter Lehrpersonen von Anfang an.',
  },
  {
    key: 'p3',
    question: 'Wofür kann Fobizz in der Unterrichtsvorbereitung konkret eingesetzt werden?',
    options: [
      'Nur für die Erstellung von Zeugnissen.',
      'Lernräume organisieren, Umfragen zum Vorwissen, Pinnwand für Reflexionen.',
      'Ausschliesslich für KI-generierte Prüfungen.',
      'Fobizz eignet sich nicht für die Vorbereitung.',
    ],
    correct: 'Lernräume organisieren, Umfragen zum Vorwissen, Pinnwand für Reflexionen.',
  },
];

const confirmItems = [
  { key: 'paed-q1', label: 'Ich verstehe, dass die Ausgangsfrage für Digitalität eine pädagogisch-didaktische ist – nicht eine technische.' },
  { key: 'paed-q2', label: 'Ich kann die Grundmerkmale des Lernens benennen, die durch digitale Werkzeuge unterstützt werden.' },
  { key: 'paed-q3', label: 'Ich weiss, was digitale Werkzeuge leisten sollen (Feedback, Orientierung, Übung, Aktivität, ...).' },
  { key: 'paed-q4', label: 'Ich sehe, wo Fobizz konkret in meinem Unterricht zum Zug kommen könnte.' },
];
