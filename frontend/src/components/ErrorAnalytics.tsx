import { useState, useEffect } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { sessionAPI, doctorAPI } from '../utils/api';
import type { ExerciseErrorAnalytics } from '../utils/types';

interface ErrorAnalyticsProps {
  patientId?: number; // Optional: for doctor view
}

export const ErrorAnalytics = ({ patientId }: ErrorAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<ExerciseErrorAnalytics[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [patientId]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = patientId 
        ? await doctorAPI.getPatientErrorAnalytics(patientId)
        : await sessionAPI.getErrorAnalytics();
      setAnalytics(data.analytics);
      if (data.analytics.length > 0) {
        setSelectedExercise(data.analytics[0].exercise_name);
      }
    } catch (error) {
      console.error('Failed to load error analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Phân Tích Lỗi Theo Bài Tập</h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  if (analytics.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Phân Tích Lỗi Theo Bài Tập</h3>
        <p className="text-lg text-gray-600">Chưa có dữ liệu lỗi</p>
      </div>
    );
  }

  const currentExercise = analytics.find(a => a.exercise_name === selectedExercise);
  
  // Prepare data for visualization
  const chartData = currentExercise?.errors.map(error => ({
    name: error.error_name,
    value: error.total_count,
    avgValue: error.avg_per_session,
    sessions: error.session_count,
  })) || [];

  // Custom tooltip for better UX
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-teal-500">
          <p className="font-bold text-gray-800 mb-2">{data.name}</p>
          <p className="text-orange-600 font-semibold">Tổng: {data.value} lần</p>
          <p className="text-amber-600 font-semibold">TB: {data.avgValue} lần/buổi</p>
          <p className="text-teal-600 font-semibold">Xuất hiện: {data.sessions} buổi</p>
        </div>
      );
    }
    return null;
  };

  // Color gradient for bars
  const COLORS = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4'];

  return (
    <div className="bg-gradient-to-br from-white to-teal-50 p-6 rounded-xl shadow-lg">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="text-3xl">📊</span>
        Lỗi Thường Gặp Theo Bài Tập
      </h3>
      
      {/* Exercise Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {analytics.map((exercise) => (
          <button
            key={exercise.exercise_name}
            onClick={() => setSelectedExercise(exercise.exercise_name)}
            className={`px-5 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-md ${
              selectedExercise === exercise.exercise_name
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-teal-50 border-2 border-gray-200'
            }`}
          >
            {exercise.exercise_name}
          </button>
        ))}
      </div>

      {/* Chart */}
      {currentExercise && currentExercise.errors.length > 0 ? (
        <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
          <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            Biểu đồ thống kê lỗi
          </h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              {/* Grid với style đẹp hơn */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                vertical={false}
              />
              
              {/* X Axis với style đẹp */}
              <XAxis 
                dataKey="name" 
                angle={-35}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ 
                  fill: '#4b5563', 
                  fontSize: 13,
                  fontWeight: 500
                }}
                stroke="#9ca3af"
                strokeWidth={2}
              />
              
              {/* Y Axis với style đẹp */}
              <YAxis 
                tick={{ 
                  fill: '#4b5563', 
                  fontSize: 13,
                  fontWeight: 500
                }}
                stroke="#9ca3af"
                strokeWidth={2}
                label={{ 
                  value: 'Số lần', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { 
                    fill: '#374151', 
                    fontWeight: 'bold',
                    fontSize: 14
                  }
                }}
              />
              
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(20, 184, 166, 0.1)' }} />
              
              <Bar 
                dataKey="value" 
                fill="#14b8a6" 
                radius={[12, 12, 0, 0]}
                barSize={60}
              >
                <LabelList 
                  dataKey="value" 
                  position="top" 
                  style={{ 
                    fill: '#0f766e', 
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }} 
                />
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-600 text-center py-8">Chưa có lỗi cho bài tập này</p>
      )}

      {/* Error Details Cards */}
      {currentExercise && currentExercise.errors.length > 0 && (
        <div>
          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Chi tiết lỗi
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentExercise.errors.map((error, index) => (
              <div 
                key={index}
                className="bg-white p-4 rounded-xl shadow-md border-l-4 hover:shadow-lg transition-shadow"
                style={{ borderLeftColor: COLORS[index % COLORS.length] }}
              >
                <h5 className="font-bold text-gray-800 mb-3 text-lg">{error.error_name}</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tổng số lần:</span>
                    <span className="font-bold text-xl text-orange-600">{error.total_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Trung bình/buổi:</span>
                    <span className="font-bold text-xl text-amber-600">{error.avg_per_session}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Xuất hiện:</span>
                    <span className="font-bold text-xl text-teal-600">{error.session_count} buổi</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
