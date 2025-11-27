import React, { useState } from 'react';
import { CalendarEvent, ViewMode } from '../types';
import { getStartOfWeek, addDays, isSameDay, formatTime, getEventTypeColor } from '../utils';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';

interface CalendarProps {
  events: CalendarEvent[];
  mode: ViewMode;
}

export const Calendar: React.FC<CalendarProps> = ({ events, mode }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrev = () => {
    setCurrentDate(prev => addDays(prev, mode === ViewMode.CALENDAR_WEEK ? -7 : -30));
  };

  const handleNext = () => {
    setCurrentDate(prev => addDays(prev, mode === ViewMode.CALENDAR_WEEK ? 7 : 30));
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));

  // Helper to render events in a cell
  const renderEventsForDay = (date: Date) => {
    const dayEvents = events.filter(e => isSameDay(new Date(e.start), date));
    return dayEvents.map(e => (
      <div 
        key={e.id} 
        className={`mb-1 p-1.5 rounded text-xs border-l-2 truncate ${getEventTypeColor(e.type)} hover:brightness-95 cursor-pointer transition-all`}
        title={`${e.title} (${formatTime(new Date(e.start))} - ${formatTime(new Date(e.end))})`}
      >
        <span className="font-semibold mr-1">{formatTime(new Date(e.start))}</span>
        {e.title}
      </div>
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-8rem)]">
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <CalIcon className="w-5 h-5 text-indigo-600" />
          {mode === ViewMode.CALENDAR_WEEK 
            ? `Tuần ${currentDate.toLocaleDateString('vi-VN', { week: 'numeric' })} - Tháng ${currentDate.getMonth() + 1}`
            : `Tháng ${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`
          }
        </h2>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button onClick={handlePrev} className="p-1 hover:bg-white rounded shadow-sm transition-all"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-medium hover:bg-white rounded shadow-sm transition-all">Hôm nay</button>
          <button onClick={handleNext} className="p-1 hover:bg-white rounded shadow-sm transition-all"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Week View */}
      {mode === ViewMode.CALENDAR_WEEK && (
        <div className="flex-1 grid grid-cols-7 divide-x divide-gray-200 min-h-0">
          {weekDays.map((date, idx) => (
            <div key={idx} className="flex flex-col min-h-0">
              <div className={`p-3 text-center border-b border-gray-200 ${isSameDay(date, new Date()) ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  {new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date)}
                </p>
                <p className={`text-lg font-bold mt-1 inline-flex items-center justify-center w-8 h-8 rounded-full ${isSameDay(date, new Date()) ? 'bg-indigo-600 text-white' : 'text-gray-900'}`}>
                  {date.getDate()}
                </p>
              </div>
              <div className="flex-1 p-2 overflow-y-auto space-y-2 bg-white">
                {renderEventsForDay(date)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Month View (Simplified Grid) */}
      {mode === ViewMode.CALENDAR_MONTH && (
        <div className="flex-1 p-4 flex items-center justify-center text-gray-500">
          Tính năng Lịch Tháng đang được cập nhật để hiển thị chi tiết hơn. Vui lòng sử dụng Lịch Tuần.
        </div>
      )}
    </div>
  );
};