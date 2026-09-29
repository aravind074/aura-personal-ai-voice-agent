import { api } from './apiClient.js';

export class AudioService {
  private recognition: any = null;
  private wakeWordRecognition: any = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isListening = false;
  private isSpeaking = false;
  private isWakeWordActive = false;
  private hasHandledFinalTranscript = false;
  private latestInterimTranscript = '';
  private currentSessionId = 0;
  private lastProcessedTranscript = '';
  private lastProcessedTimestamp = 0;
  private speechCooldownUntil = 0;
  private silenceTimer: any = null;
  private animFrameId: number | null = null;
  private frequencyData: Uint8Array = new Uint8Array(64);
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private recordedMimeType = '';
  private hasUnlockedAudio = false;

  private onTranscriptCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onStateChangeCallback: ((speaking: boolean, listening: boolean) => void) | null = null;
  private onWakeWordDetectedCallback: (() => void) | null = null;

  constructor() {
    this.initSpeechRecognition();
    this.setupUserGestureAudioUnlock();
  }

  // Ensures AudioContext & SpeechSynthesis are immediately unlocked upon first touch/click on mobile devices
  private setupUserGestureAudioUnlock() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      if (this.hasUnlockedAudio) return;
      this.hasUnlockedAudio = true;

      try {
        const ctx = this.getAudioContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      } catch (e) {}

      // Pre-warm SpeechSynthesis on iOS Safari
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.getVoices();
        } catch (e) {}
      }

      window.removeEventListener('touchstart', unlock, true);
      window.removeEventListener('touchend', unlock, true);
      window.removeEventListener('click', unlock, true);
      window.removeEventListener('keydown', unlock, true);
    };

    window.addEventListener('touchstart', unlock, { capture: true, passive: true });
    window.addEventListener('touchend', unlock, { capture: true, passive: true });
    window.addEventListener('click', unlock, { capture: true, passive: true });
    window.addEventListener('keydown', unlock, { capture: true, passive: true });
  }

  public getAudioContext(): AudioContext {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
    return this.audioContext!;
  }

  // Detect optimal recording MIME type supported by current browser (iOS Safari, Android Chrome, Firefox, Desktop)
  private getSupportedMimeType(): string {
    if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) {
      return '';
    }
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus',
      'audio/wav',
    ];
    for (const type of candidates) {
      try {
        if (MediaRecorder.isTypeSupported(type)) {
          return type;
        }
      } catch (e) {}
    }
    return '';
  }

  private finalizeTranscript(text: string) {
    const trimmed = text.trim();
    if (!trimmed || this.hasHandledFinalTranscript) return;

    const now = Date.now();
    if (trimmed === this.lastProcessedTranscript && now - this.lastProcessedTimestamp < 1800) {
      return;
    }

    this.hasHandledFinalTranscript = true;
    this.latestInterimTranscript = '';
    this.lastProcessedTranscript = trimmed;
    this.lastProcessedTimestamp = now;
    this.recordedChunks = [];

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    if (this.onTranscriptCallback) {
      this.onTranscriptCallback(trimmed, true);
    }

    this.stopListening();
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        // Main interactive recognition
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;

        this.recognition.onresult = (event: any) => {
          if (this.isSpeaking || Date.now() < this.speechCooldownUntil) {
            return;
          }

          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = 0; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentBest = (finalTranscript || interimTranscript).trim();
          if (currentBest) {
            this.latestInterimTranscript = currentBest;
            if (this.onTranscriptCallback && !this.hasHandledFinalTranscript) {
              this.onTranscriptCallback(currentBest, false);
            }

            // Auto-detect speech pause / silence on mobile phones (1.3s pause)
            if (this.silenceTimer) clearTimeout(this.silenceTimer);
            this.silenceTimer = setTimeout(() => {
              if (this.isListening && this.latestInterimTranscript && !this.hasHandledFinalTranscript) {
                this.finalizeTranscript(this.latestInterimTranscript);
              }
            }, 1300);
          }

          const trimmedFinal = finalTranscript.trim();
          if (trimmedFinal && !this.hasHandledFinalTranscript) {
            this.finalizeTranscript(trimmedFinal);
          }
        };

        this.recognition.onerror = (event: any) => {
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            console.warn('[AudioService] Speech recognition notice:', event.error);
          }
        };

        this.recognition.onend = () => {
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
          }

          // If mobile speech recognition ended and we have accumulated speech, finalize it immediately!
          if (this.latestInterimTranscript && !this.hasHandledFinalTranscript) {
            this.finalizeTranscript(this.latestInterimTranscript);
          } else if (this.isListening) {
            this.stopListening();
          }
        };
      } catch (err) {
        console.warn('[AudioService] SpeechRecognition init:', err);
      }

      try {
        // Passive Wake Word Recognition
        this.wakeWordRecognition = new SpeechRecognition();
        this.wakeWordRecognition.continuous = true;
        this.wakeWordRecognition.interimResults = true;
        this.wakeWordRecognition.lang = 'en-US';

        this.wakeWordRecognition.onresult = (event: any) => {
          if (this.isSpeaking || Date.now() < this.speechCooldownUntil) return;

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const phrase = (event.results[i][0].transcript || '').toLowerCase().trim();
            if (
              phrase.includes('hey aura') ||
              phrase.includes('aura') ||
              phrase.includes('hey google') ||
              phrase.includes('siri') ||
              phrase.includes('hey siri')
            ) {
              console.log('[AudioService] Wake word detected:', phrase);
              this.stopWakeWordListener();
              this.playChime('siri-wake');
              if (this.onWakeWordDetectedCallback) {
                this.onWakeWordDetectedCallback();
              }
              this.startListening();
              break;
            }
          }
        };

        this.wakeWordRecognition.onerror = () => {};

        this.wakeWordRecognition.onend = () => {
          if (this.isWakeWordActive && !this.isListening && !this.isSpeaking && Date.now() >= this.speechCooldownUntil) {
            try {
              this.wakeWordRecognition.start();
            } catch (e) {}
          }
        };
      } catch (err) {
        console.warn('[AudioService] WakeWord init:', err);
      }
    }
  }

  setCallbacks(
    onTranscript: (text: string, isFinal: boolean) => void,
    onStateChange: (speaking: boolean, listening: boolean) => void,
    onWakeWordDetected?: () => void
  ) {
    this.onTranscriptCallback = onTranscript;
    this.onStateChangeCallback = onStateChange;
    if (onWakeWordDetected) {
      this.onWakeWordDetectedCallback = onWakeWordDetected;
    }
  }

  private notifyState() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.isSpeaking, this.isListening);
    }
  }

  enableWakeWord(enabled: boolean) {
    this.isWakeWordActive = enabled;
    if (enabled && !this.isListening && !this.isSpeaking) {
      this.startWakeWordListener();
    } else if (!enabled) {
      this.stopWakeWordListener();
    }
  }

  private startWakeWordListener() {
    if (this.wakeWordRecognition && this.isWakeWordActive && !this.isSpeaking && Date.now() >= this.speechCooldownUntil) {
      try {
        this.wakeWordRecognition.start();
      } catch (e) {}
    }
  }

  private stopWakeWordListener() {
    if (this.wakeWordRecognition) {
      try {
        this.wakeWordRecognition.stop();
      } catch (e) {}
    }
  }

  async startListening(): Promise<boolean> {
    this.stopWakeWordListener();

    if (this.isSpeaking) {
      this.stopSpeaking();
    }

    const sessionId = ++this.currentSessionId;
    this.hasHandledFinalTranscript = false;
    this.latestInterimTranscript = '';
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    try {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // 1. Acquire MediaStream with mobile compatibility fallback
      if (!this.micStream && navigator.mediaDevices?.getUserMedia) {
        try {
          this.micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
            video: false,
          });
        } catch (constraintErr) {
          // Fallback to basic audio constraint for mobile browsers
          try {
            this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          } catch (micErr) {
            console.warn('[AudioService] Microphone stream access error:', micErr);
          }
        }

        if (this.micStream && ctx) {
          try {
            this.analyser = ctx.createAnalyser();
            this.analyser.fftSize = 128;
            const source = ctx.createMediaStreamSource(this.micStream);
            source.connect(this.analyser);
          } catch (e) {}
        }
      }

      // 2. Start Speech Recognition
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch (e) {}
        try {
          this.recognition.start();
        } catch (e) {
          console.warn('[AudioService] recognition.start note:', e);
        }
      }

      // 3. Start MediaRecorder for multi-platform / mobile fallback
      if (this.micStream && typeof MediaRecorder !== 'undefined') {
        try {
          this.recordedChunks = [];
          const bestMime = this.getSupportedMimeType();
          this.recordedMimeType = bestMime;

          const options: MediaRecorderOptions = bestMime ? { mimeType: bestMime } : {};
          this.mediaRecorder = new MediaRecorder(this.micStream, options);
          this.recordedMimeType = this.mediaRecorder.mimeType || bestMime || 'audio/webm';

          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              this.recordedChunks.push(e.data);
            }
          };

          this.mediaRecorder.onstop = async () => {
            // If SpeechRecognition produced a transcript, skip network transcribe
            if (this.hasHandledFinalTranscript) return;

            if (this.recordedChunks.length > 0 && this.currentSessionId === sessionId) {
              const audioBlob = new Blob(this.recordedChunks, {
                type: this.recordedMimeType || 'audio/webm',
              });
              this.recordedChunks = [];
              const reader = new FileReader();
              reader.onloadend = async () => {
                const base64Data = (reader.result as string)?.split(',')[1];
                if (base64Data && !this.hasHandledFinalTranscript && this.currentSessionId === sessionId) {
                  try {
                    const res = await api.transcribeAudio(base64Data, audioBlob.type || this.recordedMimeType);
                    if (res.transcript && res.transcript.trim() && !this.hasHandledFinalTranscript) {
                      this.finalizeTranscript(res.transcript.trim());
                    }
                  } catch (err) {
                    console.warn('[AudioService] Multimodal transcription fallback note:', err);
                  }
                }
              };
              reader.readAsDataURL(audioBlob);
            }
          };

          this.mediaRecorder.start(250); // Collect slices every 250ms
        } catch (recErr) {
          console.warn('[AudioService] MediaRecorder start note:', recErr);
        }
      }

      this.isListening = true;
      this.notifyState();
      this.startAnalyserLoop();
      this.playChime('siri-wake');
      return true;
    } catch (err) {
      console.error('[AudioService] Failed to start listening:', err);
      this.isListening = false;
      this.notifyState();
      return false;
    }
  }

  stopListening() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }

    this.isListening = false;
    this.notifyState();
    this.playChime('siri-done');

    // Resume wake word listener if enabled
    if (this.isWakeWordActive && !this.isSpeaking && Date.now() >= this.speechCooldownUntil) {
      setTimeout(() => {
        if (!this.isListening && !this.isSpeaking) {
          this.startWakeWordListener();
        }
      }, 600);
    }
  }

  // Play spoken response via Gemini base64 PCM or browser SpeechSynthesis
  async speak(text: string, geminiBase64Audio?: string): Promise<void> {
    this.stopSpeaking();
    this.stopListening();
    this.stopWakeWordListener();
    this.isSpeaking = true;
    this.notifyState();

    const onPlaybackComplete = () => {
      this.isSpeaking = false;
      this.activeUtterance = null;
      this.speechCooldownUntil = Date.now() + 500;
      this.notifyState();
      if (this.isWakeWordActive) {
        setTimeout(() => {
          if (!this.isSpeaking && !this.isListening) {
            this.startWakeWordListener();
          }
        }, 550);
      }
    };

    if (geminiBase64Audio) {
      try {
        await this.playPcmAudio(geminiBase64Audio);
        onPlaybackComplete();
        return;
      } catch (e) {
        console.warn('[AudioService] PCM playback note, falling back to Web Speech:', e);
      }
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();

        const clean = text
          .replace(/[#*_`]/g, '')
          .replace(/\[.*?\]\(.*?\)/g, '')
          .replace(/https?:\/\/\S+/g, '')
          .trim();

        const utterance = new SpeechSynthesisUtterance(clean);
        this.activeUtterance = utterance; // Retain reference to prevent Safari GC bug
        utterance.rate = 1.02;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const naturalVoice =
          voices.find(
            (v) =>
              (v.name.includes('Natural') ||
                v.name.includes('Neural') ||
                v.name.includes('Google') ||
                v.name.includes('Samantha') ||
                v.name.includes('Daniel') ||
                v.name.includes('Siri') ||
                v.name.includes('Alex')) &&
              v.lang.startsWith('en')
          ) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0];

        if (naturalVoice) {
          utterance.voice = naturalVoice;
        }

        utterance.onend = () => {
          onPlaybackComplete();
        };

        utterance.onerror = () => {
          onPlaybackComplete();
        };

        this.startSynthesizedSpeechWaveform();
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        onPlaybackComplete();
      }
    } else {
      onPlaybackComplete();
    }
  }

  interrupt() {
    this.stopSpeaking();
    this.playChime('interrupt');
    this.startListening();
  }

  stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    this.activeUtterance = null;
    this.isSpeaking = false;
    this.speechCooldownUntil = Date.now() + 300;
    this.notifyState();
  }

  private async playPcmAudio(base64: string): Promise<void> {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    return new Promise((resolve) => {
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 128;
      source.connect(this.analyser);
      this.analyser.connect(ctx.destination);

      this.startAnalyserLoop();

      source.onended = () => {
        resolve();
      };

      source.start();
    });
  }

  private startSynthesizedSpeechWaveform() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    let step = 0;
    const update = () => {
      if (!this.isSpeaking) return;
      step += 0.15;
      for (let i = 0; i < this.frequencyData.length; i++) {
        const val = Math.sin(step + i * 0.2) * 55 + Math.cos(step * 0.7 + i * 0.3) * 45 + 95;
        this.frequencyData[i] = Math.max(10, Math.min(250, Math.floor(val)));
      }
      this.animFrameId = requestAnimationFrame(update);
    };
    this.animFrameId = requestAnimationFrame(update);
  }

  private startAnalyserLoop() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    const loop = () => {
      if (this.analyser && (this.isListening || this.isSpeaking)) {
        this.analyser.getByteFrequencyData(this.frequencyData as any);
      } else if (!this.isListening && !this.isSpeaking) {
        this.frequencyData.fill(0);
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  getFrequencyData(): Uint8Array {
    return this.frequencyData;
  }

  // Multi-frequency alert chimes using the shared unlocked AudioContext
  playChime(type: 'siri-wake' | 'siri-done' | 'interrupt' | 'success') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      if (type === 'siri-wake') {
        const t = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, t);
        gain1.gain.setValueAtTime(0, t);
        gain1.gain.linearRampToValueAtTime(0.12, t + 0.02);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(t);
        osc1.stop(t + 0.12);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880.0, t + 0.1);
        gain2.gain.setValueAtTime(0, t + 0.1);
        gain2.gain.linearRampToValueAtTime(0.14, t + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(t + 0.1);
        osc2.stop(t + 0.28);
      } else if (type === 'siri-done') {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(783.99, t);
        osc.frequency.exponentialRampToValueAtTime(523.25, t + 0.16);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.18);
      } else if (type === 'interrupt') {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, t);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
      } else if (type === 'success') {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, t);
        osc.frequency.setValueAtTime(659.25, t + 0.08);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.22);
      }
    } catch (e) {}
  }
}

export const audioService = new AudioService();
