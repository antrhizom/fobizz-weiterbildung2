'use client'

import { motion } from 'framer-motion'
import { BookOpen, Users, BarChart3, MessageSquare, Sparkles, Lightbulb, Brain, Target, Zap, GraduationCap, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [introOpen, setIntroOpen] = useState(false)

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-float" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Fobizz Logo / Brand */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-9 h-9 text-white" />
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-bold mb-6">
              <span className="gradient-text">Fobizz</span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-700 mb-4 font-medium">
              Weiterbildung
            </p>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              KI-gestützte Lernplattform für Lehrpersonen – entdecke, wie Fobizz deinen Unterricht bereichert
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/login"
              className="group relative px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              <span className="relative z-10">Jetzt starten</span>
              <div className="absolute inset-0 bg-primary-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="/login?mode=admin"
              className="px-8 py-4 glass-card rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-gray-700"
            >
              Admin-Login
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pädagogisch-didaktische Einleitung */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-3xl overflow-hidden"
          >
            {/* Header – immer sichtbar */}
            <button
              onClick={() => setIntroOpen(!introOpen)}
              className="w-full p-8 text-left flex items-center justify-between gap-4 hover:bg-white/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold gradient-text">
                    Pädagogisch-didaktische Einleitung
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Lernziele, Methodik und Aufbau dieser Weiterbildung
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-6 h-6 text-gray-500 flex-shrink-0 transition-transform duration-300 ${introOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Aufklappbarer Inhalt */}
            {introOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="px-8 pb-8 border-t border-white/30"
              >
                <div className="pt-6 space-y-8">
                  {/* Lernziele */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary-600" />
                      Lernziele
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      {learningGoals.map((goal, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary-500 font-bold mt-0.5">✓</span>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Didaktischer Ansatz */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-accent-600" />
                      Didaktischer Ansatz
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Diese Weiterbildung folgt dem Prinzip des <strong>erfahrungsbasierten Lernens</strong>
                      {' '}(Experiential Learning nach Kolb). Du lernst Fobizz nicht durch Zuhören, sondern durch
                      aktives Ausprobieren, Reflektieren und Anwenden. Die Aufgaben sind so gestaltet, dass du
                      direkt praxisrelevante Materialien für deinen eigenen Unterricht erstellst.
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-3">
                      Der <strong>Scaffolding-Ansatz</strong> stellt sicher, dass komplexere Werkzeuge schrittweise
                      eingeführt werden. Jede Lerneinheit baut auf der vorherigen auf. Gruppenarbeiten fördern
                      den kollegialen Austausch und ermöglichen Peer-Learning.
                    </p>
                  </div>

                  {/* Methodischer Aufbau */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary-600" />
                      Methodischer Aufbau
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {methodPhases.map((phase, i) => (
                        <div key={i} className="bg-white/50 rounded-2xl p-4 border border-white/40">
                          <div className="text-3xl mb-2">{phase.emoji}</div>
                          <div className="font-bold text-gray-800 mb-1">{phase.title}</div>
                          <div className="text-sm text-gray-600">{phase.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hinweis */}
                  <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5">
                    <p className="text-primary-800 text-sm leading-relaxed">
                      <strong>Hinweis:</strong> Dein Fortschritt wird automatisch gespeichert.
                      Du kannst jederzeit pausieren und an einem anderen Gerät weitermachen –
                      melde dich einfach wieder mit deinem persönlichen Code an.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Fobizz Vorstellung */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-display font-bold text-center mb-4 gradient-text"
          >
            Was ist Fobizz?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center text-gray-600 text-lg mb-12 max-w-2xl mx-auto"
          >
            Die KI-Plattform speziell für Lehrpersonen – datenschutzkonform und pädagogisch durchdacht
          </motion.p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {fobizzFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="text-4xl mb-4">{feature.emoji}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Fobizz Potenziale – Highlight Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-3xl p-8 md:p-10"
          >
            <h3 className="text-2xl md:text-3xl font-display font-bold text-center mb-8 gradient-text">
              Potenziale für deinen Unterricht
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {potentials.map((p, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">{p.emoji}</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 mb-1">{p.title}</div>
                    <div className="text-gray-600 text-sm">{p.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-display font-bold text-center mb-16 gradient-text"
          >
            Deine Lernreise
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {appFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 glass-card mx-4 rounded-3xl">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-5xl md:text-6xl font-display font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center glass-card p-12 rounded-3xl"
        >
          <Sparkles className="w-16 h-16 mx-auto mb-6 text-primary-600" />
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Bereit loszulegen?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Entdecke die Möglichkeiten von Fobizz und gestalte deinen Unterricht mit KI neu
          </p>
          <Link
            href="/login"
            className="inline-block px-10 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:bg-primary-700 transform hover:-translate-y-1 transition-all duration-200"
          >
            Jetzt anmelden
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-gray-600 border-t border-gray-200 mt-20">
        <p className="font-medium">
          Fobizz Weiterbildung • Version 1.0 • {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  )
}

// ==================== DATA ====================

const learningGoals = [
  'Du kennst die Kernfunktionen von Fobizz und kannst sie im Unterricht einsetzen',
  'Du erstellst eigenständig digitale Lernmaterialien mit KI-Unterstützung',
  'Du reflektierst den didaktischen Mehrwert von KI-Werkzeugen kritisch',
  'Du organisierst und teilst deine Unterrichtsmaterialien über Fobizz',
  'Du kannst Kolleginnen und Kollegen bei der Nutzung von Fobizz unterstützen',
]

const methodPhases = [
  {
    emoji: '🔍',
    title: 'Erkunden',
    description: 'Erste Schritte in Fobizz – Plattform kennenlernen und ausprobieren'
  },
  {
    emoji: '🛠️',
    title: 'Anwenden',
    description: 'Eigene Materialien erstellen und KI-Werkzeuge aktiv nutzen'
  },
  {
    emoji: '🔄',
    title: 'Reflektieren',
    description: 'Erfahrungen teilen, Gruppenarbeit und kollegialer Austausch'
  }
]

const fobizzFeatures = [
  {
    emoji: '🤖',
    title: 'KI-Assistent',
    description: 'Erstelle Unterrichtsmaterialien, Arbeitsblätter und Erklärungen mit Hilfe von KI – schnell, einfach und datenschutzkonform.'
  },
  {
    emoji: '🔒',
    title: 'Datenschutzkonform',
    description: 'Fobizz ist speziell für den Bildungsbereich entwickelt und erfüllt alle Anforderungen der DSGVO. Schülerdaten bleiben sicher.'
  },
  {
    emoji: '📚',
    title: 'Materialienpool',
    description: 'Zugriff auf tausende fertige Unterrichtsmaterialien, die von Lehrpersonen für Lehrpersonen erstellt wurden.'
  },
  {
    emoji: '🎨',
    title: 'Kreative Werkzeuge',
    description: 'Von Infografiken über Quizze bis hin zu interaktiven Aufgaben – Fobizz bietet vielfältige Gestaltungsmöglichkeiten.'
  },
  {
    emoji: '👥',
    title: 'Kollaboration',
    description: 'Teile Materialien mit Kolleginnen und Kollegen, arbeite gemeinsam an Projekten und profitiere vom Wissen des Kollegiums.'
  },
  {
    emoji: '📱',
    title: 'Plattformunabhängig',
    description: 'Funktioniert auf allen Geräten – ob PC, Tablet oder Smartphone. Kein Download nötig, einfach im Browser nutzen.'
  }
]

const potentials = [
  {
    emoji: '⏱️',
    title: 'Zeitersparnis bei der Vorbereitung',
    description: 'KI-gestützte Materialerstellung spart wertvolle Vorbereitungszeit – mehr Zeit für das Wesentliche.'
  },
  {
    emoji: '🎯',
    title: 'Differenzierung leicht gemacht',
    description: 'Erstelle schnell verschiedene Niveaustufen derselben Aufgabe für heterogene Lerngruppen.'
  },
  {
    emoji: '💡',
    title: 'Neue didaktische Ideen',
    description: 'KI als Inspirationsquelle für neue Unterrichtsansätze, Methoden und kreative Aufgabenformate.'
  },
  {
    emoji: '🌍',
    title: 'Fächerübergreifendes Lernen',
    description: 'Verknüpfe Inhalte aus verschiedenen Fächern und erstelle interdisziplinäre Lernszenarien.'
  }
]

const appFeatures = [
  {
    icon: BookOpen,
    title: '8 Lerneinheiten',
    description: 'Strukturierte Aufgaben mit klaren Zielen und Schritt-für-Schritt-Anleitungen'
  },
  {
    icon: Users,
    title: 'Gruppenarbeit',
    description: 'Gemeinsam lernen und Erfahrungen im Team austauschen'
  },
  {
    icon: BarChart3,
    title: 'Fortschritt verfolgen',
    description: 'Behalte den Überblick über deinen persönlichen Lernfortschritt'
  },
  {
    icon: MessageSquare,
    title: 'Pinnwand',
    description: 'Teile deine Erfahrungen und Materialien mit anderen Teilnehmenden'
  }
]

const stats = [
  { value: '8', label: 'Lerneinheiten' },
  { value: '6', label: 'KI-Werkzeuge' },
  { value: '∞', label: 'Möglichkeiten' }
]
