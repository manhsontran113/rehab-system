import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { VideoCapture } from '../components/VideoCapture';
import { useWebSocket } from '../hooks/useWebSocket';
import { exerciseAPI, sessionAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import type { Exercise } from '../types';
import { AngleDisplay } from '../components/AngleDisplay';

export const ExercisePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [isExercising, setIsExercising] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<any>(null);

  const { isConnected, analysisData, sendFrame, resetCounter } = useWebSocket(
    selectedExercise || 'squat',
    isExercising
  );

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const data = await exerciseAPI.getExercises();
      setExercises(data.exercises);
      if (data.exercises.length > 0) {
        setSelectedExercise(data.exercises[0].id);
      }
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  const handleStart = async () => {
    if (!selectedExercise) return;

    try {
      const result = await sessionAPI.startSession(selectedExercise);
      setSessionId(result.session_id);
      setIsExercising(true);
      setShowSummary(false);
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Không thể bắt đầu buổi tập. Vui lòng thử lại.');
    }
  };

  const handleStop = async () => {
    setIsExercising(false);

    if (sessionId) {
      try {
        const result = await sessionAPI.endSession(sessionId);
        setSessionSummary(result);
        setShowSummary(true);
      } catch (error) {
        console.error('Failed to end session:', error);
      }
    }
  };

  const handleReset = () => {
    resetCounter();
  };

  const currentExercise = exercises.find((ex) => ex.id === selectedExercise);

  // Exercise details and instructions
  const exerciseDetails: Record<string, { difficulty: string; description: string; instructions: string[] }> = {
    squat: {
      difficulty: 'Trung bình',
      description: 'Bài tập tăng cường cơ chân và và hông',
      instructions: [
        'Đứng thẳng, hai tay duỗi thẳng hai bên',
        'Từ từ hạ thấp cơ thể xuống như ngồi ghế',
        'Giữ lưng thẳng trong suốt động tác',
        'Hạ tay từ từ về tư thế ban đầu',
      ],
    },
    arm_raise: {
      difficulty: 'Dễ',
      description: 'Bài tập vai và tay',
      instructions: [
        'Đứng thẳng, hai tay duỗi thẳng hai bên',
        'Từ từ nâng tay lên cao qua đầu',
        'Giữ tay thẳng trong suốt động tác',
        'Hạ tay từ từ về tư thế ban đầu',
      ],
    },

    // ✅ THÊM MỚI
    single_leg_stand: {
      difficulty: 'Trung bình',
      description: 'Bài tập cân bằng và cơ chân',
      instructions: [
        'Đứng cạnh ghế, tay phải nắm thành ghế',
        'Co chân trái lên cao, đầu gối nâng cao',
        'Tay trái giữ chân trái ở vị trí đó',
        'Giữ 10 giây, sau đó hạ chân xuống',
        'Đổi bên: tay trái nắm ghế, co chân phải',
        'Tay phải giữ chân phải, giữ 10 giây',
      ],
    },
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'Dễ') return 'text-green-600 bg-green-50';
    if (difficulty === 'Trung bình') return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
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
              className="text-white bg-teal-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
            >
              💪 Bài Tập
            </Link>
            <Link
              to="/history"
              className="text-gray-600 hover:text-teal-600 flex items-center gap-2 transition"
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

      {!showSummary ? (
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Bài Tập</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Video Area */}
            <div className="lg:col-span-2 space-y-4">
              {/* Exercise Progress Section */}
              <div className="bg-white rounded-lg p-6 shadow-md mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Tiến độ bài tập</h2>
                    <p className="text-gray-600">Mục tiêu: {currentExercise?.target_reps || 15} lần</p>
                  </div>
                  <div className="bg-teal-600 text-white px-8 py-4 rounded-lg">
                    <div className="text-4xl font-bold mb-1">
                      {isExercising ? analysisData?.rep_count || 0 : 0} / {currentExercise?.target_reps || 15}
                    </div>
                    <div className="text-center text-teal-100">Lần lặp</div>
                  </div>
                </div>
                
                {isExercising && (
                  <div className="mt-4 flex items-center">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse mr-2`}></div>
                    <span className="text-sm text-gray-600">
                      {isConnected ? 'Đang kết nối' : 'Mất kết nối'}
                    </span>
                  </div>
                )}
              </div>

              {/* Main Video Display */}
              <div className="bg-gray-900 rounded-lg overflow-hidden relative" style={{ aspectRatio: '16/9' }}>
                {isExercising ? (
                <VideoCapture
                  isActive={isExercising}
                  onFrame={sendFrame}
                  landmarks={analysisData?.landmarks}
                  feedback={analysisData?.feedback}
                  analysisData={{
                    hold_time_remaining: analysisData?.hold_time_remaining,
                    rep_count: analysisData?.rep_count
                  }}
                  currentExercise={{
                    target_reps: currentExercise?.target_reps || 10
                  }}
                />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📹</div>
                      <p className="text-2xl text-gray-400 mb-2">Camera sẽ bật khi bạn bắt đầu</p>
                      <p className="text-lg text-gray-500">Đảm bảo có đủ ánh sáng và không gian</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Control Button */}
              <button
                onClick={isExercising ? handleStop : handleStart}
                disabled={!selectedExercise}
                className={`w-full py-6 rounded-lg font-bold text-2xl transition shadow-lg ${
                  isExercising
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isExercising ? '⏹ Dừng Lại' : '▶ Bắt Đầu'}
              </button>

              {isExercising && (
                <button
                  onClick={handleReset}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 rounded-lg text-xl transition"
                >
                  🔄 Đặt Lại Bộ Đếm
                </button>
              )}

              {/* Instructions Section */}
              {currentExercise && (
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Hướng Dẫn: {currentExercise.name}
                  </h2>
                  <p className="text-lg text-gray-600 mb-4">
                    {exerciseDetails[currentExercise.id]?.description}
                  </p>
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-800 text-lg">Các bước thực hiện:</p>
                    {exerciseDetails[currentExercise.id]?.instructions.map((step, index) => (
                      <p key={index} className="text-gray-700 text-lg">
                        {index + 1}. {step}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Hướng Dẫn Placeholder */}
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📹 Video Hướng Dẫn</h3>
                <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-20 h-20 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg">
                      Video hướng dẫn sẽ được thêm vào đây
                    </p>
                    {/* Chỗ này bạn có thể chèn <video> hoặc <iframe> cho video hướng dẫn */}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Exercise Selection Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-md sticky top-24">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Chọn Bài Tập</h2>
                
                <div className="space-y-4">
                  {exercises.map((exercise) => {
                    const details = exerciseDetails[exercise.id];
                    const isSelected = selectedExercise === exercise.id;
                    
                    return (
                      <button
                        key={exercise.id}
                        onClick={() => !isExercising && setSelectedExercise(exercise.id)}
                        disabled={isExercising}
                        className={`w-full text-left p-4 rounded-lg border-2 transition ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-teal-300 bg-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-teal-500' : 'bg-gray-200'}`}>
                              {exercise.id === 'squat' ? (
                                <svg className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                              ) : (
                                <svg className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-800">{exercise.name}</h3>
                              <span className={`text-sm px-2 py-1 rounded ${getDifficultyColor(details?.difficulty || 'Dễ')}`}>
                                {details?.difficulty || 'Dễ'}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="text-teal-500">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{details?.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            ⏱️ {exercise.id === 'squat' ? '5-10 phút' : '5 phút'}
                          </span>
                          <span className="flex items-center gap-1">
                            🔁 {exercise.target_reps} lần
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <AngleDisplay 
                angles={analysisData?.angles} 
                exerciseType={selectedExercise || 'squat'}
                isDetected={analysisData?.pose_detected || false}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Session Summary */
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">🎉 Hoàn Thành!</h2>
              <div className="text-6xl font-bold text-green-600 mb-2">
                {sessionSummary?.accuracy?.toFixed(1)}%
              </div>
              <p className="text-xl text-gray-600">Độ chính xác</p>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <p className="text-gray-600 text-lg mb-2">Tổng số lần</p>
                <p className="text-4xl font-bold text-blue-600">{sessionSummary?.total_reps}</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <p className="text-gray-600 text-lg mb-2">Đúng kỹ thuật</p>
                <p className="text-4xl font-bold text-green-600">{sessionSummary?.correct_reps}</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <p className="text-gray-600 text-lg mb-2">Thời gian</p>
                <p className="text-4xl font-bold text-purple-600">
                  {Math.floor(sessionSummary?.duration_seconds / 60)}p
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowSummary(false);
                  setSessionId(null);
                }}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-5 px-6 rounded-lg text-xl transition"
              >
                Tập Tiếp
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-5 px-6 rounded-lg text-xl transition"
              >
                Về Trang Chủ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-600 text-lg">
            © 2024 AI-Powered Home Rehabilitation System
          </p>
          <p className="text-gray-500 mt-1">
            Được phát triển với ❤️ để hỗ trợ người cao tuổi
          </p>
        </div>
      </footer>
    </div>
  );
};