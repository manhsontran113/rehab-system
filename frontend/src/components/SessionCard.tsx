import type { Session } from '../types';

interface SessionCardProps {
  session: Session;
}

export const SessionCard = ({ session }: SessionCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}p ${secs}s`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{session.exercise_name}</h3>
          <p className="text-gray-600">{formatDate(session.start_time)}</p>
        </div>
        <div className={`text-3xl font-bold ${getAccuracyColor(session.accuracy)}`}>
          {session.accuracy.toFixed(1)}%
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-sm text-gray-600">Tổng số lần</p>
          <p className="text-2xl font-bold text-blue-600">{session.total_reps}</p>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <p className="text-sm text-gray-600">Đúng kỹ thuật</p>
          <p className="text-2xl font-bold text-green-600">{session.correct_reps}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded">
          <p className="text-sm text-gray-600">Thời gian</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatDuration(session.duration_seconds)}
          </p>
        </div>
      </div>

      {session.errors && session.errors.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-2">Lỗi:</p>
          <div className="flex flex-wrap gap-2">
            {session.errors.slice(0, 3).map((error, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
              >
                {error.name} ({error.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
