import { EventType, Priority, DocumentStatus } from './types';

// Formatting helpers
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
};

export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// Hàm tính số tuần (ISO week number)
export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const isOverdue = (date: Date): boolean => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < now;
};

export const getRelativeTimeLabel = (date: Date): string => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  
  const diffTime = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Quá hạn';
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Ngày mai';
  
  return formatDate(date).split(',')[1]?.trim() || formatDate(date);
};

// Styling helpers
export const getEventTypeColor = (type: EventType): string => {
  switch (type) {
    case EventType.MEETING: return 'bg-blue-100 text-blue-700 border-blue-200';
    case EventType.BUSINESS_TRIP: return 'bg-purple-100 text-purple-700 border-purple-200';
    case EventType.DEEP_WORK: return 'bg-slate-100 text-slate-700 border-slate-200';
    case EventType.EVENT: return 'bg-amber-100 text-amber-700 border-amber-200';
    case EventType.PERSONAL: return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case Priority.URGENT: return 'bg-red-100 text-red-700 border-red-200';
    case Priority.HIGH: return 'bg-orange-100 text-orange-700 border-orange-200';
    case Priority.NORMAL: return 'bg-blue-100 text-blue-700 border-blue-200';
    case Priority.LOW: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const getDocumentStatusColor = (status: DocumentStatus): string => {
  switch (status) {
    case DocumentStatus.PENDING: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case DocumentStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700 border-blue-200';
    case DocumentStatus.COMPLETED: return 'bg-green-100 text-green-700 border-green-200';
    case DocumentStatus.OVERDUE: return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700';
  }
};