/**
 * Voice Service - Text-to-Speech using Web Speech API
 * Miễn phí, chạy trên browser, hỗ trợ tiếng Việt
 */

class VoiceService {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private enabled: boolean = true;
  private rate: number = 0.85; // Tốc độ chậm hơn cho người cao tuổi
  private pitch: number = 1.0;
  private volume: number = 1.0;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private speechQueue: string[] = [];
  private isSpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
      
      // Voices load asynchronously
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    } else {
      console.warn('Web Speech API not supported in this browser');
      this.synthesis = null as any;
    }
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices();
    console.log('Available voices:', this.voices.length);
    
    // Find Vietnamese voices
    const vietnameseVoices = this.voices.filter(voice => 
      voice.lang.includes('vi') || voice.lang.includes('VN')
    );
    console.log('Vietnamese voices:', vietnameseVoices);
  }

  private getVietnameseVoice(): SpeechSynthesisVoice | null {
    // Try to find Vietnamese voice
    const vnVoice = this.voices.find(voice => 
      voice.lang === 'vi-VN' || voice.lang === 'vi_VN'
    );
    
    if (vnVoice) return vnVoice;
    
    // Fallback to any voice with 'vi' in name
    const viVoice = this.voices.find(voice => 
      voice.lang.toLowerCase().includes('vi')
    );
    
    return viVoice || null;
  }

  /**
   * Speak text immediately (interrupts current speech)
   */
  speak(text: string, interrupt: boolean = false) {
    if (!this.synthesis || !this.enabled || !text) return;

    // Cancel current speech if interrupt
    if (interrupt && this.isSpeaking) {
      this.synthesis.cancel();
      this.speechQueue = [];
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set Vietnamese voice if available
    const vnVoice = this.getVietnameseVoice();
    if (vnVoice) {
      utterance.voice = vnVoice;
    }
    
    utterance.lang = 'vi-VN';
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.currentUtterance = utterance;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.processQueue();
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      this.isSpeaking = false;
      this.currentUtterance = null;
    };

    this.synthesis.speak(utterance);
  }

  /**
   * Add text to queue (waits for current speech to finish)
   */
  addToQueue(text: string) {
    if (!this.enabled || !text) return;
    
    this.speechQueue.push(text);
    
    if (!this.isSpeaking) {
      this.processQueue();
    }
  }

  private processQueue() {
    if (this.speechQueue.length > 0 && !this.isSpeaking) {
      const text = this.speechQueue.shift();
      if (text) {
        this.speak(text, false);
      }
    }
  }

  /**
   * Stop all speech
   */
  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.speechQueue = [];
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  /**
   * Pause speech
   */
  pause() {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume speech
   */
  resume() {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  // Settings
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
    localStorage.setItem('voiceEnabled', enabled.toString());
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setRate(rate: number) {
    this.rate = Math.max(0.5, Math.min(2, rate));
    localStorage.setItem('voiceRate', this.rate.toString());
  }

  getRate(): number {
    return this.rate;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('voiceVolume', this.volume.toString());
  }

  getVolume(): number {
    return this.volume;
  }

  // Load settings from localStorage
  loadSettings() {
    const enabled = localStorage.getItem('voiceEnabled');
    if (enabled !== null) {
      this.enabled = enabled === 'true';
    }

    const rate = localStorage.getItem('voiceRate');
    if (rate) {
      this.rate = parseFloat(rate);
    }

    const volume = localStorage.getItem('voiceVolume');
    if (volume) {
      this.volume = parseFloat(volume);
    }
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
voiceService.loadSettings();

// Voice messages library
export const VoiceMessages = {
  // Start/End
  start: 'Bắt đầu bài tập. Hãy đứng vào vị trí.',
  complete: 'Hoàn thành! Bạn đã làm rất tốt.',
  timeout: 'Hết giờ. Hãy nghỉ ngơi.',
  
  // Encouragement
  encouragement: {
    good: 'Tốt lắm!',
    veryGood: 'Rất tốt! Tiếp tục!',
    excellent: 'Bạn làm rất đúng!',
    keepGoing: 'Giữ vững nhé!',
  },
  
  // Rep milestones
  repCount: (count: number, target: number) => `${count} trong ${target} lần`,
  halfway: 'Đã được một nửa rồi!',
  almostDone: 'Sắp xong rồi!',
  lastRep: 'Rep cuối cùng!',
  
  // Time warnings
  timeRemaining: (seconds: number) => {
    if (seconds === 60) return 'Còn một phút';
    if (seconds === 30) return 'Còn ba mươi giây';
    if (seconds === 10) return 'Còn mười giây';
    return `Còn ${seconds} giây`;
  },
  
  // Error feedback (after 1.5s)
  errors: {
    // Arm raise
    shoulderNotHigh: 'Nâng tay cao hơn nữa',
    armsBent: 'Duỗi thẳng tay',
    notLowered: 'Hạ tay xuống hẳn',
    
    // Squat
    notDeep: 'Gập gối sâu hơn',
    kneesForward: 'Đẩy gối ra sau',
    notStraight: 'Đứng thẳng lên',
    
    // Single leg stand
    kneeBent: 'Gập gối sâu hơn',
    legNotBehind: 'Đưa chân ra sau',
    
    // Calf raise
    notRaised: 'Nâng gót chân cao hơn',
    kneesBent: 'Giữ chân thẳng',
  },
  
  // State instructions
  states: {
    armRaise: {
      down: 'Sẵn sàng. Nâng tay lên',
      raising: 'Tiếp tục nâng',
      up: 'Tốt. Hạ xuống',
      lowering: 'Hạ tay từ từ',
    },
    squat: {
      down: 'Đứng thẳng. Bắt đầu gập gối',
      lowering: 'Gập sâu hơn',
      up: 'Tốt lắm. Đứng lên',
      raising: 'Gần xong rồi',
    },
    singleLeg: {
      ready: (side: string) => `Co chân ${side === 'left' ? 'trái' : 'phải'} lên`,
      lifting: 'Tiếp tục',
      holding: (remaining: number) => `Giữ vững. Còn ${Math.ceil(remaining)} giây`,
      switching: 'Tốt. Chuyển sang chân kia',
    },
    calfRaise: {
      down: 'Sẵn sàng. Nâng gót lên',
      raising: 'Tiếp tục nâng',
      up: 'Giữ. Hạ xuống',
      lowering: 'Hạ từ từ',
    },
  },
  
  // Relaxation
  relaxation: {
    start: 'Bây giờ hãy thư giãn. Hít thở sâu và đều đặn.',
    breatheIn: 'Hít vào',
    breatheOut: 'Thở ra',
    halfway: 'Còn một phút rưỡi',
    almostDone: 'Còn ba mươi giây',
    complete: 'Xong. Bạn đã nghỉ ngơi đủ rồi.',
  },
};
