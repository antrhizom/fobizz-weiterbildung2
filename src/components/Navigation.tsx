'use client';

import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, logout, checkIsAdmin } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Info, BookOpen, Lightbulb, CheckSquare, MessageSquare, Shield, LogOut } from 'lucide-react';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const admin = await checkIsAdmin();
      setIsAdmin(admin);
    };
    checkAdmin();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const navItems = isAdmin ? [
    { href: '/admin', icon: Shield, label: 'Admin' },
  ] : [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Übersicht' },
    { href: '/was-ist-fobizz', icon: Info, label: 'Was ist Fobizz?' },
    { href: '/paedagogik', icon: BookOpen, label: 'Pädagogik' },
    { href: '/beispiele', icon: Lightbulb, label: 'Beispiele' },
    { href: '/aufgaben', icon: CheckSquare, label: 'Aufgaben' },
    { href: '/pinnwand', icon: MessageSquare, label: 'Pinnwand' },
  ];

  return (
    <nav className="glass-card rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 flex-wrap">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition-all text-sm ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Abmelden</span>
        </button>
      </div>
    </nav>
  );
}
