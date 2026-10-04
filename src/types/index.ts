export type AgeGroup = '3-4' | '5-6';

export interface LetterShape {
  isolated: string; // منفصل
  beginning: string; // أول الكلمة
  middle: string; // وسط الكلمة
  ending: string; // آخر الكلمة
}

export interface LetterExample {
  word: string;
  wordTashkeel: string;
  meaning: string;
  emoji: string;
  position: 'beginning' | 'middle' | 'ending';
}

export interface ArabicLetter {
  id: number;
  letter: string; // e.g. "أ"
  name: string; // "ألف"
  soundPhonic: string; // "أَ"
  soundPhonicAudioText: string; // text for speech synthesis
  shapes: LetterShape;
  example: LetterExample;
  moreExamples?: LetterExample[];
  description: string;
  color: string;
}

export interface NumberItem {
  number: number; // 0, 1, 2...
  arabicNumeral: string; // ٠, ١, ٢...
  nameArabic: string; // صِفْر، وَاحِد، اِثْنَان...
  counterVisual: {
    emoji: string;
    itemLabel: string;
  };
  level: 1 | 2 | 3 | 4; // 1: 0-10, 2: 11-20, 3: 21-50, 4: 51-100
}

export interface MascotCharacter {
  id: string;
  name: string;
  avatarEmoji: string;
  title: string;
  unlockStarsRequired: number;
  isUnlocked: boolean;
  color: string;
  quote: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  requiredMetric: 'letters_count' | 'numbers_count' | 'quizzes_count' | 'stars_count' | 'streak_days';
  requiredValue: number;
}

export interface ChildProfile {
  id: string;
  parentId?: string;
  name: string;
  avatar: string;
  ageGroup: AgeGroup;
  currentLevelId: number; // 1 to 6
  stars: number;
  unlockedCharacters: string[]; // mascot IDs
  masteredLetters: number[]; // letter IDs
  masteredNumbers: number[]; // numbers
  troubledItems: {
    type: 'letter' | 'number';
    id: number;
    errorCount: number;
    lastTested: string;
  }[];
  completedLessons: string[];
  totalTimeMinutes: number;
  createdAt: string;
  lastActive: string;
}

export interface LevelDefinition {
  id: number;
  name: string;
  titleArabic: string;
  description: string;
  icon: string;
  requiredStars: number;
  minExamScorePercent: number;
  color: string;
  bgGradient: string;
  letterRange?: [number, number];
  numberRange?: [number, number];
}

export interface QuizAttempt {
  id: string;
  childId: string;
  category: 'letter' | 'number' | 'game' | 'level_exam';
  title: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercent: number;
  timestamp: string;
  passed: boolean;
}

export interface DailyChallengeItem {
  id: string;
  question: string;
  type: 'letter' | 'number' | 'word' | 'count';
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    audioText?: string;
    emoji?: string;
  }[];
  promptAudioText: string;
}

export interface ParentSettings {
  parentPin: string;
  dailyGoalMinutes: number;
  soundEnabled: boolean;
  musicVolume: number;
  speechRate: number; // 0.7 - 1.2
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}
