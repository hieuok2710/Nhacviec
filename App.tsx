import React, { useState } from 'react';
import { ViewMode, CalendarEvent, Task, EventType, Priority, Document, DocumentStatus } from './types';
import { Dashboard } from './components/Dashboard';
import { Calendar } from './components/Calendar';
import { TaskList } from './components/TaskList';
import { DocumentList } from './components/DocumentList';
import { SmartAddModal } from './components/SmartAddModal';
import { LayoutDashboard, Calendar as CalIcon, CheckSquare, Plus, Bell, FileText } from 'lucide-react';

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
    // Optional: Switch to calendar to see it
    setView(ViewMode.CALENDAR_WEEK);
  };

  const NavItem = ({ mode, icon: Icon, label }: { mode: ViewMode, icon: any, label: string }) => (
    <button
      onClick={() => setView(mode)}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        view === mode 
          ? 'bg-indigo-50 text-indigo-700' 
          : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-10 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <span className="font-bold text-xl text-gray-800">LeaderFlow</span>
        </div>

        <div className="p-4 space-y-1 flex-1">
          <NavItem mode={ViewMode.DASHBOARD} icon={LayoutDashboard} label="Tổng quan" />
          <NavItem mode={ViewMode.CALENDAR_WEEK} icon={CalIcon} label="Lịch công tác" />
          <NavItem mode={ViewMode.TASKS} icon={CheckSquare} label="Nhắc việc" />
          <NavItem mode={ViewMode.DOCUMENTS} icon={FileText} label="Văn bản & Báo cáo" />
        </div>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => setShowSmartAdd(true)}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg px-4 py-3 font-medium shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Tạo mới
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-2xl font-bold text-gray-900">
              {view === ViewMode.DASHBOARD && 'Bảng điều khiển'}
              {view === ViewMode.CALENDAR_WEEK && 'Lịch làm việc'}
              {view === ViewMode.TASKS && 'Danh sách công việc'}
              {view === ViewMode.DOCUMENTS && 'Quản lý văn bản & Báo cáo'}
             </h1>
             <p className="text-gray-500 text-sm mt-1">Quản lý hiệu quả, lãnh đạo thành công</p>
          </div>
          <div className="flex items-center gap-4">
             <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors relative">
               <Bell className="w-6 h-6" />
               {(tasks.some(t => t.priority === Priority.URGENT) || documents.some(d => d.status === DocumentStatus.OVERDUE)) && (
                 <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
               )}
             </button>
             <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                  GD
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">Giám đốc</p>
                  <p className="text-xs text-gray-500">ceo@company.com</p>
                </div>
             </div>
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
            <TaskList tasks={tasks} onToggle={handleTaskToggle} />
          )}
          {view === ViewMode.DOCUMENTS && (
            <DocumentList documents={documents} onUpdateStatus={handleDocumentStatusUpdate} />
          )}
        </div>
      </main>

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