'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, UserPlus, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { registerParticipant, loginParticipantWithCode, loginAdmin } from '@/lib/auth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdminMode = searchParams.get('mode') === 'admin';

  const [mode, setMode] = useState<'register' | 'login' | 'admin'>(
    isAdminMode ? 'admin' : 'register'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newUserCode, setNewUserCode] = useState('');

  const [username, setUsername] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { code } = await registerParticipant(username);
      setNewUserCode(code);
    } catch (err: any) {
      setError(err.message || 'Fehler bei der Registrierung');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginParticipantWithCode(loginCode);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Fehler beim Anmelden');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginAdmin(adminEmail, adminPassword);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Fehler beim Admin-Login');
    } finally {
      setLoading(false);
    }
  };

  if (newUserCode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-8 md:p-12 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserPlus className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Account erstellt! 🎉</h1>
          <p className="text-gray-600 mb-2">Willkommen, <strong>{username}</strong>!</p>
          <p className="text-gray-600 mb-6">Dein persönlicher Code:</p>
          <div className="bg-gradient-to-br from-primary-50 to-accent-50 border-4 border-dashed border-primary-300 rounded-2xl p-6 mb-8">
            <div className="text-5xl font-mono font-bold text-primary-600 tracking-wider">
              {newUserCode}
            </div>
            <p className="text-sm text-gray-600 mt-2">Notiere dir diesen Code – du brauchst ihn zum Anmelden!</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            Zum Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Zurück zur Startseite
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8"
        >
          <h1 className="text-3xl font-bold text-center mb-2 gradient-text">
            {mode === 'admin' ? 'Admin-Login' : 'Willkommen'}
          </h1>
          <p className="text-center text-gray-600 mb-8">
            {mode === 'admin' ? 'Administrator-Zugang' : 'Fobizz Weiterbildung'}
          </p>

          {mode !== 'admin' && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  mode === 'register'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Neu registrieren
              </button>
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  mode === 'login'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Mit Code anmelden
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* Register Form – nur Name, keine Gruppe */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dein Name
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onInput={(e) => setUsername((e.target as HTMLInputElement).value)}
                  maxLength={30}
                  required
                  autoComplete="off"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                  placeholder="Max Mustermann"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Du erhältst nach der Registrierung einen persönlichen Code zum Anmelden.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Wird erstellt...' : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Account erstellen
                  </>
                )}
              </button>
            </form>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dein Code
                </label>
                <input
                  type="text"
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors text-center text-2xl font-mono tracking-wider uppercase"
                  placeholder="ABC123"
                />
              </div>

              <button
                type="submit"
                disabled={loading || loginCode.length !== 6}
                className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Anmelden...' : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Anmelden
                  </>
                )}
              </button>
            </form>
          )}

          {/* Admin Form */}
          {mode === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Passwort
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Anmelden...' : (
                  <>
                    <Shield className="w-5 h-5" />
                    Admin-Login
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className="w-full text-gray-600 text-sm hover:text-gray-900 transition-colors"
              >
                Zurück zur normalen Anmeldung
              </button>
            </form>
          )}

          {mode !== 'admin' && (
            <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
              <button
                onClick={() => { setMode('admin'); setError(''); }}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Admin-Login
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-2xl text-gray-600">Lädt...</div></div>}>
      <LoginContent />
    </Suspense>
  );
}
