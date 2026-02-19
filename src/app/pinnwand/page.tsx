'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { onAuthChange, getUserData } from '@/lib/auth';
import { createComment, getAllComments, deleteComment } from '@/lib/firestore';
import { User, Comment } from '@/types';
import Navigation from '@/components/Navigation';
import { MessageSquare, Trash2, Send } from 'lucide-react';

export default function PinnwandPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (!currentUser) { router.push('/login'); return; }
      const [userData, commentsData] = await Promise.all([
        getUserData(currentUser.uid),
        getAllComments()
      ]);
      if (userData) setUser(userData);
      setComments(commentsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    setSubmitting(true);
    try {
      await createComment({
        userId: user.userId,
        username: user.username,
        text: newComment.trim(),
        timestamp: new Date().toISOString()
      });
      setComments(await getAllComments());
      setNewComment('');
    } catch { alert('Fehler beim Posten des Kommentars'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Kommentar wirklich löschen?')) return;
    try {
      await deleteComment(commentId);
      setComments(await getAllComments());
    } catch { alert('Fehler beim Löschen'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-2xl text-gray-600">Lädt Pinnwand...</div></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pinnwand</h1>
              <p className="text-gray-600">Angemeldet als <strong>{user.username}</strong></p>
            </div>
          </div>
        </motion.div>

        <Navigation />

        {/* Pinnwand Intro */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <p className="text-gray-700">
            Teile deine Gedanken, Fragen und Erfahrungen aus der Weiterbildung!
            Alle Teilnehmenden können lesen und antworten.
          </p>
        </div>

        {/* Kommentar-Formular */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Schreibe einen Kommentar, eine Frage oder eine Erfahrung..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none mb-3"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{newComment.length} / 500</span>
              <button type="submit"
                disabled={submitting || !newComment.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                <Send className="w-4 h-4" />
                {submitting ? 'Wird gepostet...' : 'Kommentar posten'}
              </button>
            </div>
          </form>
        </div>

        {/* Kommentare */}
        <div className="glass-card rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-600" />
            Alle Kommentare ({comments.length})
          </h3>

          {comments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Noch keine Kommentare vorhanden.</p>
              <p className="text-sm mt-2">Sei die erste Person und teile deine Gedanken!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment, idx) => {
                const isOwn = comment.userId === user.userId;
                // Generiere eine konsistente Farbe basierend auf dem Username
                const colorIndex = comment.username.charCodeAt(0) % avatarColors.length;
                const avatarColor = avatarColors[colorIndex];

                return (
                  <motion.div key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`bg-white/50 rounded-xl p-5 border-l-4 ${isOwn ? 'border-primary-400' : 'border-gray-300'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${avatarColor}`}>
                          {comment.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 flex items-center gap-2">
                            {comment.username}
                            {isOwn && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">Du</span>}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleDateString('de-DE', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      {isOwn && (
                        <button onClick={() => handleDelete(comment.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Löschen">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed ml-12">
                      {comment.text}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const avatarColors = [
  'bg-primary-500', 'bg-accent-500', 'bg-violet-500', 'bg-amber-500',
  'bg-rose-500', 'bg-teal-500', 'bg-orange-500', 'bg-indigo-500',
];
