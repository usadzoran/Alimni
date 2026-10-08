import { ChildProfile, ParentSettings, QuizAttempt } from '../types';
import { getSupabaseClient } from '../lib/supabase';
import { MASCOT_CHARACTERS } from '../data/badgesData';
import type { SupabaseClient } from '@supabase/supabase-js';

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

export function sanitizeChild(c: unknown): ChildProfile {
  const obj = (typeof c === 'object' && c !== null ? c : {}) as Partial<ChildProfile>;
  return {
    id: typeof obj.id === 'string' && obj.id ? obj.id : `child_${Date.now()}`,
    parentId: typeof obj.parentId === 'string' ? obj.parentId : undefined,
    name: typeof obj.name === 'string' && obj.name.trim() ? obj.name : 'سارة',
    lastName: typeof obj.lastName === 'string' && obj.lastName.trim() ? obj.lastName.trim() : undefined,
    avatar: typeof obj.avatar === 'string' && obj.avatar ? obj.avatar : '🐰',
    age: typeof obj.age === 'number' && Number.isInteger(obj.age) && obj.age >= 2 && obj.age <= 7 ? obj.age : undefined,
    ageGroup: obj.ageGroup === '5-6' ? '5-6' : '3-4',
    gradeLevel: typeof obj.gradeLevel === 'string' && obj.gradeLevel.trim() ? obj.gradeLevel.trim() : undefined,
    learningTrack: obj.learningTrack === '2-4' || obj.learningTrack === '5-7' ? obj.learningTrack : undefined,
    currentLevelId: typeof obj.currentLevelId === 'number' && obj.currentLevelId >= 1 ? obj.currentLevelId : 1,
    stars: typeof obj.stars === 'number' && !isNaN(obj.stars) ? obj.stars : 0,
    unlockedCharacters:
      Array.isArray(obj.unlockedCharacters) && obj.unlockedCharacters.length > 0
        ? obj.unlockedCharacters
        : ['farfour_rabbit'],
    masteredLetters: Array.isArray(obj.masteredLetters) ? obj.masteredLetters : [],
    masteredNumbers: Array.isArray(obj.masteredNumbers) ? obj.masteredNumbers : [],
    troubledItems: Array.isArray(obj.troubledItems) ? obj.troubledItems : [],
    completedLessons: Array.isArray(obj.completedLessons) ? obj.completedLessons : [],
    totalTimeMinutes: typeof obj.totalTimeMinutes === 'number' && !isNaN(obj.totalTimeMinutes) ? obj.totalTimeMinutes : 0,
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    lastActive: typeof obj.lastActive === 'string' ? obj.lastActive : new Date().toISOString(),
  };
}

class StorageService {
  private activeChildId: string = '';
  private children: ChildProfile[] = [];
  private attempts: QuizAttempt[] = [];
  private settings: ParentSettings = DEFAULT_SETTINGS;
  private listeners: Set<() => void> = new Set();
  private ensuredParentProfileIds: Set<string> = new Set();

  constructor() {
    this.loadFromLocal();
    // Non-blocking background sync
    try {
      this.syncFromSupabase().catch((err) => {
        console.warn('Initial Supabase sync check:', err);
      });
    } catch {
      // safe
    }
  }

  private loadFromLocal() {
    if (typeof localStorage === 'undefined') {
      this.children = DEFAULT_CHILDREN.map(sanitizeChild);
      this.activeChildId = this.children[0].id;
      return;
    }

    try {
      const storedChildren = localStorage.getItem('kids_edu_children');
      if (storedChildren) {
        const parsed = JSON.parse(storedChildren);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.children = parsed.map(sanitizeChild);
        } else {
          this.children = DEFAULT_CHILDREN.map(sanitizeChild);
          this.saveChildrenToLocal();
        }
      } else {
        this.children = DEFAULT_CHILDREN.map(sanitizeChild);
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
        const parsedAttempts = JSON.parse(storedAttempts);
        this.attempts = Array.isArray(parsedAttempts) ? parsedAttempts : [];
      }

      const storedSettings = localStorage.getItem('kids_edu_settings');
      if (storedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
      }
    } catch (e) {
      console.error('Failed to load local state:', e);
      this.children = DEFAULT_CHILDREN.map(sanitizeChild);
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

  private hasCompleteOnboarding(child: ChildProfile): boolean {
    return Boolean(child.name.trim() && child.lastName?.trim() && child.age && child.gradeLevel?.trim());
  }

  private createUuid(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
      const random = Math.floor(Math.random() * 16);
      return (character === 'x' ? random : (random & 0x3) | 0x8).toString(16);
    });
  }

  private ensureDatabaseChildId(child: ChildProfile): ChildProfile {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(child.id)) return child;
    const index = this.children.findIndex((candidate) => candidate.id === child.id);
    if (index < 0) return child;

    const previousId = this.children[index].id;
    const newId = this.createUuid();
    this.children[index] = { ...this.children[index], id: newId };
    if (this.activeChildId === previousId) this.activeChildId = newId;
    this.attempts = this.attempts.map((attempt) => attempt.childId === previousId ? { ...attempt, childId: newId } : attempt);
    this.saveChildrenToLocal();
    this.saveAttemptsToLocal();
    this.notify();
    return this.children[index];
  }

  private async ensureSupabaseOwner(supabase: SupabaseClient): Promise<string> {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    let user = sessionData.session?.user;
    if (!user) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      if (!data.user) throw new Error('تعذر إنشاء جلسة حفظ لهذا المتصفح.');
      user = data.user;
    }
    if (!user) throw new Error('تعذر إنشاء جلسة حفظ لهذا المتصفح.');

    if (!this.ensuredParentProfileIds.has(user.id)) {
      const { error } = await supabase.from('parent_profiles').upsert({
        id: user.id,
        email: user.email ?? null,
        full_name: 'ملف طفل',
      }, { onConflict: 'id' });
      if (error) throw error;
      this.ensuredParentProfileIds.add(user.id);
    }

    return user.id;
  }

  private async upsertChildRecord(supabase: SupabaseClient, parentId: string, child: ChildProfile) {
    if (!this.hasCompleteOnboarding(child)) throw new Error('أكمل بيانات الطفل قبل الحفظ.');

    const { error } = await supabase.from('children').upsert({
      id: child.id,
      parent_id: parentId,
      name: child.name.trim(),
      last_name: child.lastName!.trim(),
      avatar: child.avatar,
      age: child.age,
      age_group: child.ageGroup,
      grade_level: child.gradeLevel!.trim(),
      learning_track: child.learningTrack ?? null,
      current_level: child.currentLevelId,
      stars_count: child.stars,
      total_time_minutes: child.totalTimeMinutes,
      unlocked_characters: child.unlockedCharacters,
      mastered_letters: child.masteredLetters,
      mastered_numbers: child.masteredNumbers,
      completed_lessons: child.completedLessons,
      troubled_items: child.troubledItems,
      last_active: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (error) throw error;
  }

  public async syncFromSupabase() {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const hasSavedLocalChild = this.children.some((child) => this.hasCompleteOnboarding(child));
      if (!sessionData.session?.user && !hasSavedLocalChild) return;

      const parentId = await this.ensureSupabaseOwner(supabase);
      const { data: dbChildren, error } = await supabase
        .from('children')
        .select('id,parent_id,name,last_name,avatar,age,age_group,grade_level,learning_track,current_level,stars_count,total_time_minutes,unlocked_characters,mastered_letters,mastered_numbers,completed_lessons,troubled_items,created_at,last_active')
        .order('created_at', { ascending: true })
        .limit(100);
      if (error) throw error;

      const remoteChildren = (dbChildren ?? []).map((item) => sanitizeChild({
        id: item.id,
        parentId: item.parent_id,
        name: item.name,
        lastName: item.last_name,
        avatar: item.avatar,
        age: item.age,
        ageGroup: item.age_group,
        gradeLevel: item.grade_level,
        learningTrack: item.learning_track,
        currentLevelId: item.current_level,
        stars: item.stars_count,
        totalTimeMinutes: item.total_time_minutes,
        unlockedCharacters: item.unlocked_characters,
        masteredLetters: item.mastered_letters,
        masteredNumbers: item.mastered_numbers,
        completedLessons: item.completed_lessons,
        troubledItems: item.troubled_items,
        createdAt: item.created_at,
        lastActive: item.last_active,
      }));

      const localChildrenById = new Map(
        this.children.filter((child) => this.hasCompleteOnboarding(child)).map((child) => [child.id, child]),
      );
      const reconciledChildren: ChildProfile[] = [];
      for (const remoteChild of remoteChildren) {
        const localChild = localChildrenById.get(remoteChild.id);
        if (localChild) {
          localChildrenById.delete(remoteChild.id);
          const localUpdatedAt = Date.parse(localChild.lastActive || localChild.createdAt);
          const remoteUpdatedAt = Date.parse(remoteChild.lastActive || remoteChild.createdAt);
          if (Number.isFinite(localUpdatedAt) && (!Number.isFinite(remoteUpdatedAt) || localUpdatedAt >= remoteUpdatedAt)) {
            await this.upsertChildRecord(supabase, parentId, localChild);
            reconciledChildren.push(sanitizeChild(localChild));
            continue;
          }
        }
        reconciledChildren.push(remoteChild);
      }

      for (const localChild of localChildrenById.values()) {
        const databaseChild = this.ensureDatabaseChildId(localChild);
        await this.upsertChildRecord(supabase, parentId, databaseChild);
        reconciledChildren.push(sanitizeChild(databaseChild));
      }

      if (reconciledChildren.length > 0) {
        this.children = reconciledChildren;
        if (!this.children.some((child) => child.id === this.activeChildId)) this.activeChildId = this.children[0].id;
        this.saveChildrenToLocal();
        this.notify();
        await this.syncQuizAttempts(supabase, this.children.map((child) => child.id));
      }
    } catch (err) {
      console.warn('Supabase sync skipped:', err);
    }
  }

  private async syncQuizAttempts(supabase: SupabaseClient, childIds: string[]) {
    if (childIds.length === 0) return;
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('id,child_id,category,title,total_questions,correct_answers,score_percent,passed,created_at')
      .in('child_id', childIds)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;

    const remoteAttempts: QuizAttempt[] = (data ?? []).map((item) => ({
      id: item.id,
      childId: item.child_id,
      category: item.category as QuizAttempt['category'],
      title: item.title,
      totalQuestions: item.total_questions,
      correctAnswers: item.correct_answers,
      scorePercent: item.score_percent,
      passed: item.passed,
      timestamp: item.created_at,
    }));
    const remoteIds = new Set(remoteAttempts.map((attempt) => attempt.id));
    const localOnlyAttempts: QuizAttempt[] = [];
    const retryQueue: QuizAttempt[] = [];
    for (const attempt of this.attempts.filter((item) => childIds.includes(item.childId) && !remoteIds.has(item.id))) {
      const stableAttempt = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(attempt.id)
        ? attempt
        : { ...attempt, id: this.createUuid() };
      localOnlyAttempts.push(stableAttempt);
      retryQueue.push(stableAttempt);
    }
    const unrelatedLocalAttempts = this.attempts.filter((attempt) => !childIds.includes(attempt.childId));
    this.attempts = [...remoteAttempts, ...localOnlyAttempts, ...unrelatedLocalAttempts]
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
      .slice(0, 50);
    this.saveAttemptsToLocal();
    await Promise.all(retryQueue.map((attempt) => this.persistQuizAttempt(attempt, true)));
  }

  public async pushActiveChildToSupabase(): Promise<{ ok: boolean; error?: string }> {
    let child = this.getActiveChild();
    const supabase = getSupabaseClient();
    if (!supabase) return { ok: false, error: 'لم يتم إعداد اتصال Supabase.' };
    if (!this.hasCompleteOnboarding(child)) return { ok: false, error: 'أكمل بيانات الطفل قبل الحفظ.' };

    try {
      const parentId = await this.ensureSupabaseOwner(supabase);
      child = this.ensureDatabaseChildId(child);
      await this.upsertChildRecord(supabase, parentId, child);
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('Failed to push child to Supabase:', message);
      return { ok: false, error: message };
    }
  }

  public async saveChildOnboarding(id: string, updates: Partial<ChildProfile>): Promise<void> {
    this.updateChild(id, updates, false);
    const result = await this.pushActiveChildToSupabase();
    if (!result.ok) throw new Error(result.error || 'تعذر حفظ ملف الطفل في قاعدة البيانات.');
  }

  public async saveLearningTrack(id: string, learningTrack: NonNullable<ChildProfile['learningTrack']>): Promise<void> {
    const index = this.children.findIndex((child) => child.id === id);
    if (index < 0) throw new Error('ملف الطفل غير موجود.');
    const previousChild = this.children[index];
    this.children[index] = { ...previousChild, learningTrack, lastActive: new Date().toISOString() };
    this.saveChildrenToLocal();

    const result = await this.pushActiveChildToSupabase();
    if (!result.ok) {
      this.children[index] = previousChild;
      this.saveChildrenToLocal();
      throw new Error(result.error || 'تعذر حفظ المسار المختار.');
    }
    this.notify();
  }

  private async persistQuizAttempt(attempt: QuizAttempt, childAlreadySaved = false) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      const parentId = await this.ensureSupabaseOwner(supabase);
      const child = this.children.find((candidate) => candidate.id === attempt.childId);
      if (!child) throw new Error('ملف الطفل غير موجود لحفظ نتيجة التمرين.');
      const databaseChild = this.ensureDatabaseChildId(child);
      if (!childAlreadySaved) await this.upsertChildRecord(supabase, parentId, databaseChild);
      const { error } = await supabase.from('quiz_attempts').upsert({
        id: attempt.id,
        child_id: databaseChild.id,
        category: attempt.category,
        title: attempt.title,
        total_questions: attempt.totalQuestions,
        correct_answers: attempt.correctAnswers,
        score_percent: attempt.scorePercent,
        passed: attempt.passed,
      }, { onConflict: 'id', ignoreDuplicates: true });
      if (error) throw error;
    } catch (error) {
      console.warn('Failed to save quiz attempt to Supabase:', error);
    }
  }

  // --- Child Management ---

  public getChildren(): ChildProfile[] {
    return this.children.map(sanitizeChild);
  }

  public getActiveChild(): ChildProfile {
    if (!this.children || this.children.length === 0) {
      this.children = DEFAULT_CHILDREN.map(sanitizeChild);
      this.activeChildId = this.children[0].id;
    }
    const found = this.children.find((c) => c.id === this.activeChildId);
    return sanitizeChild(found || this.children[0] || DEFAULT_CHILDREN[0]);
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

  public updateChild(id: string, updates: Partial<ChildProfile>, syncToSupabase = true) {
    const index = this.children.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.children[index] = { ...this.children[index], ...updates, lastActive: new Date().toISOString() };
      this.saveChildrenToLocal();
      this.notify();
      if (syncToSupabase && id === this.activeChildId) void this.pushActiveChildToSupabase();
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
    const localChild = this.getActiveChild();
    if (!localChild) return;
    const child = getSupabaseClient() ? this.ensureDatabaseChildId(localChild) : localChild;

    const newAttempt: QuizAttempt = {
      ...attempt,
      id: this.createUuid(),
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

    void this.persistQuizAttempt(newAttempt);

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
