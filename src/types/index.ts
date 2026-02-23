export interface User {
  userId: string;
  username: string;
  code: string;
  email: string;
  group?: string;           // Gruppen-Zugehörigkeit (aus to-teach)
  isVirtual?: boolean;
  fobizzActive?: boolean;   // to-teach User hat sich auf fobizz eingeloggt
  createdAt: string;
  completedSubtasks: Record<string, string>;
  ratings: Record<number, TaskRating>;
}

export interface TaskRating {
  enjoyed: number;
  useful: number;
  learned: number;
  timestamp: string;
}

export interface Task {
  id: number;
  title: string;
  type: 'individual' | 'group';
  iconEmoji: string;
  subtasks: string[];
  pdfId?: string;
  pdfUrl?: string;
  whiteboardUrl?: string;
  padletUrl?: string;
  oneDriveUrl?: string;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
}

export interface PDFData {
  fileName: string;
  url: string;
  uploadedAt: string;
  taskId: string;
}

export interface RatingQuestion {
  id: 'enjoyed' | 'useful' | 'learned';
  label: string;
  emoji: string;
}

export interface RatingOption {
  value: number;
  label: string;
  emoji: string;
  color: string;
}
