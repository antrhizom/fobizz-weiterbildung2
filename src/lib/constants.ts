import { Task, RatingQuestion, RatingOption } from '@/types';

export const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE || "ADMIN2025";

export const TASKS: Task[] = [
  {
    id: 1,
    title: 'Was ist Fobizz? – Plattformvorstellung',
    type: 'individual',
    iconEmoji: '🎯',
    subtasks: [
      'Ich kenne die wichtigsten Funktionen von Fobizz',
      'Ich verstehe, welche Potenziale Fobizz für meinen Unterricht bietet'
    ],
    pdfId: 'task1'
  },
  {
    id: 2,
    title: 'Registrierung & Erste Schritte',
    type: 'individual',
    iconEmoji: '🔑',
    subtasks: [
      'Ich bin bei Fobizz registriert',
      'Ich habe mich erfolgreich angemeldet und die Oberfläche erkundet'
    ],
    pdfId: 'task2'
  },
  {
    id: 3,
    title: 'KI-Werkzeuge in Fobizz',
    type: 'individual',
    iconEmoji: '🤖',
    subtasks: [
      'Ich habe den Fobizz KI-Assistenten genutzt',
      'Ich habe mindestens ein KI-generiertes Material erstellt',
      'Ich habe das Ergebnis kritisch reflektiert'
    ],
    pdfId: 'task3'
  },
  {
    id: 4,
    title: 'Gruppenarbeit A – Austausch & Reflexion',
    type: 'group',
    iconEmoji: '👥',
    subtasks: [
      'Zwischenstandkontrolle in der Gruppe',
      'Einzellinks sind auf dem Whiteboard festgehalten'
    ],
    whiteboardUrl: 'https://example.com/whiteboard-a',
    pdfId: 'task4'
  },
  {
    id: 5,
    title: 'Aufgaben & Materialien erstellen',
    type: 'individual',
    iconEmoji: '📝',
    subtasks: [
      'Ich habe eine Aufgabe mit Fobizz erstellt',
      'Ich habe eine Infografik oder ein Arbeitsblatt generiert',
      'Ich habe ein Quiz oder eine Lernkontrolle angelegt'
    ],
    pdfId: 'task5'
  },
  {
    id: 6,
    title: 'Inhalte organisieren & teilen',
    type: 'individual',
    iconEmoji: '📂',
    subtasks: [
      'Ich habe einen Kurs oder eine Sammlung erstellt',
      'Ich habe Inhalte mit Kolleginnen oder Kollegen geteilt'
    ],
    pdfId: 'task6'
  },
  {
    id: 7,
    title: 'Gruppenarbeit B – Unterrichtsprojekt planen',
    type: 'group',
    iconEmoji: '🗓️',
    subtasks: [
      'Wir haben gemeinsam ein Unterrichtsprojekt mit Fobizz geplant',
      'Projektlinks sind auf dem Whiteboard dokumentiert'
    ],
    whiteboardUrl: 'https://example.com/whiteboard-b',
    pdfId: 'task7'
  },
  {
    id: 8,
    title: 'Abschluss & Präsentation',
    type: 'group',
    iconEmoji: '🏁',
    subtasks: [
      'Wir haben unsere Ergebnisse auf dem Padlet geteilt',
      'Mindestens fünf Links mit kurzer Begründung sind dokumentiert'
    ],
    padletUrl: 'https://example.com/padlet',
    pdfId: 'task8'
  }
];

export const RATING_QUESTIONS: RatingQuestion[] = [
  { id: 'enjoyed', label: 'Hat es mir Spaß gemacht?', emoji: '😊' },
  { id: 'useful', label: 'War es sinnvoll?', emoji: '💡' },
  { id: 'learned', label: 'Habe ich etwas gelernt?', emoji: '📚' }
];

export const RATING_OPTIONS: RatingOption[] = [
  { value: 3, label: 'Sehr', emoji: '👍', color: '#4caf50' },
  { value: 2, label: 'Eher ja', emoji: '✔', color: '#8bc34a' },
  { value: 1, label: 'Eher nein', emoji: '✗', color: '#ff9800' },
  { value: 0, label: 'Gar nicht', emoji: '👎', color: '#f44336' }
];

export const generateCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const getSubtaskKey = (taskId: number, subtaskIndex: number): string => {
  return `${taskId}-${subtaskIndex}`;
};
