'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { onAuthChange, getUserData } from '@/lib/auth';
import { getAllUsers } from '@/lib/firestore';
import { User } from '@/types';
import { TASKS } from '@/lib/constants';
import Navigation from '@/components/Navigation';
import { Info, BookOpen, Lightbulb, CheckSquare, ArrowRight, Users, TrendingUp, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Lädt Dashboard...</div>
      </div>
    );
  }

  if (!user) return null;

  const totalSubtasks = TASKS.reduce((acc, task) => acc + task.subtasks.length, 0);
  const completedSubtasks = Object.keys(user.completedSubtasks || {}).length;
  const progress = Math.round((completedSubtasks / totalSubtasks) * 100);

  // Gesamtfortschritt aller Teilnehmenden
  const totalParticipants = allUsers.length;
  const avgProgress = totalParticipants > 0
    ? Math.round(
        allUsers.reduce((acc, u) => {
          const done = Object.keys(u.completedSubtasks || {}).length;
          return acc + (done / totalSubtasks) * 100;
        }, 0) / totalParticipants
      )
    : 0;

  // Aufgaben-Abschlussquoten
  const taskCompletionRates = TASKS.map(task => {
    const completedCount = allUsers.filter(u =>
      task.subtasks.every((_, i) => u.completedSubtasks?.[`${task.id}-${i}`])
    ).length;
    return {
      task,
      completed: completedCount,
      pct: totalParticipants > 0 ? Math.round((completedCount / totalParticipants) * 100) : 0
    };
  });

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold">Hallo, {user.username}! 👋</h1>
              <p className="text-gray-600">Fobizz Weiterbildung – Dein Lernbereich</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Dein Fortschritt</div>
              <div className="text-3xl font-bold gradient-text">{progress}%</div>
              <div className="text-xs text-gray-500">{completedSubtasks} / {totalSubtasks} Aufgaben</div>
            </div>
          </div>

          {/* Eigener Fortschrittsbalken */}
          <div className="mt-4">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        <Navigation />

        {/* Globale Statistik */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6 text-center"
          >
            <Users className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <div className="text-4xl font-bold gradient-text mb-1">{totalParticipants}</div>
            <div className="text-gray-600 text-sm">Teilnehmende</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 text-center"
          >
            <TrendingUp className="w-8 h-8 text-accent-600 mx-auto mb-3" />
            <div className="text-4xl font-bold gradient-text mb-1">{avgProgress}%</div>
            <div className="text-gray-600 text-sm">Ø Fortschritt aller</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6 text-center"
          >
            <CheckSquare className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <div className="text-4xl font-bold gradient-text mb-1">
              {taskCompletionRates.filter(r => r.pct >= 50).length}
            </div>
            <div className="text-gray-600 text-sm">Aufgaben von ≥50% abgeschlossen</div>
          </motion.div>
        </div>

        {/* 4 Lernbereiche */}
        <h2 className="text-2xl font-bold mb-4 gradient-text">Deine Lernbereiche</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
            >
              <Link href={mod.href} className="block group">
                <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 h-full">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${mod.bg}`}>
                      <mod.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${mod.badgeBg} ${mod.badgeText}`}>
                          {mod.badge}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{mod.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{mod.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Aufgaben-Abschlussquoten */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-8 mb-6"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            Fortschritt aller Teilnehmenden – Aufgabenübersicht
          </h2>
          <div className="space-y-4">
            {taskCompletionRates.map(({ task, completed, pct }, idx) => {
              const isMyCompleted = task.subtasks.every((_, i) =>
                user.completedSubtasks?.[`${task.id}-${i}`]
              );
              return (
                <div key={task.id} className="bg-white/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{task.iconEmoji}</span>
                      <div>
                        <span className="font-semibold text-gray-800 text-sm">
                          {idx + 1}. {task.title}
                        </span>
                        {isMyCompleted && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            ✓ du
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-700">
                      {completed}/{totalParticipants} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Pinnwand Quick-Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/pinnwand">
            <div className="glass-card rounded-2xl p-6 flex items-center gap-4 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">Zur Pinnwand</h3>
                <p className="text-gray-600 text-sm">Teile deine Erfahrungen und Fragen mit anderen Teilnehmenden</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </motion.div>
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
    title: 'Was ist Fobizz?',
    description: 'Lerne die Plattform kennen: Funktionen, Werkzeuge und warum Fobizz speziell für Lehrpersonen entwickelt wurde.'
  },
  {
    href: '/paedagogik',
    icon: BookOpen,
    bg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    badge: 'Seite 2',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-700',
    title: 'Pädagogik & Didaktik',
    description: 'Didaktische Grundlagen zum Einsatz von KI und Fobizz im Unterricht – Lernziele, Methodik und Reflexion.'
  },
  {
    href: '/beispiele',
    icon: Lightbulb,
    bg: 'bg-gradient-to-br from-amber-500 to-orange-500',
    badge: 'Seite 3',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    title: 'Umsetzungsbeispiele',
    description: 'Fertige Beispiele, die du direkt im Unterricht einsetzen kannst – von Arbeitsblättern bis Quizzen.'
  },
  {
    href: '/aufgaben',
    icon: CheckSquare,
    bg: 'bg-gradient-to-br from-green-500 to-accent-600',
    badge: 'Seite 4',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-700',
    title: 'Deine Aufgaben',
    description: 'Erstelle selbst Materialien mit Fobizz. Verfolge deinen Fortschritt mit der interaktiven Checkliste.'
  }
];
