import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessionAPI } from '../utils/api';
import { SessionCard } from '../components/SessionCard';
import { ProgressChart } from '../components/ProgressChart';
import { ErrorAnalytics } from '../components/ErrorAnalytics';
import type { Session } from '../types';

export const PatientHistory = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50 border-b-4 border-teal-600">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-teal-600 text-white p-2 rounded-lg">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-800">Rehab System</span>
            </Link>
            
            <div className="flex space-x-6 text-lg">
              <Link
                to="/"
                className="text-gray-600 hover:text-teal-600 flex items-center gap-2 transition"
              >
                🏠 Trang Chủ
              </Link>
              <Link
                to="/exercise"
                className="text-gray-600 hover:text-teal-600 flex items-center gap-2 transition"
              >
                💪 Bài Tập
              </Link>
              <Link
                to="/history"
                className="text-white bg-teal-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                📖 Lịch Sử
              </Link>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="text-gray-600 hover:text-red-600 font-semibold text-lg transition"
            >
              Đăng Xuất
            </button>
          </div>
        </div>
      </nav>

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ProgressChart sessions={sessions} />
              <ErrorAnalytics sessions={sessions} />
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
  );
};
