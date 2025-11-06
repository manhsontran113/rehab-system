import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { exerciseAPI, sessionAPI } from '../utils/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { VideoCapture } from '../components/VideoCapture';
import type { Exercise } from '../types';

const ExercisePage: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isExercising, setIsExercising] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionSummary, setSessionSummary] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);

  const { isConnected, analysisData, sendFrame, resetCounter } = useWebSocket(
    exerciseId || '',
    isExercising
  );

  useEffect(() => {
    const loadExercise = async () => {
      try {
        const response = await exerciseAPI.getExercises();
        const exercises = response.exercises;
        const found = exercises.find((ex: Exercise) => ex.id === exerciseId);
        if (found) {
          setExercise(found);
        } else {
          navigate('/patient');
        }
      } catch (error) {
        console.error('Failed to load exercise:', error);
        navigate('/patient');
      }
    };

    loadExercise();
  }, [exerciseId, navigate]);

  const handleStart = async () => {
    if (!exerciseId) return;

    try {
      const result = await sessionAPI.startSession(exerciseId);
      setSessionId(result.session_id);
      setIsExercising(true);
      setShowSummary(false);
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Không thể bắt đầu buổi tập. Vui lòng thử lại.');
    }
  };

  const handleEnd = async () => {
    if (!sessionId) return;

    setIsExercising(false);

    try {
      const result = await sessionAPI.endSession(sessionId);
      setSessionSummary(result);
      setShowSummary(true);
    } catch (error) {
      console.error('Failed to end session:', error);
      alert('Không thể kết thúc buổi tập. Vui lòng thử lại.');
    }
  };

  const handleReset = () => {
    resetCounter();
  };

  if (!exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (showSummary && sessionSummary) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-2xl shadow-teal-500/20 p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-4xl font-bold text-white mb-2">Hoàn Thành!</h2>
              <p className="text-xl text-gray-400">Bạn đã hoàn thành bài tập</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl p-6 text-center shadow-lg shadow-teal-500/30">
                <p className="text-xl mb-2 text-teal-50">Độ chính xác</p>
                <p className="text-5xl font-bold">{sessionSummary.accuracy?.toFixed(1)}%</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-6 text-center border border-gray-700">
                  <p className="text-lg text-gray-400 mb-2">Tổng số lần</p>
                  <p className="text-4xl font-bold text-white">{sessionSummary.total_reps}</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-6 text-center border border-gray-700">
                  <p className="text-lg text-gray-400 mb-2">Làm đúng</p>
                  <p className="text-4xl font-bold text-green-400">{sessionSummary.correct_reps}</p>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-6 text-center border border-gray-700">
                <p className="text-lg text-gray-400 mb-2">Thời gian</p>
                <p className="text-4xl font-bold text-cyan-400">
                  {Math.floor(sessionSummary.duration_seconds / 60)}:
                  {(sessionSummary.duration_seconds % 60).toString().padStart(2, '0')}
                </p>
              </div>

              {sessionSummary.common_errors && Object.keys(sessionSummary.common_errors).length > 0 && (
                <div className="bg-orange-500/10 rounded-xl p-6 border border-orange-500/30">
                  <h3 className="text-xl font-bold text-white mb-4">Lỗi cần cải thiện:</h3>
                  <div className="space-y-2">
                    {Object.entries(sessionSummary.common_errors).map(([error, count]: [string, any]) => (
                      <div key={error} className="flex justify-between text-lg">
                        <span className="text-gray-300">{error}</span>
                        <span className="font-semibold text-orange-400">{count} lần</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={() => {
                  setShowSummary(false);
                  setSessionSummary(null);
                }}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold text-xl py-5 rounded-xl transition-all shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transform hover:scale-105"
              >
                Tập Lại
              </button>
              <button
                onClick={() => navigate('/patient')}
                className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold text-xl py-5 rounded-xl transition-all"
              >
                Về Trang Chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{exercise.name}</h1>
              <p className="text-xl text-gray-400">{exercise.description}</p>
            </div>
            <button
              onClick={() => navigate('/patient')}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold text-lg px-6 py-3 rounded-lg transition-colors"
            >
              ← Quay lại
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Main Camera */}
          <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
            {isExercising ? (
              <VideoCapture
                isActive={isExercising}
                onFrame={sendFrame}
                landmarks={analysisData?.landmarks}
                feedback={analysisData?.feedback}
                repCount={analysisData?.rep_count}
                targetReps={exercise.target_reps}
              />
            ) : (
              <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-2xl text-white mb-2 font-semibold">Camera sẽ bật khi bạn bắt đầu</p>
                  <p className="text-lg text-gray-400">Đảm bảo có đủ ánh sáng và không gian</p>
                </div>
              </div>
            )}
          </div>

          {/* Tutorial Video */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg">
            <div className="p-4 border-b border-gray-700 bg-gray-800/50">
              <h3 className="text-xl font-bold text-white">Video Hướng Dẫn</h3>
              <p className="text-gray-400">Xem mẫu để thực hiện động tác chuẩn xác</p>
            </div>
            <div className="aspect-video bg-gradient-to-br from-gray-900 to-black relative">
              {exercise.id === 'squat' ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 p-8 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4">
                      <span className="text-6xl">🏋️‍♂️</span>
                    </div>
                    <p className="text-gray-400 text-lg">Video hướng dẫn Squat</p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 p-8 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4">
                      <span className="text-6xl">🙋‍♂️</span>
                    </div>
                    <p className="text-gray-400 text-lg">Video hướng dẫn Nâng Tay</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 shadow-lg p-6">
          <div className="flex gap-4">
            {!isExercising ? (
              <button
                onClick={handleStart}
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold text-2xl py-6 rounded-xl transition-all shadow-xl shadow-teal-500/30 hover:shadow-teal-500/50 transform hover:scale-105"
              >
                ▶️ Bắt Đầu Tập
              </button>
            ) : (
              <>
                <button
                  onClick={handleEnd}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-2xl py-6 rounded-xl transition-all shadow-xl shadow-red-500/30"
                >
                  ⏹️ Kết Thúc
                </button>
                <button
                  onClick={handleReset}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold text-xl px-8 rounded-xl transition-all"
                >
                  🔄 Reset
                </button>
              </>
            )}
          </div>

          {isExercising && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                {isConnected && (
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
                )}
              </div>
              <span className="text-lg text-gray-400">
                {isConnected ? 'Đang kết nối' : 'Mất kết nối'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExercisePage;
