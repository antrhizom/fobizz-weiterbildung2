'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { onAuthChange, getUserData } from '@/lib/auth';
import { User } from '@/types';
import Navigation from '@/components/Navigation';
import { GraduationCap, Shield, Zap, Users, BookOpen, Smartphone, ExternalLink, Play, ChevronRight } from 'lucide-react';

export default function WasIstFobizzPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (!currentUser) { router.push('/login'); return; }
      const userData = await getUserData(currentUser.uid);
      if (userData) setUser(userData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-2xl text-gray-600">Lädt...</div></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Seite 1</div>
              <h1 className="text-2xl font-bold">Was ist Fobizz?</h1>
              <p className="text-gray-600">Die KI-Plattform für Lehrpersonen – ein Überblick</p>
            </div>
          </div>
        </motion.div>

        <Navigation />

        {/* Intro */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 gradient-text">Die Plattform im Überblick</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Fobizz</strong> ist eine digitale Lernplattform, die speziell für den Bildungsbereich entwickelt wurde.
            Sie bietet Lehrpersonen Zugang zu KI-gestützten Werkzeugen, einem Materialienpool und Kollaborationsfunktionen –
            und das alles vollständig <strong>datenschutzkonform nach DSGVO</strong>.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Im Gegensatz zu allgemeinen KI-Diensten wie ChatGPT ist Fobizz auf die Bedürfnisse von Schulen ausgerichtet:
            Keine Weitergabe von Schülerdaten, keine Werbung, kein Training der KI mit euren Inhalten.
          </p>
        </motion.div>

        {/* Kernfunktionen */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Kernfunktionen von Fobizz</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                className="bg-white/60 rounded-xl p-5 border border-white/40 flex gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${f.bg}`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Werkzeuge im Detail */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Fobizz-Werkzeuge im Detail</h2>
          <div className="space-y-4">
            {tools.map((tool, i) => (
              <div key={i} className="bg-white/60 rounded-xl p-5 border border-white/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tool.emoji}</span>
                    <h3 className="font-bold text-gray-800">{tool.name}</h3>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${tool.tagBg} ${tool.tagText}`}>
                    {tool.tag}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed ml-9">{tool.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Lizenzmodell */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Zugang & Lizenzmodell</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {licenseTypes.map((lic, i) => (
              <div key={i} className={`rounded-xl p-5 border-2 ${lic.border} ${lic.bg}`}>
                <div className="text-2xl mb-2">{lic.emoji}</div>
                <h3 className={`font-bold mb-2 ${lic.titleColor}`}>{lic.title}</h3>
                <ul className="space-y-1">
                  {lic.features.map((f, j) => (
                    <li key={j} className="text-sm text-gray-700 flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-xl">
            <p className="text-primary-800 text-sm">
              <strong>Für diese Weiterbildung:</strong> Du hast Zugang zu einem Fobizz-Pro-Account über die Schullizenz.
              Die Registrierung erfolgt in Aufgabe 1 auf der Aufgaben-Seite.
            </p>
          </div>
        </motion.div>

        {/* Weiterführende Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-primary-600" />
            Weiterführende Ressourcen
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {links.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-white/40 hover:border-primary-300 hover:bg-primary-50 transition-all group">
                <span className="text-2xl">{link.emoji}</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 group-hover:text-primary-700">{link.title}</div>
                  <div className="text-xs text-gray-500">{link.subtitle}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const features = [
  { icon: Zap, bg: 'bg-gradient-to-br from-amber-500 to-orange-500', title: 'KI-Assistent', description: 'Erstelle Unterrichtsmaterialien, Erklärungen und Aufgaben mit KI-Unterstützung – in Sekunden.' },
  { icon: Shield, bg: 'bg-gradient-to-br from-green-500 to-emerald-600', title: 'DSGVO-konform', description: 'Alle Daten bleiben in der EU. Keine Weitergabe an Dritte, kein KI-Training mit euren Inhalten.' },
  { icon: BookOpen, bg: 'bg-gradient-to-br from-blue-500 to-primary-600', title: 'Materialienpool', description: 'Tausende fertige Unterrichtsmaterialien von Lehrpersonen für Lehrpersonen – direkt einsetzbar.' },
  { icon: Users, bg: 'bg-gradient-to-br from-violet-500 to-purple-600', title: 'Kollaboration', description: 'Teile Materialien mit dem Kollegium, erstelle gemeinsame Kurse und profitiere von Peer-Learning.' },
  { icon: Smartphone, bg: 'bg-gradient-to-br from-pink-500 to-rose-500', title: 'Überall verfügbar', description: 'Browserbasiert, kein Download nötig. Funktioniert auf PC, Tablet und Smartphone.' },
  { icon: Play, bg: 'bg-gradient-to-br from-teal-500 to-cyan-600', title: 'Interaktive Aufgaben', description: 'Quizze, Lückentexte, Mindmaps, WhatsApp-Dialoge – vielfältige interaktive Formate.' },
];

const tools = [
  { emoji: '🤖', name: 'KI-Chat (Fobizz-KI)', tag: 'KI', tagBg: 'bg-amber-100', tagText: 'text-amber-700', description: 'Ein datenschutzkonformer KI-Assistent, vergleichbar mit ChatGPT, aber speziell für Schulen. Erstelle Erklärungen, Aufgaben, Lösungsblätter oder lass dir Ideen vorschlagen.' },
  { emoji: '📝', name: 'Aufgaben-Generator', tag: 'Material', tagBg: 'bg-blue-100', tagText: 'text-blue-700', description: 'Erstelle automatisch differenzierte Aufgaben auf verschiedenen Niveaustufen zu jedem Thema – mit einem Klick.' },
  { emoji: '🎨', name: 'Bild-KI', tag: 'KI', tagBg: 'bg-amber-100', tagText: 'text-amber-700', description: 'Generiere Illustrationen, Diagramme und Bilder für den Unterricht – ohne Copyright-Probleme.' },
  { emoji: '📊', name: 'Infografik-Tool', tag: 'Material', tagBg: 'bg-blue-100', tagText: 'text-blue-700', description: 'Erstelle ansprechende Infografiken und Lernplakate direkt in der Plattform.' },
  { emoji: '❓', name: 'Quiz-Builder', tag: 'Interaktiv', tagBg: 'bg-green-100', tagText: 'text-green-700', description: 'Baue interaktive Quizze und Lernkontrollen, die Schülerinnen und Schüler direkt im Browser lösen können.' },
  { emoji: '🗺️', name: 'Mindmap', tag: 'Interaktiv', tagBg: 'bg-green-100', tagText: 'text-green-700', description: 'Erstelle kollaborative Mindmaps für Brainstorming, Zusammenfassungen oder Wissenslandkarten.' },
];

const licenseTypes = [
  {
    emoji: '🆓', title: 'Kostenlos', border: 'border-gray-200', bg: 'bg-gray-50', titleColor: 'text-gray-700',
    features: ['Basis-KI-Funktionen', 'Begrenzte Materialmenge', 'Einzelnutzung', 'Für erste Schritte geeignet']
  },
  {
    emoji: '⭐', title: 'Pro (Einzellizenz)', border: 'border-primary-300', bg: 'bg-primary-50', titleColor: 'text-primary-700',
    features: ['Alle KI-Werkzeuge', 'Unbegrenzte Materialien', 'Erweiterte Funktionen', 'CHF ~10/Monat']
  },
  {
    emoji: '🏫', title: 'Schullizenz', border: 'border-accent-300', bg: 'bg-accent-50', titleColor: 'text-accent-700',
    features: ['Für ganzes Kollegium', 'Admin-Verwaltung', 'Günstigster Preis/Person', 'Empfohlen für Schulen']
  },
];

const links = [
  { emoji: '🌐', title: 'Fobizz Webseite', subtitle: 'fobizz.com – Offizieller Auftritt', url: 'https://fobizz.com' },
  { emoji: '📖', title: 'Fobizz Hilfe-Center', subtitle: 'Anleitungen & Tutorials', url: 'https://fobizz.com/hilfe' },
  { emoji: '▶️', title: 'Einführungsvideo', subtitle: 'Fobizz in 5 Minuten erklärt', url: 'https://fobizz.com' },
  { emoji: '📚', title: 'Materialienpool', subtitle: 'Fertige Unterrichtsmaterialien', url: 'https://fobizz.com' },
];
