class AudioService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private volume: number = 0.8;
  private speechRate: number = 0.85;
  private isSpeakingState: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private speechRequestId = 0;
  private listeners: Set<(speaking: boolean) => void> = new Set();

  private getVoicesWhenReady(): Promise<SpeechSynthesisVoice[]> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return Promise.resolve([]);
    }

    const synthesis = window.speechSynthesis;
    const available = synthesis.getVoices();
    if (available.length > 0) return Promise.resolve(available);

    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        synthesis.removeEventListener('voiceschanged', finish);
        resolve(synthesis.getVoices());
      };
      synthesis.addEventListener('voiceschanged', finish, { once: true });
      window.setTimeout(finish, 500);
    });
  }

  private initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
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

  public setSpeechRate(rate: number) {
    this.speechRate = Math.max(0.6, Math.min(1.4, rate));
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
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public stopAll() {
    this.speechRequestId += 1;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.notifySpeechState(false);
      this.currentUtterance = null;
    }
  }

  /**
   * Speak Arabic text with kid-friendly tuning and guaranteed non-overlap
   */
  public speakArabic(text: string, options?: { rate?: number; pitch?: number; onEnd?: () => void }) {
    if (!this.soundEnabled || !text) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    this.stopAll();
    const requestId = ++this.speechRequestId;

    this.getVoicesWhenReady().then((voices) => {
      if (requestId !== this.speechRequestId || !this.soundEnabled) return;

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;
      const arabicVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('ar')) ||
        voices.find((voice) => /arabic|saudi|maged|tarik|laila/i.test(voice.name));

      if (arabicVoice) utterance.voice = arabicVoice;
      utterance.lang = arabicVoice?.lang || 'ar-SA';
      utterance.rate = options?.rate ?? this.speechRate;
      utterance.pitch = options?.pitch ?? 1.1;
      utterance.volume = this.volume;

      utterance.onstart = () => this.notifySpeechState(true);
      utterance.onend = () => {
        this.notifySpeechState(false);
        this.currentUtterance = null;
        options?.onEnd?.();
      };
      utterance.onerror = (event) => {
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          console.warn('Speech synthesis notice:', event.error);
        }
        this.notifySpeechState(false);
        this.currentUtterance = null;
      };

      // Chrome/Safari can leave the queue paused after a previous utterance.
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    });
  }

  // --- Web Audio API kid-friendly sound effects ---

  public playTap() {
    if (!this.soundEnabled) return;
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.09);
    } catch {
      // AudioContext policy
    }
  }

  public playCorrect() {
    if (!this.soundEnabled) return;
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      // Cheerful rising major triad (C5, E5, G5, C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];

      freqs.forEach((freq, index) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        const startTime = now + index * 0.08;
        const duration = 0.22;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(this.volume * 0.25, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // AudioContext policy
    }
  }

  public playWrong() {
    if (!this.soundEnabled) return;
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      // Gentle soft boing down
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.35);

      gain.gain.setValueAtTime(this.volume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // AudioContext policy
    }
  }

  public playStar() {
    if (!this.soundEnabled) return;
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const notes = [880, 1174.66, 1318.51, 1760];

      notes.forEach((freq, idx) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        const startTime = now + idx * 0.06;
        gain.gain.setValueAtTime(this.volume * 0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.26);
      });
    } catch {
      // AudioContext policy
    }
  }

  public playLevelUp() {
    if (!this.soundEnabled) return;
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      // Grand celebratory fanfare: C5, G5, C6, E6, G6
      const fanfare = [
        { f: 523.25, time: 0, dur: 0.15 },
        { f: 659.25, time: 0.15, dur: 0.15 },
        { f: 783.99, time: 0.3, dur: 0.2 },
        { f: 1046.5, time: 0.5, dur: 0.55 },
      ];

      fanfare.forEach((note) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, now + note.time);

        const st = now + note.time;
        gain.gain.setValueAtTime(0, st);
        gain.gain.linearRampToValueAtTime(this.volume * 0.3, st + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, st + note.dur);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(st);
        osc.stop(st + note.dur);
      });
    } catch {
      // AudioContext policy
    }
  }
}

export const audioService = new AudioService();
