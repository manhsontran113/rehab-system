import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Session } from '../types';

interface ProgressChartProps {
  sessions: Session[];
}

export const ProgressChart = ({ sessions }: ProgressChartProps) => {
  // Prepare data for chart (reverse to show oldest to newest)
  const chartData = [...sessions]
    .reverse()
    .map((session, index) => ({
      session: `#${index + 1}`,
      accuracy: session.accuracy,
      reps: session.total_reps,
      date: new Date(session.start_time).toLocaleDateString('vi-VN', {
        month: 'short',
        day: 'numeric',
      }),
    }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Tiến Độ Tập Luyện</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" style={{ fontSize: '14px' }} />
          <YAxis yAxisId="left" style={{ fontSize: '14px' }} />
          <YAxis yAxisId="right" orientation="right" style={{ fontSize: '14px' }} />
          <Tooltip contentStyle={{ fontSize: '16px' }} />
          <Legend wrapperStyle={{ fontSize: '16px' }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="accuracy"
            stroke="#2563eb"
            strokeWidth={3}
            name="Độ chính xác (%)"
            activeDot={{ r: 8 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="reps"
            stroke="#16a34a"
            strokeWidth={3}
            name="Số lần tập"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
