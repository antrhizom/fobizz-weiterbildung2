'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthChange, getUserData, logout } from '@/lib/auth';
import { updateUserSubtasks } from '@/lib/firestore';
import { User } from '@/types';
import Navigation from '@/components/Navigation';
import { Lightbulb, CheckCircle, Circle, ChevronDown, Eye, EyeOff } from 'lucide-react';

// Gesamtzahl der interaktiven Aktionen (6 Beispiel-Cards + 2 Quiz = 8)
const TOTAL_ACTIONS = 8;
const UNLOCK_THRESHOLD = 0.8; // 80%

export default function BeispielePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [openExample, setOpenExample] = useState<string | null>(null);
  const [openedExamples, setOpenedExamples] = useState<Set<string>>(new Set());
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
        const restoredExamples = new Set<string>();
        examples.forEach(ex => {
          if (subs[`bsp-ex-${ex.id}`]) restoredExamples.add(ex.id);
        });
        setOpenedExamples(restoredExamples);

        const restoredQuiz: Record<string, string> = {};
        const restoredResults: Record<string, boolean | null> = {};
        quizQuestions.forEach(q => {
          const savedAnswer = subs[`bsp-quiz-${q.key}`];
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
    await persistActivity(`bsp-quiz-${qKey}`, answer);
  };

  const handleExampleToggle = async (id: string) => {
    setOpenExample(openExample === id ? null : id);
    if (!openedExamples.has(id)) {
      setOpenedExamples(prev => new Set(prev).add(id));
      await persistActivity(`bsp-ex-${id}`, 'opened');
    }
  };

  const completedActions =
    openedExamples.size +
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
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Seite 3</div>
                <h1 className="text-2xl font-bold">Beispiele mit Fobizz</h1>
                <p className="text-gray-600 text-sm">Konkrete Werkzeuge – mit Bezug zum ABU-Unterricht</p>
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

        {/* Einstieg */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-8 mb-6 text-center">
          <div className="text-5xl mb-4">🛠️</div>
          <h2 className="text-2xl font-bold gradient-text mb-3">
            Nicht das Tool steht im Zentrum – sondern das Problem im Unterricht.
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Die folgenden Beispiele zeigen, wie Fobizz-Werkzeuge konkret im ABU-Unterricht eingesetzt werden können.
            Klappe jedes Beispiel auf und überlege, welche deiner Unterrichtssituationen dazu passen könnten.
          </p>
        </motion.div>

        {/* BEISPIELE als Accordion */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold mb-2">🔍 Beispiele aufklappen & erkunden</h2>
          <p className="text-gray-500 text-sm mb-5">Klicke auf ein Beispiel um Details, Tipps und ABU-Bezüge zu sehen.</p>
          <div className="space-y-3">
            {examples.map((ex) => (
              <div key={ex.id} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => handleExampleToggle(ex.id)}
                  className="w-full flex items-center justify-between p-4 bg-white/60 hover:bg-amber-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ex.emoji}</span>
                    <div>
                      <span className="font-semibold text-gray-800 block">{ex.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ex.tagStyle}`}>{ex.tool}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {openedExamples.has(ex.id) && (
                      <span className="text-xs text-green-600 font-semibold hidden sm:block">✓ angeschaut</span>
                    )}
                    <motion.div animate={{ rotate: openExample === ex.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </div>
                </button>
                <AnimatePresence>
                  {openExample === ex.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 border-t border-gray-100 bg-white/40 space-y-4">

                        {/* Was ist das Werkzeug */}
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Was ist das?</p>
                          <p className="text-gray-700 text-sm leading-relaxed">{ex.what}</p>
                        </div>

                        {/* Konkrete Schritte */}
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">So funktioniert es</p>
                          <ol className="space-y-1.5">
                            {ex.steps.map((step, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Tipp */}
                        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                          <span className="text-amber-500 flex-shrink-0">💡</span>
                          <p className="text-amber-800 text-xs leading-relaxed">{ex.tip}</p>
                        </div>

                        {/* ABU-Bezug */}
                        <div className="flex items-start gap-2 p-3 bg-violet-50 rounded-xl border border-violet-100">
                          <span className="text-violet-500 flex-shrink-0">🎓</span>
                          <div>
                            <p className="text-xs font-bold text-violet-700 mb-0.5">ABU / SLP-Bezug</p>
                            <p className="text-violet-800 text-xs leading-relaxed">{ex.abuBezug}</p>
                          </div>
                        </div>

                        {/* Pädagogische Merkmale */}
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pädagogische Merkmale</p>
                          <div className="flex flex-wrap gap-2">
                            {ex.merkmale.map((m, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{m}</span>
                            ))}
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quiz */}
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
                        onClick={() => handleQuizAnswer(q.key, opt, q.correct)}
                        disabled={answered}
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${style} ${!answered ? 'hover:border-amber-300 hover:bg-amber-50 cursor-pointer' : 'cursor-default'}`}
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
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
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
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
                transition={{ delay: 0.5 + i * 0.07 }}
                onClick={() => handleCheck(item.key)}
                disabled={saving || !confirmUnlocked}
                className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                  checked[item.key]
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 bg-white/60 hover:border-amber-300 hover:bg-amber-50'
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

const examples = [
  {
    id: 'ex1',
    emoji: '🔗',
    tool: 'QR-Code & Link kürzen',
    tagStyle: 'bg-blue-100 text-blue-700',
    title: 'QR-Code erstellen & Link verkürzen',
    what: 'Fobizz bietet zwei einfache Werkzeuge, um Lerninhalte schnell zugänglich zu machen: einen QR-Code-Generator und einen Link-Kürzungsdienst. Beide Tools ermöglichen, dass Lernende per Smartphone oder Papierunterlage sofort auf Inhalte zugreifen können.',
    steps: [
      'Im Bereich «Inhalte sicher teilen» das Werkzeug «QR-Code erstellen» auswählen.',
      'Den gewünschten Link (z.B. ein Video, eine Website oder ein Fobizz-Material) einfügen.',
      'QR-Code generieren und herunterladen – kann sofort auf Arbeitsblätter gedruckt werden.',
      'Tipp: Zuerst den Link mit «Link kürzen» verkürzen, dann den Kurzlink in den QR-Code umwandeln → so sieht man in der Auswertung, wie häufig der QR-Code gescannt wurde.',
    ],
    tip: 'Beim erstellten QR-Code ist in der Auswertung sichtbar, wie oft er benutzt wurde. Das gibt dir als Lehrperson eine schnelle Rückmeldung, ob Lernende die Ressource tatsächlich aufgerufen haben.',
    abuBezug: 'Lernmaterialien zu ABU-Themen (Arbeit, Recht, Gesellschaft, Konsum) direkt auf Aufgabenblättern verlinken – oder wichtige Dokumente wie Gesetzesartikel, Nachrichtenartikel oder Erklärvideos QR-codiert bereitstellen.',
    merkmale: ['🧭 Orientierung', '👁️ Lernprozesse einsehbar', '⏱️ Zeitlich entlastend'],
  },
  {
    id: 'ex2',
    emoji: '📌',
    tool: 'Pinnwand / Umfrage / Wortwolke',
    tagStyle: 'bg-green-100 text-green-700',
    title: 'Pinnwand, Wortwolke & Umfrage einsetzen',
    what: 'Fobizz bietet einfache Alternativen zu Padlet und Mentimeter: Mit der Pinnwand lassen sich Beiträge der Lernenden sammeln, mit der Wortwolke Vorwissen aktivieren und mit der Umfrage schnelle Einschätzungen einholen. Alles kann direkt in einem Lernraum geteilt werden.',
    steps: [
      'Im Bereich «Material anlegen» das Werkzeug «Pinnwand», «Umfrage» oder «Wortwolke» wählen.',
      'Pinnwand: Frage oder Aufgabenstellung eingeben, Lernende posten Beiträge mit ihrem Code.',
      'Wortwolke: Lernende geben Begriffe ein, die häufigsten erscheinen grösser – gut für Einstieg.',
      'Umfrage: Mehrere Antwortoptionen anlegen, Ergebnisse erscheinen live und können besprochen werden.',
      'Über die «Teilen-Funktion» direkt in den Lernraum stellen oder per Link teilen.',
    ],
    tip: 'Pinnwand und Wortwolke lassen sich in weniger als 2 Minuten erstellen – ideal für spontane Einstiege oder Reflexionen am Ende einer Lektion.',
    abuBezug: 'Einstieg in ABU-Themen wie Konsum, Demokratie oder Migration: Wortwolke zum Vorwissen der Lernenden. Pinnwand für Reflexionen nach einer Sequenz. Umfrage zur Selbsteinschätzung vor einem Test.',
    merkmale: ['💬 Feedbackorientiert', '🏃 Aktivitätsmotivierend', '🧭 Orientierung'],
  },
  {
    id: 'ex3',
    emoji: '🎙️',
    tool: 'KI Multimedia Tools',
    tagStyle: 'bg-purple-100 text-purple-700',
    title: 'Unterrichtsmaterial mit KI-Multimediatools aufbereiten',
    what: 'Die KI-Multimediatools in Fobizz ermöglichen es Lehrpersonen, in kurzer Zeit verschiedene Medienformate zu erstellen: Podcasts, Transkripte von Videos oder Audiodateien, Zusammenfassungen von Texten und mehr – ohne technische Vorkenntnisse.',
    steps: [
      'In «Tools und KI» → «KI Multimedia Tools» den gewünschten Tool-Typ wählen (z.B. «Podcast erstellen» oder «Transkript erstellen»).',
      'Für Podcast: Thema, Länge und Gesprächsformat (Interview, Monolog, Dialog) angeben – KI erstellt ein Skript und spricht es ein.',
      'Für Transkript: Audio- oder Videodatei hochladen oder YouTube-Link einfügen – KI erstellt automatisch das schriftliche Transkript.',
      'Ergebnis herunterladen oder direkt in einen Lernraum stellen.',
    ],
    tip: 'Ein KI-generierter Podcast zu einem ABU-Thema eignet sich hervorragend als Einstieg oder Hausaufgabe – Lernende können ihn unterwegs hören und das Transkript als Lesetext verwenden.',
    abuBezug: 'Podcast zu AHV, Mietrecht oder Arbeitnehmerrechten als Lerngrundlage aufbereiten. Transkript eines politischen Speeches oder Nachrichtenberichts für Textanalyse bereitstellen. Dialogformat zu einem ABU-Szenario (z.B. Lohnverhandlung) erstellen.',
    merkmale: ['🎬 Multimedial', '⏱️ Zeitlich entlastend', '🛤️ Individuelle Lernwege'],
  },
  {
    id: 'ex4',
    emoji: '🛠️',
    tool: 'KI-Tools im Lernraum',
    tagStyle: 'bg-teal-100 text-teal-700',
    title: 'KI-Tools den Lernenden im Lernraum bereitstellen',
    what: 'Über einen Fobizz-Lernraum können Lehrpersonen den Lernenden datenschutzkonform KI-Tools zur Verfügung stellen – ohne dass die Lernenden eigene Accounts benötigen. Besonders nützlich: Transkriptions-Tools und Bildgeneratoren.',
    steps: [
      'Lernraum erstellen (Langfristig oder 24h) und Zugangscodes verteilen.',
      'Im Lernraum unter «Projekte» das gewünschte KI-Tool hinzufügen (z.B. «Text aus Bild oder PDF erkennen» oder «Bild generieren»).',
      'Lernende öffnen den Lernraum mit ihrem Code und nutzen das Tool eigenständig.',
      'Als Lehrperson siehst du die Ergebnisse der Lernenden im Lernraum.',
    ],
    tip: 'Transkription: Lernende fotografieren einen Zeitungsartikel oder ein handschriftliches Dokument – das Tool wandelt es in bearbeitbaren Text um. Bildgenerator: Lernende visualisieren abstrakte Konzepte (z.B. «Wie stelle ich mir Demokratie vor?»).',
    abuBezug: 'Lernende transkribieren selbstständig ein Interview zu einem Gesellschaftsthema. Bildgenerator für kreative Einstiege in ABU-Themen (z.B. Bilderwelten zu «Arbeit», «Gerechtigkeit»). Dokumentenanalyse bei Lohnausweisen, Mietverträgen oder Gesetzen.',
    merkmale: ['🛤️ Individuelle Lernwege', '🏫 Lernraum-Pluralität', '🏃 Aktivitätsabhängig'],
  },
  {
    id: 'ex5',
    emoji: '🤖',
    tool: 'KI-Assistent',
    tagStyle: 'bg-orange-100 text-orange-700',
    title: 'KI-Assistenten den Lernenden zur Verfügung stellen',
    what: 'In Fobizz können Lehrpersonen eigene KI-Assistenten konfigurieren und diese dann in Lernräumen für Lernende freischalten. Je nach Konfiguration dient der Assistent als Dialogpartner, Lernhelfer, Erklärtool oder Bot für Dokumentenanalyse.',
    steps: [
      'In «KI Chat und Assistenten» → «KI-Assistenten Katalog» → «Eigene KI-Assistenten» erstellen.',
      'Rolle definieren: z.B. «Du bist ein Lernassistent für ABU. Erkläre Begriffe einfach und gib immer ein Alltagsbeispiel.»',
      'Hintergrundwissen hochladen (z.B. Gesetzestext, Fallbeispiel, Lehrmittelseite).',
      'Assistenten in den Lernraum stellen und den Code an Lernende weitergeben.',
      'Lernende können eigenständig Fragen stellen, Texte analysieren oder sich auf Prüfungen vorbereiten.',
    ],
    tip: 'Gut konfigurierte KI-Assistenten geben keine Antworten einfach vor, sondern führen Lernende mit Rückfragen zur eigenen Lösung – das fördert tiefes Verstehen statt Copy-Paste.',
    abuBezug: 'KI erklärt Lernenden Rechtstexte zu Mietrecht oder Arbeitsrecht. Lernassistent für die Vorbereitung auf ABU-Prüfungen. Dialogbot für Rollenspiele (z.B. Gesprächsführung mit Vorgesetztem, Bewerbungsgespräch üben). Dokumentenanalyse bei Lohnausweis oder Versicherungspolice.',
    merkmale: ['🤖 KI-Assistenz', '💬 Feedbackorientiert', '🛤️ Individuelle Lernwege', '💪 Übungsintensiv'],
  },
  {
    id: 'ex6',
    emoji: '🎓',
    tool: 'Lernende als Autor/innen',
    tagStyle: 'bg-pink-100 text-pink-700',
    title: 'Lernende als Medienexpert/innen ausbilden',
    what: 'Fobizz ermöglicht es, Lernende nicht nur als Konsument/innen, sondern als Autor/innen digitaler Inhalte einzusetzen. Sie können eigene KI-Assistenten konfigurieren, Podcasts produzieren und die Merkmale verschiedener Sprachmodelle erfassen und vergleichen.',
    steps: [
      'Auftrag formulieren: z.B. «Erstellt einen KI-Assistenten, der euren Mitschüler/innen ein ABU-Thema erklärt.»',
      'Lernende konfigurieren Rolle, Tonalität und Hintergrundwissen des Assistenten eigenständig.',
      'Optional: Lernende produzieren einen Podcast (Skript, Einsprache, Export) zu einem ABU-Thema.',
      'Reflexionsauftrag: Welche Sprachmodelle wurden verwendet? Was können sie? Wo haben sie Grenzen?',
      'Fertige Produkte werden im Lernraum geteilt und gegenseitig bewertet.',
    ],
    tip: 'Wenn Lernende selbst KI-Assistenten konfigurieren, lernen sie KI nicht nur zu nutzen, sondern zu verstehen und kritisch zu beurteilen – eine Schlüsselkompetenz im SLP.',
    abuBezug: 'SLP-Handlungskompetenz «Medien & Digitalität»: Lernende produzieren, reflektieren und präsentieren. Lernende erstellen einen Lernassistenten zu einem ABU-Thema (z.B. Sozialversicherungen) für die nächste Klasse. Merkmale verschiedener KI-Modelle (ChatGPT, Claude, Gemini) erfassen und dokumentieren.',
    merkmale: ['💪 Übungsintensiv', '🏃 Aktivitätsabhängig', '🎬 Multimedial', '🛤️ Individuelle Lernwege'],
  },
];

const quizQuestions = [
  {
    key: 'bsp1',
    question: 'Was ist der Vorteil, wenn man zuerst einen Kurzlink erstellt und dann daraus einen QR-Code generiert?',
    options: [
      'Der QR-Code wird kleiner und passt besser aufs Blatt.',
      'Die Nutzungshäufigkeit des QR-Codes ist in der Auswertung des Kurzlinks sichtbar.',
      'Der Link ist sicherer verschlüsselt.',
      'Lernende müssen sich nicht mehr einloggen.',
    ],
    correct: 'Die Nutzungshäufigkeit des QR-Codes ist in der Auswertung des Kurzlinks sichtbar.',
  },
  {
    key: 'bsp2',
    question: 'Was unterscheidet einen gut konfigurierten KI-Assistenten von einem einfachen KI-Chat?',
    options: [
      'Er ist teurer und braucht mehr Rechenleistung.',
      'Er hat eine definierte Rolle, Tonalität und kann mit eigenem Hintergrundwissen ausgestattet werden.',
      'Er kann nur auf Deutsch antworten.',
      'Er ist ausschliesslich für Lehrpersonen, nicht für Lernende.',
    ],
    correct: 'Er hat eine definierte Rolle, Tonalität und kann mit eigenem Hintergrundwissen ausgestattet werden.',
  },
];

const confirmItems = [
  { key: 'bsp-q1', label: 'Ich kann mindestens zwei Fobizz-Werkzeuge benennen, die ich konkret in meinem ABU-Unterricht einsetzen möchte.' },
  { key: 'bsp-q2', label: 'Ich verstehe, wie ich KI-Tools datenschutzkonform über einen Lernraum für Lernende bereitstellen kann.' },
  { key: 'bsp-q3', label: 'Ich sehe das Potenzial, Lernende als Autor/innen digitaler Inhalte (Podcasts, KI-Assistenten) einzusetzen.' },
];
