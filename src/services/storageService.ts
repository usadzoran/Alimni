import { ChildProfile, ParentSettings, QuizAttempt } from '../types';
import { getSupabaseClient } from '../lib/supabase';
import { MASCOT_CHARACTERS } from '../data/badgesData';

const DEFAULT_CHILDREN: ChildProfile[] = [
  {
    id: 'child_default_1',
    name: 'سارة',
    avatar: '🐰',
    ageGroup: '3-4',
    currentLevelId: 1,
    stars: 12,
    unlockedCharacters: ['farfour_rabbit'],
    masteredLetters: [1, 2], // أ، ب
    masteredNumbers: [0, 1, 2], // ٠، ١، ٢
    troubledItems: [],
    completedLessons: ['letter_1', 'letter_2', 'number_0', 'number_1'],
    totalTimeMinutes: 25,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
  {
    id: 'child_default_2',
    name: 'أحمد',
    avatar: '🦁',
    ageGroup: '5-6',
    currentLevelId: 2,
    stars: 35,
    unlockedCharacters: ['farfour_rabbit', 'samsem_bear', 'zozo_giraffe'],
    masteredLetters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    masteredNumbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    troubledItems: [{ type: 'letter', id: 4, errorCount: 1, lastTested: new Date().toISOString() }],
    completedLessons: ['letter_1', 'letter_2', 'letter_3', 'letter_4', 'number_1', 'number_2', 'number_3'],
    totalTimeMinutes: 65,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
];

const DEFAULT_SETTINGS: ParentSettings = {
  parentPin: '1234',
  dailyGoalMinutes: 15,
  soundEnabled: true,
  musicVolume: 0.8,
  speechRate: 0.85,
};

class StorageService {
  private activeChildId: string = '';
  private children: ChildProfile[] = [];
  private attempts: QuizAttempt[] = [];
  private settings: ParentSettings = DEFAULT_SETTINGS;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromLocal();
    // Try syncing with Supabase in background
    this.syncFromSupabase();
  }

  private loadFromLocal() {
    if (typeof localStorage === 'undefined') return;

    try {
      const storedChildren = localStorage.getItem('kids_edu_children');
      if (storedChildren) {
        this.children = JSON.parse(storedChildren);
      } else {
        this.children = DEFAULT_CHILDREN;
        this.saveChildrenToLocal();
      }

      const storedActiveId = localStorage.getItem('kids_edu_active_child_id');
      if (storedActiveId && this.children.some((c) => c.id === storedActiveId)) {
        this.activeChildId = storedActiveId;
      } else if (this.children.length > 0) {
        this.activeChildId = this.children[0].id;
      }

      const storedAttempts = localStorage.getItem('kids_edu_attempts');
      if (storedAttempts) {
        this.attempts = JSON.parse(storedAttempts);
      }

      const storedSettings = localStorage.getItem('kids_edu_settings');
      if (storedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
      }
    } catch (e) {
      console.error('Failed to load local state:', e);
      this.children = DEFAULT_CHILDREN;
      this.activeChildId = this.children[0].id;
    }
  }

  private saveChildrenToLocal() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('kids_edu_children', JSON.stringify(this.children));
    localStorage.setItem('kids_edu_active_child_id', this.activeChildId);
  }

  private saveAttemptsToLocal() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('kids_edu_attempts', JSON.stringify(this.attempts));
  }

  private saveSettingsToLocal() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('kids_edu_settings', JSON.stringify(this.settings));
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  // --- Supabase Synchronization ---

  public async syncFromSupabase() {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      // Query children for authenticated user or active session
      const { data: dbChildren, error } = await supabase.from('children').select('*');
      if (!error && dbChildren && dbChildren.length > 0) {
        // Map db fields to ChildProfile
        const mappedChildren: ChildProfile[] = dbChildren.map((item) => ({
          id: item.id,
          parentId: item.parent_id,
          name: item.name,
          avatar: item.avatar || '🐰',
          ageGroup: item.age_group || '3-4',
          currentLevelId: item.current_level || 1,
          stars: item.stars_count || 0,
          unlockedCharacters: ['farfour_rabbit'],
          masteredLetters: [],
          masteredNumbers: [],
          troubledItems: [],
          completedLessons: [],
          totalTimeMinutes: item.total_time_minutes || 0,
          createdAt: item.created_at,
          lastActive: item.last_active,
        }));

        this.children = mappedChildren;
        if (!this.children.some((c) => c.id === this.activeChildId)) {
          this.activeChildId = this.children[0].id;
        }
        this.saveChildrenToLocal();
        this.notify();
      }
    } catch (err) {
      console.warn('Supabase sync skipped:', err);
    }
  }

  public async pushActiveChildToSupabase() {
    const child = this.getActiveChild();
    const supabase = getSupabaseClient();
    if (!child || !supabase) return;

    try {
      await supabase.from('children').upsert({
        id: child.id,
        name: child.name,
        avatar: child.avatar,
        age_group: child.ageGroup,
        current_level: child.currentLevelId,
        stars_count: child.stars,
        total_time_minutes: child.totalTimeMinutes,
        last_active: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Failed to push child to Supabase:', e);
    }
  }

  // --- Child Management ---

  public getChildren(): ChildProfile[] {
    return this.children;
  }

  public getActiveChild(): ChildProfile | undefined {
    return this.children.find((c) => c.id === this.activeChildId) || this.children[0];
  }

  public setActiveChildId(id: string) {
    if (this.children.some((c) => c.id === id)) {
      this.activeChildId = id;
      this.saveChildrenToLocal();
      this.notify();
    }
  }

  public addChild(name: string, ageGroup: '3-4' | '5-6', avatar: string): ChildProfile {
    const newChild: ChildProfile = {
      id: `child_${Date.now()}`,
      name: name.trim() || 'طفل جديد',
      avatar,
      ageGroup,
      currentLevelId: 1,
      stars: 0,
      unlockedCharacters: ['farfour_rabbit'],
      masteredLetters: [],
      masteredNumbers: [],
      troubledItems: [],
      completedLessons: [],
      totalTimeMinutes: 0,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    this.children.push(newChild);
    this.activeChildId = newChild.id;
    this.saveChildrenToLocal();
    this.notify();
    this.pushActiveChildToSupabase();
    return newChild;
  }

  public updateChild(id: string, updates: Partial<ChildProfile>) {
    const index = this.children.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.children[index] = { ...this.children[index], ...updates, lastActive: new Date().toISOString() };
      this.saveChildrenToLocal();
      this.notify();
      this.pushActiveChildToSupabase();
    }
  }

  public deleteChild(id: string) {
    if (this.children.length <= 1) {
      return false; // keep at least one child profile
    }
    this.children = this.children.filter((c) => c.id !== id);
    if (this.activeChildId === id) {
      this.activeChildId = this.children[0].id;
    }
    this.saveChildrenToLocal();
    this.notify();
    return true;
  }

  public resetChildProgress(id: string) {
    const index = this.children.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.children[index] = {
        ...this.children[index],
        currentLevelId: 1,
        stars: 0,
        unlockedCharacters: ['farfour_rabbit'],
        masteredLetters: [],
        masteredNumbers: [],
        troubledItems: [],
        completedLessons: [],
        totalTimeMinutes: 0,
        lastActive: new Date().toISOString(),
      };
      this.saveChildrenToLocal();
      this.notify();
      this.pushActiveChildToSupabase();
    }
  }

  // --- Educational Progress Tracking ---

  public markLessonComplete(lessonId: string, starsToAdd: number = 2) {
    const child = this.getActiveChild();
    if (!child) return;

    const alreadyDone = child.completedLessons.includes(lessonId);
    const updatedLessons = alreadyDone ? child.completedLessons : [...child.completedLessons, lessonId];
    // prevent multiple stars hoarding on repeated clicks
    const newStars = alreadyDone ? child.stars : child.stars + starsToAdd;

    // Check mascot characters unlocks based on total stars
    const unlocked = [...child.unlockedCharacters];
    MASCOT_CHARACTERS.forEach((mascot) => {
      if (newStars >= mascot.unlockStarsRequired && !unlocked.includes(mascot.id)) {
        unlocked.push(mascot.id);
      }
    });

    this.updateChild(child.id, {
      completedLessons: updatedLessons,
      stars: newStars,
      unlockedCharacters: unlocked,
    });
  }

  public markLetterMastered(letterId: number) {
    const child = this.getActiveChild();
    if (!child) return;

    const isMastered = child.masteredLetters.includes(letterId);
    const updated = isMastered ? child.masteredLetters : [...child.masteredLetters, letterId];
    // Remove from troubled if it was there
    const updatedTroubled = child.troubledItems.filter((t) => !(t.type === 'letter' && t.id === letterId));

    this.updateChild(child.id, {
      masteredLetters: updated,
      troubledItems: updatedTroubled,
    });
    this.markLessonComplete(`letter_${letterId}`, 3);
  }

  public markNumberMastered(numberVal: number) {
    const child = this.getActiveChild();
    if (!child) return;

    const isMastered = child.masteredNumbers.includes(numberVal);
    const updated = isMastered ? child.masteredNumbers : [...child.masteredNumbers, numberVal];
    const updatedTroubled = child.troubledItems.filter((t) => !(t.type === 'number' && t.id === numberVal));

    this.updateChild(child.id, {
      masteredNumbers: updated,
      troubledItems: updatedTroubled,
    });
    this.markLessonComplete(`number_${numberVal}`, 3);
  }

  public recordMistake(type: 'letter' | 'number', id: number) {
    const child = this.getActiveChild();
    if (!child) return;

    const existingIndex = child.troubledItems.findIndex((t) => t.type === type && t.id === id);
    const updated = [...child.troubledItems];

    if (existingIndex !== -1) {
      updated[existingIndex].errorCount += 1;
      updated[existingIndex].lastTested = new Date().toISOString();
    } else {
      updated.push({
        type,
        id,
        errorCount: 1,
        lastTested: new Date().toISOString(),
      });
    }

    this.updateChild(child.id, { troubledItems: updated });
  }

  public recordQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'childId' | 'timestamp'>) {
    const child = this.getActiveChild();
    if (!child) return;

    const newAttempt: QuizAttempt = {
      ...attempt,
      id: `attempt_${Date.now()}`,
      childId: child.id,
      timestamp: new Date().toISOString(),
    };

    this.attempts.unshift(newAttempt);
    // Keep max 50 recent attempts
    if (this.attempts.length > 50) {
      this.attempts = this.attempts.slice(0, 50);
    }
    this.saveAttemptsToLocal();

    // If passed level exam with >= 80%, unlock next level!
    if (attempt.category === 'level_exam' && attempt.passed && attempt.scorePercent >= 80) {
      if (child.currentLevelId < 6) {
        this.updateChild(child.id, {
          currentLevelId: child.currentLevelId + 1,
          stars: child.stars + 10,
        });
      }
    }

    // Push to Supabase if connected
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('quiz_attempts').insert({
        child_id: child.id,
        category: newAttempt.category,
        title: newAttempt.title,
        total_questions: newAttempt.totalQuestions,
        correct_answers: newAttempt.correctAnswers,
        score_percent: newAttempt.scorePercent,
        passed: newAttempt.passed,
      }).then();
    }

    this.notify();
  }

  public getAttemptsForChild(childId: string): QuizAttempt[] {
    return this.attempts.filter((a) => a.childId === childId);
  }

  public addStudyTime(minutes: number) {
    const child = this.getActiveChild();
    if (!child) return;
    this.updateChild(child.id, {
      totalTimeMinutes: (child.totalTimeMinutes || 0) + minutes,
    });
  }

  // --- Parent Settings ---

  public getSettings(): ParentSettings {
    return this.settings;
  }

  public updateSettings(newSettings: Partial<ParentSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettingsToLocal();
    this.notify();
  }
}

export const storageService = new StorageService();
