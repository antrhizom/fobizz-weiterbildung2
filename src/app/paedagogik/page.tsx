'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getCurrentUser, getUserData } from '@/lib/auth';
import { User } from '@/types';
import Navigation from '@/components/Navigation';
import { BookOpen, Target, Brain, Zap, RefreshCw, AlertCircle } from 'lucide-react';

export default function PaedagogikPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) { router.push('/login'); return; }
      const userData = await getUserData(currentUser.uid);
      if (userData) setUser(userData);
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-2xl text-gray-600">Lädt...</div></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">Seite 2</div>
              <h1 className="text-2xl font-bold">Pädagogik & Didaktik</h1>
              <p className="text-gray-600">Didaktische Grundlagen für den KI-Einsatz mit Fobizz</p>
            </div>
          </div>
        </motion.div>

        <Navigation />

        {/* Platzhalter-Hinweis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-6 mb-6 flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-800 mb-1">Inhalt wird noch ergänzt</h3>
            <p className="text-amber-700 text-sm leading-relaxed">
              Diese Seite enthält Platzhalter-Inhalte. Der spezifische pädagogisch-didaktische Inhalt
              wird von der Kursleitung noch definiert und hier eingefügt.
              Die untenstehende Struktur dient als Orientierungsrahmen.
            </p>
          </div>
        </motion.div>

        {/* Lernziele */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <Target className="w-7 h-7 text-violet-600" />
            Lernziele
          </h2>
          <p className="text-gray-600 text-sm mb-4 italic">[Hier werden die spezifischen Lernziele des Kurses eingefügt]</p>
          <div className="space-y-3">
            {learningGoalPlaceholders.map((goal, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-violet-50 rounded-xl border border-violet-100">
                <div className="w-7 h-7 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-gray-700">{goal}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Didaktischer Ansatz */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <Brain className="w-7 h-7 text-violet-600" />
            Didaktischer Ansatz
          </h2>
          <p className="text-gray-600 text-sm mb-6 italic">[Hier folgt der spezifische didaktische Ansatz des Kurses]</p>

          <div className="grid md:grid-cols-3 gap-5">
            {didacticApproaches.map((approach, i) => (
              <div key={i} className="bg-white/60 rounded-xl p-5 border border-white/40 text-center">
                <div className="text-4xl mb-3">{approach.emoji}</div>
                <h3 className="font-bold text-gray-800 mb-2">{approach.title}</h3>
                <p className="text-gray-600 text-sm">{approach.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* KI im Unterricht – Chancen und Risiken */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Zap className="w-7 h-7 text-violet-600" />
            KI im Unterricht – Chancen und Herausforderungen
          </h2>
          <p className="text-gray-600 text-sm mb-6 italic">[Dieser Abschnitt wird mit dem spezifischen Kursinhalt gefüllt]</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                <span className="text-xl">✅</span> Chancen
              </h3>
              <ul className="space-y-2">
                {chances.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                    <span className="mt-1 flex-shrink-0">•</span> {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-6">
              <h3 className="font-bold text-rose-800 mb-4 flex items-center gap-2">
                <span className="text-xl">⚠️</span> Herausforderungen
              </h3>
              <ul className="space-y-2">
                {challenges.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-rose-700">
                    <span className="mt-1 flex-shrink-0">•</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Reflexionsfragen */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <RefreshCw className="w-7 h-7 text-violet-600" />
            Reflexionsfragen
          </h2>
          <p className="text-gray-600 text-sm mb-6 italic">[Ergänze hier die spezifischen Reflexionsfragen für deinen Kurs]</p>
          <div className="space-y-4">
            {reflectionQuestions.map((q, i) => (
              <div key={i} className="bg-white/60 rounded-xl p-5 border border-white/40">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{q.emoji}</div>
                  <p className="text-gray-800 font-medium leading-relaxed">{q.question}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const learningGoalPlaceholders = [
  'Du verstehst, welche pädagogisch-didaktischen Prinzipien den KI-Einsatz im Unterricht leiten.',
  'Du kannst den Mehrwert von KI-Werkzeugen für deinen spezifischen Unterrichtskontext einschätzen.',
  'Du reflektierst kritisch den Einfluss von KI auf Lehr- und Lernprozesse.',
  'Du entwickelst eine didaktisch begründete Haltung zum Einsatz digitaler Werkzeuge.',
  '[Weiterer Lerninhalt wird von der Kursleitung ergänzt]',
];

const didacticApproaches = [
  { emoji: '🔍', title: 'Explorativ', description: 'Entdeckendes Lernen durch eigenes Ausprobieren und Erkunden der Werkzeuge.' },
  { emoji: '🔄', title: 'Reflektiv', description: 'Kritische Auseinandersetzung mit den Ergebnissen und dem Einsatz von KI.' },
  { emoji: '🤝', title: 'Kooperativ', description: 'Peer-Learning und kollegialer Austausch über Erfahrungen und Best Practices.' },
];

const chances = [
  'Zeitersparnis bei der Unterrichtsvorbereitung',
  'Schnelle Differenzierung für heterogene Klassen',
  'Neue kreative Impulse und Ideen',
  'Individuelle Förderung ermöglichen',
  'Schülerinnen und Schüler auf die KI-Welt vorbereiten',
];

const challenges = [
  'Qualitätssicherung der KI-generierten Inhalte',
  'Datenschutz und Privatsphäre',
  'Gefahr der unkritischen Übernahme',
  'Digitale Kluft zwischen Lehrpersonen',
  'Veränderung des Lernbegriffs und der Leistungsbewertung',
];

const reflectionQuestions = [
  { emoji: '💭', question: 'In welchen konkreten Unterrichtssituationen würde dir Fobizz den grössten Mehrwert bringen?' },
  { emoji: '🤔', question: 'Welche Bedenken hast du beim Einsatz von KI im Unterricht – und wie könntest du damit umgehen?' },
  { emoji: '📚', question: 'Wie verändert sich die Rolle der Lehrperson, wenn KI-Werkzeuge im Unterricht eingesetzt werden?' },
  { emoji: '🌟', question: 'Was hast du heute gelernt, das du morgen in deinem Unterricht ausprobieren möchtest?' },
];
