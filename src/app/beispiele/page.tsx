'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { onAuthChange, getUserData } from '@/lib/auth';
import { User } from '@/types';
import Navigation from '@/components/Navigation';
import { Lightbulb, ExternalLink, Copy, Check } from 'lucide-react';

export default function BeispielePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('alle');

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (!currentUser) { router.push('/login'); return; }
      const userData = await getUserData(currentUser.uid);
      if (userData) setUser(userData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-2xl text-gray-600">Lädt...</div></div>;
  if (!user) return null;

  const categories = ['alle', ...Array.from(new Set(examples.map(e => e.category)))];
  const filtered = activeCategory === 'alle' ? examples : examples.filter(e => e.category === activeCategory);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Seite 3</div>
              <h1 className="text-2xl font-bold">Umsetzungsbeispiele</h1>
              <p className="text-gray-600">Fertige Beispiele, die du direkt in Fobizz verwenden kannst</p>
            </div>
          </div>
        </motion.div>

        <Navigation />

        {/* Intro */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 mb-6">
          <p className="text-gray-700 leading-relaxed">
            Hier findest du konkrete Beispiele, die du direkt in Fobizz einsetzen kannst.
            Kopiere die Prompts per Klick und füge sie in den Fobizz KI-Assistenten ein.
            Zu jedem Beispiel gibt es einen direkten Link zu einem fertigen Fobizz-Material.
          </p>
        </motion.div>

        {/* Kategorie-Filter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all capitalize ${
                activeCategory === cat
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white/60 text-gray-700 hover:bg-white border border-white/40'
              }`}>
              {cat === 'alle' ? 'Alle Kategorien' : cat}
            </button>
          ))}
        </motion.div>

        {/* Beispiele */}
        <div className="space-y-6">
          {filtered.map((example, i) => (
            <motion.div key={example.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.07 }}
              className="glass-card rounded-2xl overflow-hidden">
              {/* Card Header */}
              <div className={`px-6 py-4 ${example.headerBg} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{example.emoji}</span>
                  <div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${example.tagBg} ${example.tagText} mr-2`}>
                      {example.category}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-white/60 text-gray-600`}>
                      {example.fach}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {example.fobizzUrl && (
                    <a href={example.fobizzUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/80 text-gray-700 rounded-lg text-xs font-semibold hover:bg-white transition-colors">
                      <ExternalLink className="w-3 h-3" />
                      In Fobizz öffnen
                    </a>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{example.title}</h3>
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">{example.description}</p>

                {/* Prompt */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">KI-Prompt (kopieren & in Fobizz einfügen)</span>
                    <button onClick={() => handleCopy(example.id, example.prompt)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        copiedId === example.id
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      }`}>
                      {copiedId === example.id ? <><Check className="w-3 h-3" /> Kopiert!</> : <><Copy className="w-3 h-3" /> Prompt kopieren</>}
                    </button>
                  </div>
                  <p className="text-gray-800 text-sm leading-relaxed font-mono whitespace-pre-wrap">{example.prompt}</p>
                </div>

                {/* Verwendungshinweis */}
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-blue-500 mt-0.5">💡</span>
                  <p className="text-blue-800 text-xs leading-relaxed">{example.tip}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const examples = [
  {
    id: 'ex1',
    emoji: '📝',
    category: 'Arbeitsblatt',
    fach: 'Fächerübergreifend',
    headerBg: 'bg-gradient-to-r from-blue-50 to-primary-50',
    tagBg: 'bg-blue-100', tagText: 'text-blue-700',
    title: 'Differenziertes Arbeitsblatt erstellen',
    description: 'Erstelle mit einem Prompt ein Arbeitsblatt auf drei verschiedenen Niveaustufen – für heterogene Klassen.',
    prompt: `Erstelle ein Arbeitsblatt zum Thema [THEMA EINFÜGEN] für [KLASSE/STUFE].
Das Arbeitsblatt soll auf drei Niveaustufen erscheinen:
- Basis: Einfache Aufgaben mit Unterstützung (Lückentexte, Multiple Choice)
- Standard: Mittlere Anforderungen mit Anleitung
- Erweitert: Komplexere Aufgaben mit Transferleistung

Sprache: Deutsch, altersgerecht für [ALTER]
Umfang: je Niveau 3–4 Aufgaben`,
    tip: 'Ersetze [THEMA EINFÜGEN], [KLASSE/STUFE] und [ALTER] durch deine spezifischen Angaben. Fobizz formatiert das Ergebnis direkt als druckfertiges Arbeitsblatt.',
    fobizzUrl: 'https://fobizz.com'
  },
  {
    id: 'ex2',
    emoji: '❓',
    category: 'Quiz',
    fach: 'Fächerübergreifend',
    headerBg: 'bg-gradient-to-r from-green-50 to-accent-50',
    tagBg: 'bg-green-100', tagText: 'text-green-700',
    title: 'Interaktives Quiz generieren',
    description: 'Lass Fobizz ein sofort einsetzbares Quiz zu jedem Thema erstellen – mit automatischer Auswertung.',
    prompt: `Erstelle ein Quiz zum Thema [THEMA] mit 10 Fragen für [KLASSE/STUFE].
Mischung: 5 Multiple-Choice-Fragen (je 4 Antwortoptionen), 3 Wahr/Falsch-Fragen, 2 offene Kurzantwort-Fragen.
Schwierigkeit: [leicht / mittel / anspruchsvoll]
Füge bei jeder Frage eine kurze Erklärung der richtigen Antwort hinzu.`,
    tip: 'In Fobizz kannst du das Quiz direkt als interaktive Version exportieren, die Schülerinnen und Schüler am eigenen Gerät lösen können.',
    fobizzUrl: 'https://fobizz.com'
  },
  {
    id: 'ex3',
    emoji: '🗺️',
    category: 'Mindmap',
    fach: 'Fächerübergreifend',
    headerBg: 'bg-gradient-to-r from-violet-50 to-purple-50',
    tagBg: 'bg-violet-100', tagText: 'text-violet-700',
    title: 'Strukturierte Mindmap erstellen',
    description: 'Generiere eine fertige Mindmap-Struktur zu einem Thema, die du in Fobizz direkt bearbeiten und teilen kannst.',
    prompt: `Erstelle eine strukturierte Mindmap zum Thema [THEMA] für [FACH, KLASSE].
Hauptast: [THEMA]
Mindestens 5 Hauptäste mit je 3–4 Unterästen.
Füge bei jedem Ast ein passendes Beispiel oder einen Merksatz hinzu.
Geeignet als Lernzusammenfassung / Einstieg / Wiederholung.`,
    tip: 'Nach dem Generieren kannst du die Mindmap in Fobizz direkt visuell bearbeiten und Farben, Icons und eigene Notizen hinzufügen.',
    fobizzUrl: 'https://fobizz.com'
  },
  {
    id: 'ex4',
    emoji: '💬',
    category: 'Szenario',
    fach: 'Sprachen / Sozialkunde',
    headerBg: 'bg-gradient-to-r from-pink-50 to-rose-50',
    tagBg: 'bg-pink-100', tagText: 'text-pink-700',
    title: 'WhatsApp-Dialog / Chat-Szenario',
    description: 'Erstelle einen authentischen WhatsApp-Chat als Einstieg, Diskussionsgrundlage oder Textbasis.',
    prompt: `Erstelle einen realistischen WhatsApp-Chat zwischen zwei Jugendlichen (Name 1: [NAME], Name 2: [NAME]) zum Thema [THEMA].
Kontext: [KURZE SITUATIONSBESCHREIBUNG]
Länge: ca. 15–20 Nachrichten
Sprache: Jugendsprache, authentisch, altersgerecht für [ALTER]
Ziel: Als Diskussionsgrundlage im Unterricht zu [UNTERRICHTSZIEL]`,
    tip: 'Fobizz kann diesen Chat als visuelles WhatsApp-Format anzeigen – ideal als Einstieg, Rollenspiel-Vorlage oder zur Textanalyse.',
    fobizzUrl: 'https://fobizz.com'
  },
  {
    id: 'ex5',
    emoji: '📊',
    category: 'Infografik',
    fach: 'Fächerübergreifend',
    headerBg: 'bg-gradient-to-r from-teal-50 to-cyan-50',
    tagBg: 'bg-teal-100', tagText: 'text-teal-700',
    title: 'Lerninfografik / Erklärgrafik',
    description: 'Lass dir Inhalte als visuell ansprechende Infografik aufbereiten – als Lernposter oder Zusammenfassung.',
    prompt: `Erstelle eine Infografik zu [THEMA] für [KLASSE/STUFE].
Inhalt: Die 5 wichtigsten Fakten / Schritte / Konzepte zu [THEMA]
Stil: Klar, übersichtlich, mit Überschriften, Symbolen und kurzen Erklärungen
Verwendung: Als Lernposter im Klassenzimmer / als Handout / als digitale Zusammenfassung
Sprache: [Deutsch / Englisch / ...]`,
    tip: 'Fobizz generiert die Infografik als druckfertiges PDF. Du kannst Farben und Layout im Anschluss anpassen.',
    fobizzUrl: 'https://fobizz.com'
  },
  {
    id: 'ex6',
    emoji: '📖',
    category: 'Erklärung',
    fach: 'Fächerübergreifend',
    headerBg: 'bg-gradient-to-r from-orange-50 to-amber-50',
    tagBg: 'bg-orange-100', tagText: 'text-orange-700',
    title: 'Altersgerechte Erklärung erstellen',
    description: 'Komplexe Themen einfach erklärt – auf genau dem richtigen Niveau für deine Klasse.',
    prompt: `Erkläre das Konzept [THEMA/KONZEPT] für [KLASSE/ALTER].
Stil: Einfach, anschaulich, mit Alltagsbeispielen und Analogien
Länge: ca. 200–300 Wörter
Füge am Ende 3 Verständnisfragen hinzu, die die Schülerinnen und Schüler selbst beantworten können.
Vermeide Fachbegriffe (oder erkläre sie in Klammern).`,
    tip: 'Perfekt als Einstiegstext, für eine Flipped-Classroom-Einheit oder zum Selbststudium. In Fobizz direkt als Lernkarte exportierbar.',
    fobizzUrl: 'https://fobizz.com'
  },
];
