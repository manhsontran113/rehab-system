import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionAPI } from '../utils/api';
import { SessionCard } from '../components/SessionCard';
import { SmartRecommendations } from '../components/SmartRecommendations';
import { HeatmapCalendar } from '../components/HeatmapCalendar';
import { Navbar } from '../components/Navbar';
import type { Session } from '../types';

export const PatientHistory = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter & Sort states
  const [filterExercise, setFilterExercise] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'accuracy' | 'reps'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  // Calculate current streak
  const calculateStreak = () => {
    if (sessions.length === 0) return 0;
    
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    const sessionDates = new Set(
      sortedSessions.map(s => {
        const d = new Date(s.start_time);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );
    
    // Check if there's a session today or yesterday
    const lastSessionDate = new Date(sortedSessions[0].start_time);
    lastSessionDate.setHours(0, 0, 0, 0);
    const daysSinceLastSession = Math.floor((today.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastSession > 1) {
      return 0; // Streak broken
    }
    
    // Count consecutive days
    while (true) {
      if (sessionDates.has(currentDate.getTime())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();

  // Get unique exercise types
  const exerciseTypes = Array.from(new Set(sessions.map(s => s.exercise_name)));

  // Filter and sort sessions
  const getFilteredAndSortedSessions = () => {
    let filtered = [...sessions];
    
    // Apply filter
    if (filterExercise !== 'all') {
      filtered = filtered.filter(s => s.exercise_name === filterExercise);
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
          break;
        case 'accuracy':
          comparison = a.accuracy - b.accuracy;
          break;
        case 'reps':
          comparison = a.total_reps - b.total_reps;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  };

  const filteredSessions = getFilteredAndSortedSessions();

  // Calculate weekly goal (target: 5 sessions per week)
  const getWeeklyProgress = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const sessionsThisWeek = sessions.filter(s => {
      const sessionDate = new Date(s.start_time);
      return sessionDate >= startOfWeek;
    });
    
    return {
      current: sessionsThisWeek.length,
      target: 5,
      percentage: Math.min((sessionsThisWeek.length / 5) * 100, 100)
    };
  };

  const weeklyProgress = getWeeklyProgress();

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
            {/* Smart Recommendations */}
            <SmartRecommendations sessions={sessions} />

            {/* Heatmap Calendar */}
            <HeatmapCalendar sessions={sessions} />

            {/* Weekly Goal Progress */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 p-6 rounded-xl shadow-lg mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🎯</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Mục tiêu tuần này</h3>
                    <p className="text-blue-100 text-sm">Tập ít nhất 5 buổi mỗi tuần</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-white">{weeklyProgress.current}/{weeklyProgress.target}</p>
                  <p className="text-blue-100 text-sm">buổi tập</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-blue-300/30 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${weeklyProgress.percentage}%` }}
                >
                  {weeklyProgress.percentage >= 20 && (
                    <span className="text-xs font-bold text-blue-600">
                      {weeklyProgress.percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              {weeklyProgress.percentage >= 100 && (
                <p className="text-white font-semibold mt-2 flex items-center gap-2">
                  <span>🎉</span>
                  <span>Xuất sắc! Bạn đã hoàn thành mục tiêu tuần này!</span>
                </p>
              )}
            </div>

            {/* Summary Stats with Streak */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
              {/* Streak Counter - Featured */}
              <div className="bg-gradient-to-br from-orange-400 to-red-500 dark:from-orange-500 dark:to-red-600 p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition-transform">
                <p className="text-white text-lg mb-2 font-semibold">Chuỗi ngày tập</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-6xl">🔥</span>
                  <p className="text-6xl font-bold text-white">{currentStreak}</p>
                </div>
                <p className="text-white/90 text-sm mt-2">
                  {currentStreak === 0 ? 'Bắt đầu chuỗi mới!' : currentStreak === 1 ? 'ngày liên tiếp' : 'ngày liên tiếp'}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">Tổng buổi tập</p>
                <p className="text-5xl font-bold text-teal-600 dark:text-teal-400">{sessions.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">Độ chính xác TB</p>
                <p className="text-5xl font-bold text-green-600 dark:text-green-400">
                  {(sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length).toFixed(1)}%
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">Tổng số lần</p>
                <p className="text-5xl font-bold text-purple-600 dark:text-purple-400">
                  {sessions.reduce((sum, s) => sum + s.total_reps, 0)}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">Tổng thời gian</p>
                <p className="text-5xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.floor(sessions.reduce((sum, s) => sum + s.duration_seconds, 0) / 60)}p
                </p>
              </div>
            </div>

            {/* Session List with Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Chi Tiết Các Buổi Tập</h2>
                
                {/* Filter & Sort Controls */}
                <div className="flex flex-wrap gap-3">
                  {/* Exercise Filter */}
                  <select
                    value={filterExercise}
                    onChange={(e) => setFilterExercise(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">🏋️ Tất cả bài tập</option>
                    {exerciseTypes.map(exercise => (
                      <option key={exercise} value={exercise}>{exercise}</option>
                    ))}
                  </select>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'accuracy' | 'reps')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="date">📅 Ngày tập</option>
                    <option value="accuracy">🎯 Độ chính xác</option>
                    <option value="reps">💪 Số lần tập</option>
                  </select>

                  {/* Sort Order */}
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                  >
                    {sortOrder === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần'}
                  </button>
                </div>
              </div>

              {/* Results count */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Hiển thị {filteredSessions.length} / {sessions.length} buổi tập
              </p>

              <div className="space-y-4">
                {filteredSessions.map((session, index) => (
                  <SessionCard 
                    key={session.id} 
                    session={session}
                    previousSession={index < filteredSessions.length - 1 ? filteredSessions[index + 1] : undefined}
                  />
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
