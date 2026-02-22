'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { onAuthChange, getUserData } from '@/lib/auth';
import { getAllUsers } from '@/lib/firestore';
import { User } from '@/types';
import { TASKS } from '@/lib/constants';
import Navigation from '@/components/Navigation';
import { Info, BookOpen, Lightbulb, CheckSquare, ArrowRight, Users, TrendingUp, MessageSquare, Award } from 'lucide-react';
import Link from 'next/link';

// Nur Aufgaben-Keys zählen (Format: "1-0", "2-3", etc.)
function countTaskSubtasks(completedSubtasks: Record<string, string> | undefined): number {
  return Object.keys(completedSubtasks || {}).filter(k => /^\d+-\d+$/.test(k)).length;
}

// Lernbereich-Bestätigungen zählen
const SECTION_CONFIRM_KEYS = [
  'fobizz-q1', 'fobizz-q2', 'fobizz-q3', 'fobizz-q4', // Was ist Fobizz?
  'paed-q1', 'paed-q2', 'paed-q3', 'paed-q4',           // Pädagogik
  'bsp-q1', 'bsp-q2', 'bsp-q3',                         // Beispiele
];

// Hat der User ein "Zertifikat ausgestellt" (Name gespeichert wäre ideal, aber wir prüfen ob >0% Fortschritt)
// Proxy: User hat mindestens 1 Subtask erledigt
function userHasProgress(u: User): boolean {
  return countTaskSubtasks(u.completedSubtasks) > 0 ||
    SECTION_CONFIRM_KEYS.some(k => u.completedSubtasks?.[k]);
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (!currentUser) { router.push('/login'); return; }
      const [userData, users] = await Promise.all([
        getUserData(currentUser.uid),
        getAllUsers()
      ]);
      if (userData) setUser(userData);
      setAllUsers(users);
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
  const totalSectionConfirms = SECTION_CONFIRM_KEYS.length;
  const totalAll = totalSubtasks + totalSectionConfirms;

  // Eigener Fortschritt (nur Aufgaben-Subtasks)
  const myTaskDone = countTaskSubtasks(user.completedSubtasks);
  const mySectionDone = SECTION_CONFIRM_KEYS.filter(k => user.completedSubtasks?.[k]).length;
  const myTotalDone = myTaskDone + mySectionDone;
  const progress = Math.round((myTotalDone / totalAll) * 100);

  // Lernbereiche – Fortschritt pro Modul (Bestätigungen)
  const moduleProgress: Record<string, number> = {
    '/was-ist-fobizz': Math.round(
      (['fobizz-q1','fobizz-q2','fobizz-q3','fobizz-q4'].filter(k => user.completedSubtasks?.[k]).length / 4) * 100
    ),
    '/paedagogik': Math.round(
      (['paed-q1','paed-q2','paed-q3','paed-q4'].filter(k => user.completedSubtasks?.[k]).length / 4) * 100
    ),
    '/beispiele': Math.round(
      (['bsp-q1','bsp-q2','bsp-q3'].filter(k => user.completedSubtasks?.[k]).length / 3) * 100
    ),
    '/aufgaben': Math.round((myTaskDone / totalSubtasks) * 100),
  };

  // Globale Statistik (nur fobizz_users – allUsers enthält nur diese)
  const totalParticipants = allUsers.length;
  const avgProgress = totalParticipants > 0
    ? Math.round(
        allUsers.reduce((acc, u) => {
          const taskDone = countTaskSubtasks(u.completedSubtasks);
          const sectionDone = SECTION_CONFIRM_KEYS.filter(k => u.completedSubtasks?.[k]).length;
          return acc + ((taskDone + sectionDone) / totalAll) * 100;
        }, 0) / totalParticipants
      )
    : 0;

  // Zertifikate: User mit mind. 50% Gesamtfortschritt als Proxy für "aktiv dabei"
  const certificatesIssued = allUsers.filter(u => {
    const taskDone = countTaskSubtasks(u.completedSubtasks);
    const sectionDone = SECTION_CONFIRM_KEYS.filter(k => u.completedSubtasks?.[k]).length;
    return ((taskDone + sectionDone) / totalAll) >= 1.0;
  }).length;

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

        {/* Statistik: Ø Fortschritt + Zertifikate */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6 text-center">
            <TrendingUp className="w-8 h-8 text-accent-600 mx-auto mb-3" />
            <div className="text-4xl font-bold gradient-text mb-1">{avgProgress}%</div>
            <div className="text-gray-600 text-sm">Ø Fortschritt aller {totalParticipants} Teilnehmenden</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 text-center">
            <Award className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <div className="text-4xl font-bold gradient-text mb-1">{certificatesIssued}</div>
            <div className="text-gray-600 text-sm">Vollständig abgeschlossen</div>
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
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-2">
                          <div
                            style={{ width: `${pct}%` }}
                            className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-400' : mod.barColor}`}
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
    barColor: 'bg-gradient-to-r from-blue-400 to-primary-500',
    title: 'Was ist Fobizz?',
  },
  {
    href: '/paedagogik',
    icon: BookOpen,
    bg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    badge: 'Seite 2',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-700',
    barColor: 'bg-gradient-to-r from-violet-400 to-purple-500',
    title: 'Pädagogik & Didaktik',
  },
  {
    href: '/beispiele',
    icon: Lightbulb,
    bg: 'bg-gradient-to-br from-amber-500 to-orange-500',
    badge: 'Seite 3',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    barColor: 'bg-gradient-to-r from-amber-400 to-orange-400',
    title: 'Umsetzungsbeispiele',
  },
  {
    href: '/aufgaben',
    icon: CheckSquare,
    bg: 'bg-gradient-to-br from-green-500 to-accent-600',
    badge: 'Seite 4',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-700',
    barColor: 'bg-gradient-to-r from-green-400 to-accent-500',
    title: 'Deine Aufgaben',
  }
];
