import { useState, useEffect } from 'react';
import { voiceService } from '../utils/voiceService';

interface VoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceSettings = ({ isOpen, onClose }: VoiceSettingsProps) => {
  const [enabled, setEnabled] = useState(voiceService.isEnabled());
  const [rate, setRate] = useState(voiceService.getRate());
  const [volume, setVolume] = useState(voiceService.getVolume());

  useEffect(() => {
    setEnabled(voiceService.isEnabled());
    setRate(voiceService.getRate());
    setVolume(voiceService.getVolume());
  }, [isOpen]);

  const handleEnabledChange = (value: boolean) => {
    setEnabled(value);
    voiceService.setEnabled(value);
  };

  const handleRateChange = (value: number) => {
    setRate(value);
    voiceService.setRate(value);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    voiceService.setVolume(value);
  };

  const handleTest = () => {
    voiceService.speak('Xin chào! Tôi sẽ hướng dẫn bạn tập luyện.', true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔊</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cài Đặt Giọng Nói
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Enable/Disable Toggle */}
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Bật hướng dẫn giọng nói
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hệ thống sẽ đọc hướng dẫn và phản hồi
              </p>
            </div>
            <button
              onClick={() => handleEnabledChange(!enabled)}
              className={`relative w-14 h-8 rounded-full transition ${
                enabled
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  enabled ? 'translate-x-6' : ''
                }`}
              ></div>
            </button>
          </div>
        </div>

        {/* Speed Control */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Tốc độ đọc: {rate.toFixed(2)}x
            </span>
          </label>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={rate}
            onChange={(e) => handleRateChange(parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500 disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
            <span>Chậm</span>
            <span>Bình thường</span>
            <span>Nhanh</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Âm lượng: {Math.round(volume * 100)}%
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            disabled={!enabled}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500 disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
            <span>Nhỏ</span>
            <span>Vừa</span>
            <span>Lớn</span>
          </div>
        </div>

        {/* Test Button */}
        <button
          onClick={handleTest}
          disabled={!enabled}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition mb-4"
        >
          🎤 Thử Giọng Nói
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-xl transition"
        >
          Đóng
        </button>

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            💡 <strong>Mẹo:</strong> Giọng nói sẽ hướng dẫn bạn trong suốt bài tập,
            bao gồm động viên, cảnh báo lỗi và thông báo tiến độ.
          </p>
        </div>
      </div>
    </div>
  );
};
