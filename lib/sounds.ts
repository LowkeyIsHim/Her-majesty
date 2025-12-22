// Game sound effects using Web Audio API
class SoundEffects {
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  shoot() {
    this.playTone(800, 0.1, 'square');
  }

  hit() {
    this.playTone(400, 0.15, 'sawtooth');
  }

  miss() {
    this.playTone(200, 0.2, 'triangle');
  }

  collect() {
    this.playTone(600, 0.1, 'sine');
    setTimeout(() => this.playTone(800, 0.1, 'sine'), 50);
  }

  gameOver() {
    this.playTone(300, 0.3, 'sawtooth');
    setTimeout(() => this.playTone(250, 0.3, 'sawtooth'), 100);
    setTimeout(() => this.playTone(200, 0.5, 'sawtooth'), 200);
  }

  victory() {
    this.playTone(523, 0.1, 'sine'); // C
    setTimeout(() => this.playTone(659, 0.1, 'sine'), 100); // E
    setTimeout(() => this.playTone(784, 0.2, 'sine'), 200); // G
  }

  buttonClick() {
    this.playTone(600, 0.05, 'square');
  }

  countdown() {
    this.playTone(800, 0.1, 'square');
  }
}

export const sounds = new SoundEffects();
