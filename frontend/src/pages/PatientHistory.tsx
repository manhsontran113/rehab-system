import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionAPI } from '../utils/api';
import { SessionCard } from '../components/SessionCard';
import { ProgressChart } from '../components/ProgressChart';
import { ErrorAnalytics } from '../components/ErrorAnalytics';
import { Navbar } from '../components/Navbar';
import type { Session } from '../types';

export const PatientHistory = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await sessionAPI.getMyHistory(50);
      setSessions(data.sessions);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-6xl mx-auto p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-xl text-gray-600">Đang tải...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-2xl text-gray-600 mb-6">Chưa có buổi tập nào</p>
            <button
              onClick={() => navigate('/exercise')}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition"
            >
              Bắt Đầu Tập Ngay
            </button>
          </div>
        ) : (
          <>
            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              <ProgressChart sessions={sessions} />
              <ErrorAnalytics />
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-600 text-lg mb-2">Tổng buổi tập</p>
                <p className="text-5xl font-bold text-teal-600">{sessions.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-600 text-lg mb-2">Độ chính xác TB</p>
                <p className="text-5xl font-bold text-green-600">
                  {(sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length).toFixed(1)}%
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-600 text-lg mb-2">Tổng số lần</p>
                <p className="text-5xl font-bold text-purple-600">
                  {sessions.reduce((sum, s) => sum + s.total_reps, 0)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-600 text-lg mb-2">Tổng thời gian</p>
                <p className="text-5xl font-bold text-orange-600">
                  {Math.floor(sessions.reduce((sum, s) => sum + s.duration_seconds, 0) / 60)}p
                </p>
              </div>
            </div>

            {/* Session List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Chi Tiết Các Buổi Tập</h2>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
};
