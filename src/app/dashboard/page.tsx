'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { onAuthChange, getUserData, logout } from '@/lib/auth';
// getUsersCount nicht mehr verwendet (anonymisiert)
import { User } from '@/types';
import { TASKS } from '@/lib/constants';
import Navigation from '@/components/Navigation';
import { Info, BookOpen, Lightbulb, CheckSquare, ArrowRight, MessageSquare, Award } from 'lucide-react';
import Link from 'next/link';

// Nur Aufgaben-Keys zählen (Format: "1-0", "2-3", etc.)
function countTaskSubtasks(completedSubtasks: Record<string, string> | undefined): number {
  return Object.keys(completedSubtasks || {}).filter(k => /^\d+-\d+$/.test(k)).length;
}

// Aktivitäts- und Bestätigungs-Keys pro Modul
const MODULE_TRACKING = {
  '/was-ist-fobizz': {
    prefixes: ['wif-acc-', 'wif-rev-', 'wif-quiz-'],
    confirms: ['fobizz-q1', 'fobizz-q2', 'fobizz-q3', 'fobizz-q4'],
    totalActivities: 11, totalConfirms: 4,
  },
  '/paedagogik': {
    prefixes: ['paed-acc-', 'paed-rev-', 'paed-quiz-'],
    confirms: ['paed-q1', 'paed-q2', 'paed-q3', 'paed-q4'],
    totalActivities: 14, totalConfirms: 4,
  },
  '/beispiele': {
    prefixes: ['bsp-ex-', 'bsp-quiz-'],
    confirms: ['bsp-q1', 'bsp-q2', 'bsp-q3'],
    totalActivities: 8, totalConfirms: 3,
  },
};

function countModuleProgress(subs: Record<string, string> | undefined, href: string): number {
  const mod = MODULE_TRACKING[href as keyof typeof MODULE_TRACKING];
  if (!mod || !subs) return 0;
  const activityDone = Object.keys(subs).filter(k => mod.prefixes.some(p => k.startsWith(p))).length;
  const confirmDone = mod.confirms.filter(k => subs[k]).length;
  const total = mod.totalActivities + mod.totalConfirms;
  return Math.round(((activityDone + confirmDone) / total) * 100);
}

// Alle zählbaren Keys für Gesamtfortschritt
const ALL_CONFIRM_KEYS = Object.values(MODULE_TRACKING).flatMap(m => m.confirms);
const TOTAL_ACTIVITIES = Object.values(MODULE_TRACKING).reduce((a, m) => a + m.totalActivities, 0);
const TOTAL_CONFIRMS = ALL_CONFIRM_KEYS.length;


export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (!currentUser) { router.push('/login'); return; }
      const userData = await getUserData(currentUser.uid);
      if (!userData) { await logout(); router.push('/login'); return; }
      setUser(userData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl text-gray-600">Lädt Dashboard...</div>
    </div>
  );
  if (!user) return null;

  const totalSubtasks = TASKS.reduce((acc, task) => acc + task.subtasks.length, 0);
  const totalAll = totalSubtasks + TOTAL_ACTIVITIES + TOTAL_CONFIRMS;

  // Eigener Fortschritt
  const subs = user.completedSubtasks || {};
  const myTaskDone = countTaskSubtasks(subs);
  const myActivityDone = Object.keys(subs).filter(k =>
    Object.values(MODULE_TRACKING).some(m => m.prefixes.some(p => k.startsWith(p)))
  ).length;
  const myConfirmDone = ALL_CONFIRM_KEYS.filter(k => subs[k]).length;
  const myTotalDone = myTaskDone + myActivityDone + myConfirmDone;
  const progress = Math.round((myTotalDone / totalAll) * 100);

  // Lernbereiche – Fortschritt pro Modul (Aktivitäten + Bestätigungen)
  const moduleProgress: Record<string, number> = {
    '/was-ist-fobizz': countModuleProgress(subs, '/was-ist-fobizz'),
    '/paedagogik': countModuleProgress(subs, '/paedagogik'),
    '/beispiele': countModuleProgress(subs, '/beispiele'),
    '/aufgaben': totalSubtasks > 0 ? Math.round((myTaskDone / totalSubtasks) * 100) : 0,
  };

  // Erstellte Zertifikate: prüfen ob eigenes Zertifikat erstellt
  const hasCertificate = !!user.completedSubtasks?.['cert-issued'];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold">Hallo, {user.username}! 👋</h1>
              <p className="text-gray-600">Fobizz Weiterbildung – Dein Lernbereich</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Dein Fortschritt</div>
              <div className="text-3xl font-bold gradient-text">{progress}%</div>
              <div className="text-xs text-gray-500">{myTotalDone} / {totalAll} erledigt</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        <Navigation />

        {/* Statistik: Zertifikat */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6 text-center">
            <Award className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <div className="text-4xl font-bold gradient-text mb-1">{hasCertificate ? '✓' : '–'}</div>
            <div className="text-gray-600 text-sm">{hasCertificate ? 'Zertifikat erstellt' : 'Zertifikat ausstehend'}</div>
          </motion.div>
        </div>

        {/* 4 Lernbereiche mit Prozent */}
        <h2 className="text-xl font-bold mb-4 gradient-text">Deine Lernbereiche</h2>
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          {modules.map((mod, i) => {
            const pct = moduleProgress[mod.href] ?? 0;
            return (
              <motion.div key={mod.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}>
                <Link href={mod.href} className="block group">
                  <div className="glass-card rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 h-full">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${mod.bg}`}>
                        <mod.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${mod.badgeBg} ${mod.badgeText}`}>
                            {mod.badge}
                          </span>
                          <span className={`text-sm font-bold ${pct === 100 ? 'text-green-600' : 'text-gray-500'}`}>
                            {pct === 100 ? '✓ ' : ''}{pct}%
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-gray-800 mb-1">{mod.title}</h3>
                        {/* Mini-Fortschrittsbalken */}
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                          <div
                            style={{ width: `${Math.max(pct, pct > 0 ? 5 : 0)}%`, background: pct === 100 ? '#4ade80' : mod.barGradient }}
                            className="h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Quick-Links: Pinnwand + Zertifikat */}
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Link href="/pinnwand">
              <div className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 cursor-pointer">
                <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">Zur Pinnwand</h3>
                  <p className="text-gray-500 text-sm">Teile Erfahrungen und Fragen</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Link href="/zertifikat">
              <div className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 cursor-pointer">
                <div className="w-11 h-11 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">Lernzertifikat</h3>
                  <p className="text-gray-500 text-sm">Dein aktueller Stand: <strong className="text-amber-600">{progress}%</strong></p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </motion.div>
        </div>

      </div>
    </div>
  );
}

const modules = [
  {
    href: '/was-ist-fobizz',
    icon: Info,
    bg: 'bg-gradient-to-br from-blue-500 to-primary-600',
    badge: 'Seite 1',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    barGradient: 'linear-gradient(to right, #60a5fa, #3b82f6)',
    title: 'Was ist Fobizz?',
  },
  {
    href: '/paedagogik',
    icon: BookOpen,
    bg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    badge: 'Seite 2',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-700',
    barGradient: 'linear-gradient(to right, #a78bfa, #9333ea)',
    title: 'Pädagogik & Didaktik',
  },
  {
    href: '/beispiele',
    icon: Lightbulb,
    bg: 'bg-gradient-to-br from-amber-500 to-orange-500',
    badge: 'Seite 3',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    barGradient: 'linear-gradient(to right, #fbbf24, #f97316)',
    title: 'Umsetzungsbeispiele',
  },
  {
    href: '/aufgaben',
    icon: CheckSquare,
    bg: 'bg-gradient-to-br from-green-500 to-accent-600',
    badge: 'Seite 4',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-700',
    barGradient: 'linear-gradient(to right, #4ade80, #22c55e)',
    title: 'Deine Aufgaben',
  }
];
