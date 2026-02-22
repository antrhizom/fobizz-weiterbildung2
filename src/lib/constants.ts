import { Task, RatingQuestion, RatingOption } from '@/types';

export const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE || "ADMIN2025";

export const TASKS: Task[] = [
  {
    id: 1,
    title: 'Start, Registrierung & Überblick',
    type: 'individual',
    iconEmoji: '🚀',
    subtasks: [
      'Ich habe mich bei Fobizz registriert und das Bestätigungs-E-Mail aktiviert',
      'Ich habe die Oberfläche erkundet: «Tools und KI», Profil, Klassenräume',
      'Ich kenne die vier Schwerpunktbereiche: KI Chat & Assistenten, KI Multimedia Tools, Material anlegen, Inhalte sicher teilen'
    ],
    pdfId: 'aufgabe1',
    pdfUrl: '/pdfs/aufgabe1.pdf'
  },
  {
    id: 2,
    title: 'Lernraum einrichten & Projekt ablegen',
    type: 'individual',
    iconEmoji: '🏫',
    subtasks: [
      'Ich habe einen Klassenraum angelegt (Langfristig oder 24h)',
      'Ich habe die Codedatei heruntergeladen und gespeichert',
      'Ich habe dem Lernraum ein Projekt zugewiesen und ein Tool (z.B. KI Multimedia Tool) hinzugefügt'
    ],
    pdfId: 'aufgabe2',
    pdfUrl: '/pdfs/aufgabe2.pdf'
  },
  {
    id: 3,
    title: 'KI-Chat & KI-Assistenz einrichten und teilen',
    type: 'individual',
    iconEmoji: '🤖',
    subtasks: [
      'Ich habe den KI-Chat ausprobiert und Feineinstellungen (Sprachmodell, Plugins) vorgenommen',
      'Ich habe mindestens eine eigene KI-Assistentin erstellt (Rolle, Instruktion, Hintergrundwissen)',
      'Ich habe die KI-Assistentin in einen Lernraum gestellt und per Freigabelink geteilt'
    ],
    pdfId: 'aufgabe3',
    pdfUrl: '/pdfs/aufgabe3.pdf'
  },
  {
    id: 4,
    title: 'KI-Assistenz im OneDrive-Ordner ablegen',
    type: 'individual',
    iconEmoji: '📂',
    subtasks: [
      'Ich habe den Link meiner KI-Assistentin kopiert',
      'Ich habe den Link im gemeinsamen OneDrive-Ordner abgelegt',
      'Ich habe die Beschriftung so gewählt, dass ABU-Themenbereich und Funktion klar erkennbar sind'
    ],
    oneDriveUrl: 'https://eduzh-my.sharepoint.com/:f:/g/personal/christof_glaus_dlh_zh_ch/IgBJTrBooXZcTaWtPnVpGhRpAcS9Dd7ecUg11PZjzuvuBpA?e=ttZNrf'
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
