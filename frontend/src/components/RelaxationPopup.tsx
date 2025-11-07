import { useEffect, useState, useRef } from 'react';
import { voiceService, VoiceMessages } from '../utils/voiceService';

interface RelaxationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  duration?: number; // seconds
}

export const RelaxationPopup = ({ isOpen, onClose, duration = 180 }: RelaxationPopupProps) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeRemaining(duration);
      setIsPlaying(true);

      // Voice: Start relaxation
      setTimeout(() => {
        voiceService.speak(VoiceMessages.relaxation.start, true);
      }, 500);

      // Play relaxation music
      if (audioRef.current) {
        audioRef.current.play().catch(err => console.log('Audio play failed:', err));
      }
    } else {
      // Stop music when closed
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isOpen, duration]);

  useEffect(() => {
    if (!isOpen || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Voice: Relaxation complete
          voiceService.speak(VoiceMessages.relaxation.complete, true);
          // Auto close when time's up
          setTimeout(() => onClose(), 2000);
          return 0;
        }
        
        // Voice warnings at specific times
        if (prev === 90) {
          voiceService.addToQueue(VoiceMessages.relaxation.halfway);
        } else if (prev === 30) {
          voiceService.addToQueue(VoiceMessages.relaxation.almostDone);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeRemaining, onClose]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipRelaxation = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration - timeRemaining) / duration) * 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      {/* Background animated circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl max-w-2xl w-full p-8 animate-scaleIn">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4 animate-bounce">🧘</div>
          <h2 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
            Nghỉ Thư Giãn
          </h2>
          <p className="text-xl text-white/80">
            Hãy thả lỏng cơ thể và hít thở sâu
          </p>
        </div>

        {/* Timer Display - Larger Circle */}
        <div className="text-center mb-12">
          <div className="inline-block relative">
            {/* Circular progress - Bigger size */}
            <svg className="w-72 h-72 transform -rotate-90">
              <circle
                cx="144"
                cy="144"
                r="132"
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="144"
                cy="144"
                r="132"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 132}`}
                strokeDashoffset={`${2 * Math.PI * 132 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="50%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Time in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-8xl font-bold text-white drop-shadow-2xl">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-lg text-white/70 mt-2 font-medium tracking-wide">còn lại</div>
            </div>
          </div>
        </div>

        {/* Breathing Animation - Improved Design */}
        <div className="text-center mb-10">
          <div className="relative inline-flex flex-col items-center justify-center gap-6">
            {/* Breathing bubble */}
            <div className="relative w-40 h-40">
              {/* Main bubble with glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/50 to-purple-500/50 rounded-full animate-breatheBubble shadow-2xl blur-sm"></div>
              {/* Middle layer */}
              <div className="absolute inset-3 bg-gradient-to-br from-blue-300/70 to-purple-400/70 rounded-full animate-breatheBubble shadow-xl" style={{ animationDelay: '0.15s' }}></div>
              {/* Inner layer */}
              <div className="absolute inset-6 bg-gradient-to-br from-blue-200/80 to-purple-300/80 rounded-full animate-breatheBubble shadow-lg" style={{ animationDelay: '0.3s' }}></div>
              {/* Core */}
              <div className="absolute inset-10 bg-gradient-to-br from-white/90 to-blue-100/90 rounded-full animate-breatheBubble" style={{ animationDelay: '0.45s' }}></div>
            </div>
            
            {/* Breathing instruction text - Beautiful typography */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-breatheText"></div>
                <span className="text-white text-2xl font-light tracking-wider animate-breatheText">
                  Hít vào
                </span>
                <div className="text-white/40 text-2xl">•</div>
                <span className="text-white text-2xl font-light tracking-wider animate-breatheText">
                  Thở ra
                </span>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-breatheText"></div>
              </div>
              <div className="text-white/50 text-sm font-light tracking-widest uppercase">
                Đều đặn và chậm rãi
              </div>
            </div>
          </div>
        </div>

        {/* Relaxation Tips */}
        <div className="bg-white/10 rounded-2xl p-6 mb-6 border border-white/20">
          <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
            <span>💡</span>
            <span>Hướng dẫn thư giãn:</span>
          </h3>
          <ul className="space-y-2 text-white/80">
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>Ngồi hoặc nằm ở tư thế thoải mái</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Hít thở sâu và đều đặn</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400">•</span>
              <span>Thả lỏng tất cả các cơ trong cơ thể</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400">•</span>
              <span>Đóng mắt và tập trung vào hơi thở</span>
            </li>
          </ul>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4">
          <button
            onClick={toggleMusic}
            className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold py-4 px-6 rounded-xl transition flex items-center justify-center gap-2"
          >
            {isPlaying ? (
              <>
                <span className="text-2xl">🔊</span>
                <span>Tắt Nhạc</span>
              </>
            ) : (
              <>
                <span className="text-2xl">🔇</span>
                <span>Bật Nhạc</span>
              </>
            )}
          </button>
          
          <button
            onClick={skipRelaxation}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
          >
            <span className="text-2xl">⏭️</span>
            <span>Bỏ Qua</span>
          </button>
        </div>

        {/* Audio Element */}
        <audio
          ref={audioRef}
          loop
          preload="auto"
        >
          {/* Using local relaxation music from backend */}
          <source src="http://localhost:8000/static/music_relax.mp3" type="audio/mpeg" />
        </audio>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes breatheBubble {
          0%, 100% { 
            transform: scale(0.8);
            opacity: 0.6;
          }
          50% { 
            transform: scale(1.2);
            opacity: 1;
          }
        }
        
        @keyframes breatheText {
          0%, 100% { 
            opacity: 0.7;
          }
          50% { 
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
        }
        
        .animate-breatheBubble {
          animation: breatheBubble 4s ease-in-out infinite;
        }
        
        .animate-breatheText {
          animation: breatheText 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
