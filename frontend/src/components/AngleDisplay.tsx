import type { PoseAngles } from '../types';

interface AngleDisplayProps {
  angles?: PoseAngles;
  exerciseType: string;
  isDetected: boolean; // ✅ THÊM: Biết có detect được người không
}

export const AngleDisplay = ({ angles, exerciseType, isDetected }: AngleDisplayProps) => {
  const getAngleColor = (angle: number, target: number, direction: 'up' | 'down') => {
    if (direction === 'up') {
      if (angle >= target) return 'text-green-600 bg-green-50';
      if (angle >= target - 20) return 'text-yellow-600 bg-yellow-50';
      return 'text-red-600 bg-red-50';
    } else {
      if (angle <= target) return 'text-green-600 bg-green-50';
      if (angle <= target + 20) return 'text-yellow-600 bg-yellow-50';
      return 'text-red-600 bg-red-50';
    }
  };

  const getProgressPercent = (angle: number, target: number, direction: 'up' | 'down') => {
    if (direction === 'up') {
      return Math.min((angle / target) * 100, 100);
    } else {
      return Math.min(((180 - angle) / (180 - target)) * 100, 100);
    }
  };

  const getStatusIcon = (angle: number, target: number, direction: 'up' | 'down') => {
    const isGood = direction === 'up' ? angle >= target : angle <= target;
    const isClose = direction === 'up' 
      ? angle >= target - 20 && angle < target
      : angle <= target + 20 && angle > target;
    return isGood ? '✅' : isClose ? '⚠️' : '❌';
  };

  // Determine which angles to display based on exercise type
  const angleConfigs: Array<{ key: string; label: string; target: number; direction: 'up' | 'down' }> = [];

  if (exerciseType === 'arm_raise') {
    angleConfigs.push(
      { key: 'left_shoulder', label: 'Vai trái', target: 160, direction: 'up' },
      { key: 'right_shoulder', label: 'Vai phải', target: 160, direction: 'up' }
    );
  } else if (exerciseType === 'squat') {
    angleConfigs.push(
      { key: 'left_knee', label: 'Gối trái', target: 90, direction: 'down' },
      { key: 'right_knee', label: 'Gối phải', target: 90, direction: 'down' }
    );
  } else if (exerciseType === 'single_leg_stand') {
    angleConfigs.push(
        { key: 'left_knee', label: 'Gối trái', target: 90, direction: 'down' },
        { key: 'right_knee', label: 'Gối phải', target: 90, direction: 'down' }
    );
    }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        📐 Góc Khớp
      </h3>

      {!isDetected ? (
        // ✅ Hiển thị khi chưa detect được người
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎥</div>
          <p className="text-lg font-semibold text-gray-700 mb-2">
            Đứng vào trước camera
          </p>
          <p className="text-base text-gray-500">
            để bắt đầu bài tập
          </p>
        </div>
      ) : !angles ? (
        // Đang detect nhưng chưa có angles
        <div className="text-center py-8">
          <div className="animate-pulse">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-lg text-gray-600">Đang phân tích...</p>
          </div>
        </div>
      ) : (
        // ✅ Hiển thị angles
        <div className="space-y-4">
          {angleConfigs.map((config) => {
            const angleValue = angles[config.key] || 0;
            const colorClass = getAngleColor(angleValue, config.target, config.direction);
            const progress = getProgressPercent(angleValue, config.target, config.direction);
            const status = getStatusIcon(angleValue, config.target, config.direction);

            return (
              <div key={config.key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-700">
                    {config.label}
                  </span>
                  <span className={`text-2xl font-bold px-3 py-1 rounded-lg ${colorClass}`}>
                    {Math.round(angleValue)}° {status}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      progress >= 100
                        ? 'bg-green-500'
                        : progress >= 80
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.max(progress, 5)}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Hiện tại: {Math.round(angleValue)}°</span>
                  <span>Mục tiêu: {config.target}°</span>
                </div>
              </div>
            );
          })}

            {/* Tip */}
            <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 italic">
                💡 {exerciseType === 'arm_raise' 
                ? 'Nâng tay thẳng lên cao, giữ khuỷu tay thẳng'
                : exerciseType === 'squat'
                ? 'Gập gối xuống sâu, giữ lưng thẳng'
                : exerciseType === 'single_leg_stand'
                ? 'Nâng đầu gối cao, giữ thăng bằng, nhìn thẳng phía trước'
                : ''
                }
            </p>
            </div>
        </div>
      )}
    </div>
  );
};