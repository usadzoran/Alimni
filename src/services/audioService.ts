class AudioService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private volume: number = 0.9;
  private speechRate: number = 0.85;
  private isSpeakingState: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private pronunciationAudioCache: Map<string, HTMLAudioElement> = new Map();
  private listeners: Set<(speaking: boolean) => void> = new Set();
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;
  private keepAliveInterval: number | null = null;
  private isUnlocked: boolean = false;

  constructor() {
    this.initAudioContext();
    this.initSpeechVoices();
    this.attachAutoUnlock();
    this.preloadPronunciationAudio();
  }

  /**
   * Automatically unlocks Web Audio and SpeechSynthesis on first user interaction
   */
  private attachAutoUnlock() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      this.unlockAudio();
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  public unlockAudio() {
    if (this.isUnlocked) return;
    this.isUnlocked = true;

    // 1. Resume AudioContext if suspended
    this.initAudioContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    // 2. Refresh voices
    this.initSpeechVoices();

    // 3. Resume SpeechSynthesis if paused
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }
  }

  private initAudioContext() {
    if (typeof window === 'undefined') return;
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        try {
          this.audioCtx = new AudioContextClass();
        } catch (e) {
          console.warn('AudioContext init error:', e);
        }
      }
    }
  }

  private ensureAudioContextRunning(): AudioContext | null {
    this.initAudioContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  private initSpeechVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      try {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length > 0) {
          this.voices = v;
          this.voicesLoaded = true;
        }
      } catch (e) {
        console.warn('SpeechSynthesis voice loading warning:', e);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        loadVoices();
      };
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  public setSpeechRate(rate: number) {
    this.speechRate = Math.max(0.6, Math.min(1.4, rate));
  }

  public getSpeechRate(): number {
    return this.speechRate;
  }

  public subscribeToSpeechState(cb: (speaking: boolean) => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notifySpeechState(speaking: boolean) {
    this.isSpeakingState = speaking;
    this.listeners.forEach((cb) => cb(speaking));

    // Handle Chrome speech synthesis keep-alive for utterances
    if (speaking) {
      if (!this.keepAliveInterval && typeof window !== 'undefined') {
        this.keepAliveInterval = window.setInterval(() => {
          if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 10000);
      }
    } else {
      if (this.keepAliveInterval && typeof window !== 'undefined') {
        window.clearInterval(this.keepAliveInterval);
        this.keepAliveInterval = null;
      }
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public stopAll() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.notifySpeechState(false);
    this.currentUtterance = null;
  }

  /**
   * Find the highest quality Arabic voice available in the client browser
   */
  private getBestArabicVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

    let available = this.voices;
    if (!available || available.length === 0) {
      available = window.speechSynthesis.getVoices();
      this.voices = available;
    }

    if (!available || available.length === 0) return null;

    // 1. Dedicated Arabic locale matches (Saudi, Egypt, Emirates, etc.)
    const exactLocales = ['ar-SA', 'ar-EG', 'ar-AE', 'ar-XA', 'ar-KW', 'ar-QA', 'ar-OM', 'ar-JO', 'ar-LB', 'ar'];
    for (const loc of exactLocales) {
      const match = available.find((v) => v.lang.toLowerCase() === loc.toLowerCase());
      if (match) return match;
    }

    // 2. Any voice starting with 'ar'
    const anyAr = available.find((v) => v.lang.toLowerCase().startsWith('ar'));
    if (anyAr) return anyAr;

    // 3. Voice names containing known Arabic keywords
    const keywords = ['arabic', 'saudi', 'maged', 'tarik', 'laila', 'zeina', 'salma', 'youssef', 'hoda', 'naayf', 'mariam'];
    const nameMatch = available.find((v) =>
      keywords.some((kw) => v.name.toLowerCase().includes(kw))
    );
    if (nameMatch) return nameMatch;

    return null;
  }

  /**
   * Speak Arabic text with robust Chromium cancel fix, voice resolution, and tone fallback
   */
  public speakArabic(text: string, options?: { rate?: number; pitch?: number; onEnd?: () => void }) {
    if (!this.soundEnabled || !text) return;

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    // Ensure audio context is ready
    this.ensureAudioContextRunning();

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      // Never substitute a musical tone for spoken language.
      if (options?.onEnd) options.onEnd();
      return;
    }

    // Resume if paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const prepareAndSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      const arabicVoice = this.getBestArabicVoice();
      if (arabicVoice) {
        utterance.voice = arabicVoice;
        utterance.lang = arabicVoice.lang;
      } else {
        utterance.lang = 'ar-SA';
      }

      utterance.rate = options?.rate ?? this.speechRate;
      utterance.pitch = options?.pitch ?? 1.1; // friendly slightly higher pitch for kids
      utterance.volume = this.volume;

      utterance.onstart = () => {
        this.notifySpeechState(true);
      };

      utterance.onend = () => {
        this.notifySpeechState(false);
        this.currentUtterance = null;
        if (options?.onEnd) options.onEnd();
      };

      utterance.onerror = (e) => {
        if (e.error !== 'canceled') {
          console.warn('SpeechSynthesis event notice:', e.error);
        }
        this.notifySpeechState(false);
        this.currentUtterance = null;
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Failed to speak utterance:', err);
        this.notifySpeechState(false);
      }
    };

    // CRITICAL CHROMIUM BUG FIX:
    // If speaking or pending, cancel first, but wait 40ms before speaking next utterance
    // because calling cancel() immediately followed by speak() drops the new utterance in Chromium!
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
      setTimeout(prepareAndSpeak, 45);
    } else {
      prepareAndSpeak();
    }
  }

  /** Play recorded Arabic pronunciation so the sound is consistent across browsers. */
  public playLetterName(letterId: number, fallbackText: string) {
    this.playPronunciationAsset(
      `${import.meta.env.BASE_URL}audio/letters/names/${letterId}.mp3`,
      fallbackText
    );
  }

  public playLetterSound(letterId: number, fallbackText: string) {
    this.playPronunciationAsset(
      `${import.meta.env.BASE_URL}audio/letters/sounds/${letterId}.mp3`,
      fallbackText
    );
  }

  public playNumberPronunciation(number: number, fallbackText: string) {
    this.playPronunciationAsset(
      `${import.meta.env.BASE_URL}audio/numbers/${number}.mp3`,
      fallbackText
    );
  }

  public playExampleWord(letterId: number, fallbackText: string) {
    this.playPronunciationAsset(
      `${import.meta.env.BASE_URL}audio/words/${letterId}.mp3`,
      fallbackText
    );
  }

  /** Preload the short clips in the background so a tap doesn't wait for a network request. */
  private preloadPronunciationAudio() {
    if (typeof window === 'undefined') return;

    const base = import.meta.env.BASE_URL;
    const sources = [
      ...Array.from({ length: 28 }, (_, index) => `${base}audio/letters/names/${index + 1}.mp3`),
      ...Array.from({ length: 28 }, (_, index) => `${base}audio/letters/sounds/${index + 1}.mp3`),
      ...Array.from({ length: 28 }, (_, index) => `${base}audio/words/${index + 1}.mp3`),
      ...Array.from({ length: 101 }, (_, index) => `${base}audio/numbers/${index}.mp3`),
    ];

    for (const src of sources) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = src;
      audio.volume = this.volume;
      this.pronunciationAudioCache.set(src, audio);
      audio.load();
    }
  }

  private playPronunciationAsset(src: string, fallbackText: string) {
    if (!this.soundEnabled || typeof window === 'undefined') return;

    this.stopAll();
    let audio = this.pronunciationAudioCache.get(src);
    if (!audio) {
      audio = new Audio(src);
      this.pronunciationAudioCache.set(src, audio);
    }
    audio.preload = 'auto';
    audio.volume = this.volume;
    try {
      audio.currentTime = 0;
    } catch {
      // Metadata may not be ready yet; the pending preload will start at the beginning.
    }
    this.currentAudio = audio;

    const useSpeechFallback = () => {
      if (this.currentAudio !== audio) return;
      this.currentAudio = null;
      this.speakArabic(fallbackText);
    };

    audio.onended = () => {
      if (this.currentAudio === audio) this.currentAudio = null;
    };
    audio.onerror = useSpeechFallback;

    const playback = audio.play();
    if (playback) playback.catch(useSpeechFallback);
  }

  // --- Web Audio API kid-friendly sound effects (Instant, zero latency) ---

  public playTap() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.ensureAudioContextRunning();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // audio policy
    }
  }

  public playChime() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.ensureAudioContextRunning();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(this.volume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // audio policy
    }
  }

  public playCorrect() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.ensureAudioContextRunning();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Cheerful rising major triad (C5, E5, G5, C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];

      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        const startTime = now + index * 0.08;
        const duration = 0.22;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(this.volume * 0.25, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // audio policy
    }
  }

  public playWrong() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.ensureAudioContextRunning();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.35);

      gain.gain.setValueAtTime(this.volume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // audio policy
    }
  }

  public playStar() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.ensureAudioContextRunning();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [880, 1174.66, 1318.51, 1760];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        const startTime = now + idx * 0.06;
        gain.gain.setValueAtTime(this.volume * 0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.26);
      });
    } catch {
      // audio policy
    }
  }

  public playLevelUp() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.ensureAudioContextRunning();
      if (!ctx) return;

      const now = ctx.currentTime;
      const fanfare = [
        { f: 523.25, time: 0, dur: 0.15 },
        { f: 659.25, time: 0.15, dur: 0.15 },
        { f: 783.99, time: 0.3, dur: 0.2 },
        { f: 1046.5, time: 0.5, dur: 0.55 },
      ];

      fanfare.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, now + note.time);

        const st = now + note.time;
        gain.gain.setValueAtTime(0, st);
        gain.gain.linearRampToValueAtTime(this.volume * 0.3, st + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, st + note.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(st);
        osc.stop(st + note.dur);
      });
    } catch {
      // audio policy
    }
  }

  /**
   * Sound button test function: plays instant chime and speaks Arabic voice test
   */
  public playSoundButtonTest() {
    this.playCorrect();
    this.speakArabic('أهلاً بك يا بطل! الصوت يعمل بشكل ممتاز وجاهز لتعليمك الحروف والأرقام.');
  }
}

export const audioService = new AudioService();
