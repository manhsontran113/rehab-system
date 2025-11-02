import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Session } from '../types';

interface ErrorAnalyticsProps {
  sessions: Session[];
}

export const ErrorAnalytics = ({ sessions }: ErrorAnalyticsProps) => {
  // Aggregate errors from all sessions
  const errorMap = new Map<string, number>();

  sessions.forEach((session) => {
    if (session.errors) {
      session.errors.forEach((error) => {
        const current = errorMap.get(error.name) || 0;
        errorMap.set(error.name, current + error.count);
      });
    }
  });

  // Convert to chart data
  const chartData = Array.from(errorMap.entries())
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 errors

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Phân Tích Lỗi</h3>
        <p className="text-lg text-gray-600">Chưa có dữ liệu lỗi</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Lỗi Thường Gặp</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" style={{ fontSize: '14px' }} />
          <YAxis style={{ fontSize: '14px' }} />
          <Tooltip contentStyle={{ fontSize: '16px' }} />
          <Legend wrapperStyle={{ fontSize: '16px' }} />
          <Bar dataKey="count" fill="#ea580c" name="Số lần" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
