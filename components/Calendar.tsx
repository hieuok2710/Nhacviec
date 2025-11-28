
import React, { useState, useEffect, useRef } from 'react';
import { CalendarEvent, ViewMode, EventType } from '../types';
import { getStartOfWeek, addDays, isSameDay, formatTime, getWeekNumber, hexToRgba } from '../utils';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, MapPin } from 'lucide-react';

interface CalendarProps {
  events: CalendarEvent[];
  mode: ViewMode;
  onUpdateEvent: (event: CalendarEvent) => void;
  eventColors: Record<EventType, string>;
}

export const Calendar: React.FC<CalendarProps> = ({ events, mode, onUpdateEvent, eventColors }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cấu hình khung giờ làm việc: 07:00 - 18:00 (Leader Standard)
  const START_HOUR = 7;
  const END_HOUR = 18; 
  const HOUR_HEIGHT = 80; // Tăng chiều cao để hiển thị thông tin rõ hơn

  const handlePrev = () => {
    setCurrentDate(prev => addDays(prev, mode === ViewMode.CALENDAR_WEEK ? -7 : -30));
  };

  const handleNext = () => {
    setCurrentDate(prev => addDays(prev, mode === ViewMode.CALENDAR_WEEK ? 7 : 30));
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  // Auto scroll to 8 AM or current time on mount
  useEffect(() => {
    if (scrollRef.current && mode === ViewMode.CALENDAR_WEEK) {
        const now = new Date();
        const hour = now.getHours();
        const targetHour = (hour >= START_HOUR && hour <= END_HOUR) ? hour : 8;
        scrollRef.current.scrollTop = (targetHour - START_HOUR) * HOUR_HEIGHT - 40; // Minus offset for breathing room
    }
  }, [mode]);

  // --- Drag and Drop Logic ---

  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    setDraggedEventId(eventId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', eventId);
    
    // Create a ghost image if needed, or rely on browser default
    // const crt = e.currentTarget.cloneNode(true) as HTMLElement;
    // crt.style.opacity = "1"; 
    // e.dataTransfer.setDragImage(crt, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropWeek = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (!draggedEventId) return;
    
    const event = events.find(e => e.id === draggedEventId);
    if (!event) return;

    // Calculate time based on Y position inside the column
    // We use currentTarget (the column div) to get the bounding rect
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Clamp y to ensure we don't go out of bounds (negative or too large)
    const clampedY = Math.max(0, Math.min(y, rect.height));
    
    // Calculate minutes from start of day (START_HOUR)
    const minutesFromStart = (clampedY / HOUR_HEIGHT) * 60;
    
    // Snap to nearest 15 minutes
    const snappedMinutes = Math.round(minutesFromStart / 15) * 15;
    
    const newStart = new Date(targetDate);
    newStart.setHours(START_HOUR, 0, 0, 0); // Start at 7:00 base
    newStart.setMinutes(snappedMinutes);
    
    // Calculate duration to preserve it
    const duration = new Date(event.end).getTime() - new Date(event.start).getTime();
    const newEnd = new Date(newStart.getTime() + duration);
    
    // Validation: Don't allow end time to exceed reasonably (e.g., next day) if desired, 
    // but here we just update.
    
    onUpdateEvent({ ...event, start: newStart, end: newEnd });
    setDraggedEventId(null);
  };

  const handleDropMonth = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (!draggedEventId) return;

    const event = events.find(e => e.id === draggedEventId);
    if (!event) return;

    // Preserve time, change date
    const newStart = new Date(targetDate);
    newStart.setHours(new Date(event.start).getHours(), new Date(event.start).getMinutes());
    
    const duration = new Date(event.end).getTime() - new Date(event.start).getTime();
    const newEnd = new Date(newStart.getTime() + duration);
    
    onUpdateEvent({ ...event, start: newStart, end: newEnd });
    setDraggedEventId(null);
  };

  // --- Helper for Month View ---
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the beginning of the week of the 1st
    const startDate = getStartOfWeek(firstDay);
    
    // End at the end of the week of the last day
    const endOfWeekLastDay = addDays(getStartOfWeek(lastDay), 6);
    
    const days: Date[] = [];
    let current = startDate;
    while (current <= endOfWeekLastDay) {
        days.push(new Date(current));
        current = addDays(current, 1);
    }
    return days;
  };

  // Hàm tính toán vị trí và xử lý chồng lấn (Overlapping Events)
  const getEventLayout = (event: CalendarEvent, dayEvents: CalendarEvent[]) => {
    const start = new Date(event.start);
    const end = new Date(event.end);

    const startHour = start.getHours();
    const startMin = start.getMinutes();
    
    // Vị trí dọc (Vertical)
    const minutesFromStart = (startHour - START_HOUR) * 60 + startMin;
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    // Tính toán chồng lấn (Overlap)
    // Tìm tất cả sự kiện có xung đột thời gian với sự kiện này
    const overlappingEvents = dayEvents.filter(e => 
      e.id !== event.id && 
      new Date(e.start) < end && 
      new Date(e.end) > start
    );

    // Gom nhóm để tính toán width và left
    const conflictGroup = [event, ...overlappingEvents].sort((a, b) => 
        new Date(a.start).getTime() - new Date(b.start).getTime() || a.id.localeCompare(b.id)
    );
    
    const index = conflictGroup.findIndex(e => e.id === event.id);
    const count = conflictGroup.length;

    // Chia cột nếu có chồng lấn
    const widthPercent = 100 / count;
    const leftPercent = index * widthPercent;

    return {
      top: `${(minutesFromStart / 60) * HOUR_HEIGHT}px`,
      height: `${Math.max((durationMinutes / 60) * HOUR_HEIGHT, 28)}px`, // Min height 28px để không bị quá nhỏ
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  const renderCurrentTimeLine = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    
    if (currentHour < START_HOUR || currentHour > END_HOUR) return null;

    const minutesFromStart = (currentHour - START_HOUR) * 60 + currentMin;
    const top = (minutesFromStart / 60) * HOUR_HEIGHT;

    return (
        <div 
            className="absolute left-0 right-0 z-30 pointer-events-none flex items-center group"
            style={{ top: `${top}px` }}
        >
            <div className="w-full border-t-2 border-red-500 shadow-sm opacity-80 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute -left-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm -mt-[1px] flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <span className="absolute left-3 -top-6 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {formatTime(now)}
            </span>
        </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
      {/* Calendar Header */}
      <div className="flex-none p-4 border-b border-gray-200 flex items-center justify-between bg-white z-20">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <CalIcon className="w-5 h-5 text-indigo-600" />
          <span className="uppercase tracking-wide text-base">
            {mode === ViewMode.CALENDAR_WEEK 
              ? `Lịch Tuần ${getWeekNumber(currentDate)}`
              : `Lịch Tháng ${currentDate.getMonth() + 1}`
            }
          </span>
          <span className="text-gray-400 font-normal mx-1">|</span>
          <span className="text-gray-600 font-medium">Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}</span>
        </h2>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button onClick={handlePrev} className="p-1.5 hover:bg-white rounded-md shadow-sm transition-all text-gray-600"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-xs font-bold uppercase text-gray-600 hover:text-indigo-600 hover:bg-white rounded-md shadow-sm transition-all">Hôm nay</button>
          <button onClick={handleNext} className="p-1.5 hover:bg-white rounded-md shadow-sm transition-all text-gray-600"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Week View Grid */}
      {mode === ViewMode.CALENDAR_WEEK && (
        <div className="flex flex-col flex-1 min-h-0 bg-white">
          {/* Day Headers (Sticky) */}
          <div className="flex border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm flex-none mr-[6px] z-20">
            <div className="w-20 flex-none border-r border-gray-200 bg-gray-50/50"></div> {/* Time gutter header */}
            <div className="grid grid-cols-7 flex-1 divide-x divide-gray-200">
                {weekDays.map((date, idx) => {
                    const isToday = isSameDay(date, new Date());
                    return (
                        <div key={idx} className={`py-3 text-center ${isToday ? 'bg-indigo-50/40' : ''}`}>
                            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-indigo-700' : 'text-gray-500'}`}>
                                {new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(date)}
                            </p>
                            <div className={`w-9 h-9 mx-auto flex items-center justify-center rounded-full text-xl font-bold transition-all ${isToday ? 'bg-indigo-600 text-white shadow-lg scale-110' : 'text-gray-700 hover:bg-gray-200'}`}>
                                {date.getDate()}
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>

          {/* Time Grid Body (Scrollable) */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto relative custom-scrollbar scroll-smooth">
             <div className="flex min-h-[800px]">
                {/* Time Labels Column */}
                <div className="w-20 flex-none border-r border-gray-100 bg-white sticky left-0 z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
                    {hours.map((hour) => (
                        <div key={hour} className="relative group" style={{ height: `${HOUR_HEIGHT}px` }}>
                            <span className="absolute -top-3 right-3 text-xs font-semibold text-gray-400 group-hover:text-indigo-600 transition-colors bg-white px-1">
                                {hour}:00
                            </span>
                            {/* Half hour marker hint */}
                            <div className="absolute top-1/2 right-0 w-2 border-t border-gray-200"></div>
                        </div>
                    ))}
                </div>

                {/* Event Columns Grid */}
                <div className="flex-1 grid grid-cols-7 divide-x divide-gray-100 relative bg-white">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 z-0 flex flex-col pointer-events-none">
                         {hours.map((hour) => (
                            <div key={hour} className="border-t border-gray-100 w-full" style={{ height: `${HOUR_HEIGHT}px` }}>
                                {/* Optional: Dashed line for half hour */}
                                <div className="h-full border-b border-gray-50 border-dashed w-full relative top-[-1px] opacity-50"></div>
                            </div>
                         ))}
                    </div>
                    
                    {/* Current Time Indicator Line (Crosses all days) */}
                    {weekDays.some(d => isSameDay(d, new Date())) && renderCurrentTimeLine()}

                    {/* Events per Day */}
                    {weekDays.map((date, colIdx) => {
                        const dayEvents = events.filter(e => isSameDay(new Date(e.start), date));
                        const isToday = isSameDay(date, new Date());
                        
                        return (
                            <div 
                                key={colIdx} 
                                className={`relative z-10 h-full group ${isToday ? 'bg-indigo-50/10' : ''}`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDropWeek(e, date)}
                            >
                                {/* Column Hover Highlight */}
                                <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none"></div>
                                
                                {dayEvents.map(event => {
                                    const layoutStyle = getEventLayout(event, dayEvents);
                                    
                                    // Dynamic Styling based on User Preferences
                                    const baseColor = eventColors[event.type] || '#3b82f6';
                                    const eventStyle = {
                                        backgroundColor: hexToRgba(baseColor, 0.15),
                                        color: baseColor, // Darker text handled by using base color
                                        borderLeftColor: baseColor,
                                        borderLeftWidth: '4px',
                                        borderStyle: 'solid',
                                        // Need to explicitly set other borders to transparent or thin
                                        borderTop: `1px solid ${hexToRgba(baseColor, 0.2)}`,
                                        borderRight: `1px solid ${hexToRgba(baseColor, 0.2)}`,
                                        borderBottom: `1px solid ${hexToRgba(baseColor, 0.2)}`,
                                    };
                                    
                                    return (
                                        <div
                                            key={event.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, event.id)}
                                            className={`absolute rounded-r-md px-2 py-1.5 text-xs overflow-hidden hover:z-50 hover:shadow-lg hover:scale-[1.02] transition-all cursor-move ${draggedEventId === event.id ? 'opacity-50' : ''}`}
                                            style={{
                                                ...layoutStyle,
                                                ...eventStyle,
                                                // Add a tiny gap between overlapped events
                                                width: `calc(${layoutStyle.width} - 4px)`,
                                                left: `calc(${layoutStyle.left} + 2px)`
                                            }}
                                            title={`${event.title}\n${formatTime(new Date(event.start))} - ${formatTime(new Date(event.end))}\n${event.location || 'Chưa có địa điểm'}`}
                                        >
                                            <div className="font-bold truncate text-[11px] leading-tight pointer-events-none" style={{ color: 'inherit', filter: 'brightness(0.6)' }}>{event.title}</div>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 opacity-90 pointer-events-none" style={{ color: 'inherit', filter: 'brightness(0.8)' }}>
                                                <div className="flex items-center gap-0.5">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    <span className="font-medium">{formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}</span>
                                                </div>
                                                {event.location && (
                                                    <div className="flex items-center gap-0.5 truncate max-w-full">
                                                        <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                                                        <span className="truncate">{event.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Month View Grid */}
      {mode === ViewMode.CALENDAR_MONTH && (
        <div className="flex flex-col flex-1 min-h-0 bg-white">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 flex-none z-10">
                {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'].map((day) => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
                {(() => {
                    const days = getMonthDays(currentDate);
                    const totalDays = days.length;
                    const totalRows = Math.ceil(totalDays / 7);

                    return days.map((date, idx) => {
                        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                        const isToday = isSameDay(date, new Date());
                        const dayEvents = events
                            .filter(e => isSameDay(new Date(e.start), date))
                            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
                        
                        const colIndex = idx % 7;
                        const rowIndex = Math.floor(idx / 7);
                        // Determine tooltip position
                        const isRightSide = colIndex >= 4;
                        const isBottomRow = rowIndex >= totalRows - 2;

                        return (
                            <div 
                                key={idx} 
                                className={`min-h-[120px] border-b border-r border-gray-100 p-2 transition-colors hover:bg-gray-50 flex flex-col relative ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : 'bg-white'}`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDropMonth(e, date)}
                            >
                                <div className="flex justify-center mb-2">
                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700'}`}>
                                        {date.getDate()}
                                    </span>
                                </div>
                                
                                <div className="space-y-1 flex-1">
                                    {dayEvents.slice(0, 3).map(event => {
                                        const baseColor = eventColors[event.type] || '#64748b';
                                        return (
                                            <div key={event.id} className="relative group">
                                                {/* Event Bar */}
                                                <div 
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, event.id)}
                                                    className={`px-1.5 py-1 rounded text-[10px] font-medium truncate cursor-move border-l-2 hover:opacity-80 transition-opacity ${draggedEventId === event.id ? 'opacity-50' : ''}`}
                                                    style={{
                                                        backgroundColor: hexToRgba(baseColor, 0.15),
                                                        color: baseColor,
                                                        borderLeftColor: baseColor
                                                    }}
                                                >
                                                    <span className="font-bold mr-1 pointer-events-none" style={{ filter: 'brightness(0.7)' }}>{formatTime(new Date(event.start))}</span>
                                                    <span style={{ filter: 'brightness(0.6)' }}>{event.title}</span>
                                                </div>
                                                
                                                {/* Hover Preview Tooltip */}
                                                {!draggedEventId && (
                                                    <div className={`absolute z-50 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none ${isRightSide ? 'right-0' : 'left-0'} ${isBottomRow ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                                                        <div className="font-bold text-sm mb-1 text-white">{event.title}</div>
                                                        <div className="space-y-1.5 text-slate-300">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                                <span>{formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}</span>
                                                            </div>
                                                            {event.location && (
                                                                <div className="flex items-center gap-2">
                                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                                    <span>{event.location}</span>
                                                                </div>
                                                            )}
                                                            <div className="mt-2 pt-2 border-t border-slate-700 flex items-center justify-between">
                                                                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400" style={{ color: baseColor }}>
                                                                    {event.type}
                                                                </span>
                                                                {event.description && <span className="text-[10px] italic">Có ghi chú</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    
                                    {/* More Count */}
                                    {dayEvents.length > 3 && (
                                        <div className="text-[10px] font-semibold text-gray-400 pl-1 hover:text-indigo-600 cursor-pointer transition-colors">
                                            + {dayEvents.length - 3} sự kiện khác...
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    });
                })()}
            </div>
        </div>
      )}
    </div>
  );
};
