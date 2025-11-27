import React, { useState } from 'react';
import { ViewMode, CalendarEvent, Task, EventType, Priority, Document, DocumentStatus } from './types';
import { Dashboard } from './components/Dashboard';
import { Calendar } from './components/Calendar';
import { TaskList } from './components/TaskList';
import { DocumentList } from './components/DocumentList';
import { SmartAddModal } from './components/SmartAddModal';
import { FloatingNotifier } from './components/FloatingNotifier';
import { LayoutDashboard, Calendar as CalIcon, CheckSquare, Plus, Bell, FileText, ChevronRight } from 'lucide-react';

// Simple ID generator for this environment
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock Data
const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Họp giao ban đầu tuần',
    start: new Date(new Date().setHours(8, 0, 0, 0)),
    end: new Date(new Date().setHours(9, 30, 0, 0)),
    type: EventType.MEETING,
    location: 'Phòng họp A'
  },
  {
    id: '2',
    title: 'Tiếp đối tác Samsung',
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 30, 0, 0)),
    type: EventType.EVENT,
    location: 'Sảnh VIP'
  },
  {
    id: '3',
    title: 'Duyệt hồ sơ thầu',
    start: new Date(new Date().setHours(16, 0, 0, 0)),
    end: new Date(new Date().setHours(17, 30, 0, 0)),
    type: EventType.DEEP_WORK,
  }
];

const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Phê duyệt ngân sách Q4',
    priority: Priority.URGENT,
    completed: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1))
  },
  {
    id: 't2',
    title: 'Chuẩn bị bài phát biểu hội nghị',
    priority: Priority.HIGH,
    completed: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3))
  },
  {
    id: 't3',
    title: 'Ký quyết định nhân sự',
    priority: Priority.NORMAL,
    completed: true,
  }
];

const INITIAL_DOCUMENTS: Document[] = [
  {
    id: 'd1',
    code: '154/BC-KHTC',
    title: 'Báo cáo tình hình thực hiện kế hoạch vốn đầu tư công tháng 10/2023',
    submitter: 'Phòng Kế hoạch Tài chính',
    deadline: new Date(new Date().setDate(new Date().getDate())), // Today
    status: DocumentStatus.PENDING,
    priority: Priority.URGENT
  },
  {
    id: 'd2',
    code: '23/TTr-UBND',
    title: 'Tờ trình phê duyệt quy hoạch chi tiết 1/500 Khu đô thị phía Nam',
    submitter: 'Phòng Quản lý Đô thị',
    deadline: new Date(new Date().setDate(new Date().getDate() + 2)),
    status: DocumentStatus.IN_PROGRESS,
    priority: Priority.HIGH
  },
  {
    id: 'd3',
    code: '678/GM-TU',
    title: 'Giấy mời tham dự Hội nghị Ban Chấp hành Đảng bộ mở rộng',
    submitter: 'Văn phòng Thành ủy',
    deadline: new Date(new Date().setDate(new Date().getDate() - 1)), // Overdue
    status: DocumentStatus.OVERDUE,
    priority: Priority.URGENT
  },
  {
    id: 'd4',
    code: '89/KH-TNMT',
    title: 'Kế hoạch triển khai ngày môi trường thế giới',
    submitter: 'Sở Tài nguyên Môi trường',
    deadline: new Date(new Date().setDate(new Date().getDate() + 5)),
    status: DocumentStatus.PENDING,
    priority: Priority.NORMAL
  }
];

export default function App() {
  const [view, setView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCUMENTS);
  const [showSmartAdd, setShowSmartAdd] = useState(false);

  // Calculate Notification Counts
  const urgentTaskCount = tasks.filter(t => !t.completed && (t.priority === Priority.URGENT || t.priority === Priority.HIGH)).length;
  const pendingDocCount = documents.filter(d => d.status === DocumentStatus.PENDING || d.status === DocumentStatus.OVERDUE).length;
  const totalNotifications = urgentTaskCount + pendingDocCount;

  const handleTaskToggle = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDocumentStatusUpdate = (id: string, newStatus: DocumentStatus) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  const handleAddEvent = (eventData: Partial<CalendarEvent>) => {
    const newEvent: CalendarEvent = {
      id: generateId(),
      title: eventData.title || 'Sự kiện mới',
      start: eventData.start || new Date(),
      end: eventData.end || new Date(new Date().getTime() + 3600000),
      type: eventData.type || EventType.PERSONAL,
      description: eventData.description,
      location: eventData.location
    };
    setEvents(prev => [...prev, newEvent]);
    setView(ViewMode.CALENDAR_WEEK);
  };
  
  const handleAddTask = (taskData: Partial<Task>) => {
      const newTask: Task = {
          id: generateId(),
          title: taskData.title || 'Việc cần làm mới',
          priority: taskData.priority || Priority.NORMAL,
          completed: false,
          dueDate: taskData.dueDate,
          assignee: taskData.assignee
      };
      setTasks(prev => [...prev, newTask]);
  };

  const NavItem = ({ mode, icon: Icon, label, badgeCount }: { mode: ViewMode, icon: any, label: string, badgeCount?: number }) => {
    const isActive = view === mode;
    return (
      <button
        onClick={() => setView(mode)}
        className={`group relative flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out ${
          isActive 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
            : 'text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm'
        }`}
      >
        <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className="flex-1 text-left">{label}</span>
        
        {/* Menu Badge */}
        {badgeCount !== undefined && badgeCount > 0 && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${
            isActive ? 'bg-white text-indigo-600' : 'bg-red-500 text-white'
          }`}>
            {badgeCount}
          </span>
        )}
        
        {isActive && !badgeCount && <ChevronRight className="w-4 h-4 opacity-80" />}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-72 bg-[#f1f5f9] border-r border-slate-200 fixed inset-y-0 left-0 z-10 flex flex-col">
        <div className="p-8 pb-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <div>
              <span className="font-bold text-xl text-slate-800 block leading-none">LeaderFlow</span>
              <span className="text-xs text-slate-500 font-medium tracking-wide">EXECUTIVE SUITE</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <NavItem mode={ViewMode.DASHBOARD} icon={LayoutDashboard} label="Tổng quan" />
            <NavItem mode={ViewMode.CALENDAR_WEEK} icon={CalIcon} label="Lịch công tác" />
            <NavItem mode={ViewMode.TASKS} icon={CheckSquare} label="Nhắc việc" badgeCount={urgentTaskCount} />
            <NavItem mode={ViewMode.DOCUMENTS} icon={FileText} label="Văn bản & Báo cáo" badgeCount={pendingDocCount} />
          </div>
        </div>

        <div className="mt-auto p-6">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                GD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">Nguyễn Văn A</p>
                <p className="text-xs text-slate-500 truncate">Giám đốc điều hành</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowSmartAdd(true)}
            className="w-full group bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl px-4 py-3.5 font-medium shadow-md hover:shadow-xl hover:shadow-indigo-200 transition-all duration-200 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5 bg-white/20 rounded-full p-0.5" />
            <span>Tạo mới</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-end mb-8 pb-4 border-b border-slate-200/60">
          <div>
             <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              {view === ViewMode.DASHBOARD && 'Bảng điều khiển'}
              {view === ViewMode.CALENDAR_WEEK && 'Lịch công tác'}
              {view === ViewMode.TASKS && 'Danh sách nhắc việc'}
              {view === ViewMode.DOCUMENTS && 'Quản lý văn bản'}
             </h1>
             <p className="text-slate-500 mt-2 font-medium">
               Chào buổi sáng, chúc Lãnh đạo một ngày làm việc hiệu quả.
             </p>
          </div>
          <div className="flex items-center gap-4">
             <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-full transition-all relative">
               <Bell className="w-6 h-6" />
               {totalNotifications > 0 && (
                 <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
               )}
             </button>
          </div>
        </header>

        {/* Views */}
        <div className="max-w-7xl mx-auto">
          {view === ViewMode.DASHBOARD && (
            <Dashboard 
              events={events} 
              tasks={tasks} 
              documents={documents}
              onTaskToggle={handleTaskToggle}
              onViewAllDocuments={() => setView(ViewMode.DOCUMENTS)}
            />
          )}
          {(view === ViewMode.CALENDAR_WEEK || view === ViewMode.CALENDAR_MONTH) && (
            <Calendar events={events} mode={view} />
          )}
          {view === ViewMode.TASKS && (
            <TaskList tasks={tasks} onToggle={handleTaskToggle} onAddTask={handleAddTask} />
          )}
          {view === ViewMode.DOCUMENTS && (
            <DocumentList documents={documents} onUpdateStatus={handleDocumentStatusUpdate} />
          )}
        </div>
      </main>

      {/* Floating Notifier */}
      <FloatingNotifier 
        tasks={tasks} 
        documents={documents} 
        onViewTask={(id) => setView(ViewMode.TASKS)}
        onViewDocument={(id) => setView(ViewMode.DOCUMENTS)}
      />

      {/* Smart Add Modal */}
      {showSmartAdd && (
        <SmartAddModal 
          onClose={() => setShowSmartAdd(false)}
          onAddEvent={handleAddEvent}
        />
      )}
    </div>
  );
}