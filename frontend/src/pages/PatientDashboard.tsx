import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessionAPI } from '../utils/api';
import type { Session } from '../types';

export const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentSessions();
  }, []);

  const loadRecentSessions = async () => {
    try {
      const data = await sessionAPI.getMyHistory(5);
      setRecentSessions(data.sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Vừa xong';
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Hôm qua';
    return `${diffDays} ngày trước`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Xin chào, {user?.full_name}!</h1>
            <p className="text-xl mt-1">Sẵn sàng tập luyện hôm nay</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition"
          >
            Đăng Xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Start Exercise Button */}
        <div className="mb-8">
          <Link
            to="/exercise"
            className="block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl p-10 shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-center">
              <svg className="w-16 h-16 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-4xl font-bold">Bắt Đầu Tập Luyện</span>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg mb-2">Tổng buổi tập</p>
            <p className="text-5xl font-bold text-blue-600">{recentSessions.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg mb-2">Độ chính xác TB</p>
            <p className="text-5xl font-bold text-green-600">
              {recentSessions.length > 0
                ? (recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length).toFixed(1)
                : '0'}%
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg mb-2">Tổng số lần</p>
            <p className="text-5xl font-bold text-purple-600">
              {recentSessions.reduce((sum, s) => sum + s.total_reps, 0)}
            </p>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Buổi Tập Gần Đây</h2>
            <Link
              to="/history"
              className="text-blue-600 hover:text-blue-700 font-semibold text-lg"
            >
              Xem tất cả →
            </Link>
          </div>

          {isLoading ? (
            <p className="text-center text-gray-600 py-8 text-lg">Đang tải...</p>
          ) : recentSessions.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-lg">
              Chưa có buổi tập nào. Hãy bắt đầu ngay!
            </p>
          ) : (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{session.exercise_name}</h3>
                      <p className="text-gray-600">{formatDate(session.start_time)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">{session.accuracy.toFixed(1)}%</p>
                      <p className="text-gray-600">{session.total_reps} lần</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
