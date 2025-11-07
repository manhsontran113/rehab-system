import { useMemo, useState } from 'react';
import type { Session } from '../types';

interface HeatmapCalendarProps {
  sessions: Session[];
}

type TimeFilter = '7days' | '1month' | '3months' | 'all';

export const HeatmapCalendar = ({ sessions }: HeatmapCalendarProps) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7days');

  // Daily data for 7-day view
  const dailyData = useMemo(() => {
    if (sessions.length === 0) {
      return [];
    }

    const today = new Date();
    const days: Array<{
      dayNumber: number;
      date: Date;
      sessions: number;
      goal: number;
      percentage: number;
      dayName: string;
    }> = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);

      // Count sessions on this day
      const daySessions = sessions.filter(session => {
        const sessionDate = new Date(session.start_time);
        return sessionDate >= date && sessionDate <= dateEnd;
      }).length;

      const goal = 3; // Goal: 3 sessions per day
      const percentage = Math.min((daySessions / goal) * 100, 100);

      const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' });

      days.push({
        dayNumber: 7 - i,
        date,
        sessions: daySessions,
        goal,
        percentage,
        dayName,
      });
    }

    return days;
  }, [sessions]);

  const weeklyData = useMemo(() => {
    if (sessions.length === 0) {
      return [];
    }

    // Find the earliest session date (user's first workout)
    const firstSession = sessions.reduce((earliest, session) => {
      const sessionDate = new Date(session.start_time);
      return sessionDate < earliest ? sessionDate : earliest;
    }, new Date(sessions[0].start_time));

    // Get the Monday of the first session's week
    const firstWeekStart = new Date(firstSession);
    const dayOfWeek = firstWeekStart.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 = Sunday
    firstWeekStart.setDate(firstWeekStart.getDate() - daysToMonday);
    firstWeekStart.setHours(0, 0, 0, 0);

    // Calculate number of weeks from first session to now
    const today = new Date();
    const currentWeekStart = new Date(today);
    const currentDayOfWeek = currentWeekStart.getDay();
    const daysToCurrentMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    currentWeekStart.setDate(currentWeekStart.getDate() - daysToCurrentMonday);
    currentWeekStart.setHours(0, 0, 0, 0);

    const weeksDiff = Math.floor((currentWeekStart.getTime() - firstWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const totalWeeks = weeksDiff + 1; // Include current week

    // Generate data for all weeks from first session to now
    const weeks: Array<{
      weekNumber: number;
      startDate: Date;
      endDate: Date;
      sessions: number;
      goal: number;
      percentage: number;
    }> = [];

    for (let i = 0; i < totalWeeks; i++) {
      const weekStart = new Date(firstWeekStart);
      weekStart.setDate(firstWeekStart.getDate() + (i * 7));

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Count sessions in this week
      const weekSessions = sessions.filter(session => {
        const sessionDate = new Date(session.start_time);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      }).length;

      const goal = 7; // Goal: 7 sessions per week (1 per day)
      const percentage = Math.min((weekSessions / goal) * 100, 100);

      weeks.push({
        weekNumber: i + 1,
        startDate: weekStart,
        endDate: weekEnd,
        sessions: weekSessions,
        goal,
        percentage,
      });
    }

    return weeks;
  }, [sessions]);

  // Determine if we should show daily or weekly view
  const showDailyView = timeFilter === '7days';

  // Filter weeks based on selected time range
  const filteredWeeks = useMemo(() => {
    if (timeFilter === 'all') {
      return weeklyData;
    }

    const today = new Date();
    let filterStartDate: Date;

    switch (timeFilter) {
      case '7days':
        // For daily view, we don't need to filter weeks
        return weeklyData;
      case '1month':
        // Last 4 weeks
        filterStartDate = new Date(today);
        filterStartDate.setDate(today.getDate() - 28);
        break;
      case '3months':
        // Last 12 weeks
        filterStartDate = new Date(today);
        filterStartDate.setDate(today.getDate() - 84);
        break;
      default:
        return weeklyData;
    }

    return weeklyData.filter(week => week.startDate >= filterStartDate);
  }, [weeklyData, timeFilter]);

  const formatDateRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    const endStr = end.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    return `${startStr} - ${endStr}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const getCircleColor = (percentage: number, sessionCount: number) => {
    // No sessions - special styling
    if (sessionCount === 0) {
      return {
        stroke: 'stroke-gray-300 dark:stroke-gray-600',
        fill: 'fill-gray-300 dark:fill-gray-600',
        bg: 'bg-gray-50 dark:bg-gray-800/50',
        border: 'border-gray-300 dark:border-gray-600',
        text: 'text-gray-500 dark:text-gray-400',
        label: 'Chưa tập 😴'
      };
    }
    
    if (percentage >= 80) {
      return {
        stroke: 'stroke-green-500',
        fill: 'fill-green-500',
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-700 dark:text-green-300',
        label: 'Xuất sắc! 🌟'
      };
    } else if (percentage >= 60) {
      return {
        stroke: 'stroke-teal-500',
        fill: 'fill-teal-500',
        bg: 'bg-teal-50 dark:bg-teal-900/20',
        border: 'border-teal-200 dark:border-teal-800',
        text: 'text-teal-700 dark:text-teal-300',
        label: 'Tốt lắm! 👍'
      };
    } else if (percentage >= 40) {
      return {
        stroke: 'stroke-yellow-500',
        fill: 'fill-yellow-500',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        text: 'text-yellow-700 dark:text-yellow-300',
        label: 'Cố lên! 💪'
      };
    } else {
      return {
        stroke: 'stroke-orange-500',
        fill: 'fill-orange-500',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        text: 'text-orange-700 dark:text-orange-300',
        label: 'Cần cố gắng hơn 🎯'
      };
    }
  };

  // Calculate stats based on filtered data (daily or weekly)
  const totalSessions = showDailyView 
    ? dailyData.reduce((sum, day) => sum + day.sessions, 0)
    : filteredWeeks.reduce((sum, week) => sum + week.sessions, 0);
  
  const totalPeriods = showDailyView ? dailyData.length : filteredWeeks.length;
  const averagePerPeriod = showDailyView
    ? totalPeriods > 0 ? (totalSessions / totalPeriods).toFixed(1) : '0'
    : totalPeriods > 0 ? (totalSessions / totalPeriods).toFixed(1) : '0';
  
  const bestPeriod = showDailyView
    ? (dailyData.length > 0 
        ? dailyData.reduce((max, day) => day.sessions > max.sessions ? day : max, dailyData[0])
        : null)
    : (filteredWeeks.length > 0 
        ? filteredWeeks.reduce((max, week) => week.sessions > max.sessions ? week : max, filteredWeeks[0])
        : null);

  const getFilterLabel = () => {
    switch (timeFilter) {
      case '7days': return '7 ngày';
      case '1month': return '1 tháng';
      case '3months': return '3 tháng';
      case 'all': return 'Tất cả';
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">📊</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Chưa có dữ liệu tập luyện
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Hãy bắt đầu buổi tập đầu tiên của bạn!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <span>Tiến độ tập luyện</span>
          </h3>
          
          {/* Time Filter Dropdown */}
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              className="appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-base font-medium rounded-lg px-4 py-2.5 pr-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
            >
              <option value="7days">📅 7 ngày qua</option>
              <option value="1month">📆 1 tháng qua</option>
              <option value="3months">📊 3 tháng qua</option>
              <option value="all">🌐 Tất cả</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-300">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
              Tổng số buổi tập {timeFilter !== 'all' && `(${getFilterLabel()})`}
            </div>
            <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">{totalSessions}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
              Trung bình mỗi {showDailyView ? 'ngày' : 'tuần'}
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{averagePerPeriod}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
              {showDailyView ? 'Ngày' : 'Tuần'} tốt nhất
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {bestPeriod ? `${bestPeriod.sessions} buổi` : '0 buổi'}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Circles Grid */}
      {(showDailyView ? dailyData.length === 0 : filteredWeeks.length === 0) ? (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">📭</span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Không có dữ liệu trong khoảng thời gian này
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Thử chọn khoảng thời gian khác
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {(showDailyView ? dailyData : filteredWeeks).map((period) => {
          const colors = getCircleColor(period.percentage, period.sessions);
          const radius = 45;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (period.percentage / 100) * circumference;

          const isDay = 'dayName' in period;
          const label = isDay 
            ? period.dayName 
            : `Tuần ${(period as typeof filteredWeeks[0]).weekNumber}`;
          const dateLabel = isDay
            ? formatDate(period.date)
            : formatDateRange((period as typeof filteredWeeks[0]).startDate, (period as typeof filteredWeeks[0]).endDate);

          return (
            <div
              key={isDay ? period.dayNumber : (period as typeof filteredWeeks[0]).weekNumber}
              className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4 transition-all hover:scale-105 hover:shadow-lg`}
            >
              {/* Period Label */}
              <div className="text-center mb-3">
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {label}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {dateLabel}
                </div>
              </div>

              {/* Progress Circle */}
              <div className="relative flex justify-center items-center mb-3">
                {period.sessions === 0 ? (
                  /* Empty state for no sessions */
                  <div className="flex flex-col items-center justify-center w-[120px] h-[120px]">
                    <div className="text-5xl mb-2">😴</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Chưa tập
                    </div>
                  </div>
                ) : (
                  <>
                    <svg className="transform -rotate-90" width="120" height="120">
                      {/* Background circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className={colors.stroke}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{
                          transition: 'stroke-dashoffset 1s ease-in-out',
                        }}
                      />
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className={`text-2xl font-bold ${colors.text}`}>
                        {Math.round(period.percentage)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {period.sessions}/{period.goal}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Status Label */}
              <div className={`text-center text-sm font-semibold ${colors.text}`}>
                {colors.label}
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-200 dark:border-green-800">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span className="text-gray-800 dark:text-gray-200 font-medium">≥80%: Xuất sắc</span>
        </div>
        <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/20 p-2 rounded-lg border border-teal-200 dark:border-teal-800">
          <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
          <span className="text-gray-800 dark:text-gray-200 font-medium">≥60%: Tốt</span>
        </div>
        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          <span className="text-gray-800 dark:text-gray-200 font-medium">≥40%: Khá</span>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
          <span className="text-gray-800 dark:text-gray-200 font-medium">&lt;40%: Cần cố gắng</span>
        </div>
      </div>
    </div>
  );
};
