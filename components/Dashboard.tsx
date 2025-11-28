
import React from 'react';
import { CalendarEvent, Task, Priority, Document, DocumentStatus, EventType } from '../types';
import { formatDate, formatTime, getPriorityColor, getDocumentStatusColor, getRelativeTimeLabel, isOverdue, hexToRgba } from '../utils';
import { CheckCircle2, Clock, AlertCircle, FileText, ArrowRight, Briefcase, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  events: CalendarEvent[];
  tasks: Task[];
  documents: Document[];
  onTaskToggle: (id: string) => void;
  onViewAllDocuments: () => void;
  eventColors: Record<EventType, string>;
}

export const Dashboard: React.FC<DashboardProps> = ({ events, tasks, documents, onTaskToggle, onViewAllDocuments, eventColors }) => {
  // Filter today's items
  const today = new Date();
  const todayEvents = events.filter(e => 
    new Date(e.start).toDateString() === today.toDateString()
  ).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  
  // Filter Urgent & Overdue Tasks
  const urgentTasks = tasks
    .filter(t => !t.completed && (
        t.priority === Priority.URGENT || 
        t.priority === Priority.HIGH ||
        (t.dueDate && isOverdue(new Date(t.dueDate)))
    ))
    .sort((a, b) => {
      // Sort by Overdue first
      const aOver = a.dueDate && isOverdue(new Date(a.dueDate)) ? 1 : 0;
      const bOver = b.dueDate && isOverdue(new Date(b.dueDate)) ? 1 : 0;
      if (aOver !== bOver) return bOver - aOver;

      // Then by Priority
      const pScore = { [Priority.URGENT]: 3, [Priority.HIGH]: 2, [Priority.NORMAL]: 1, [Priority.LOW]: 0 };
      const pDiff = pScore[b.priority] - pScore[a.priority];
      if (pDiff !== 0) return pDiff;

      // Then by Date
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return 0;
    });
  
  // Filter pending documents sorted by deadline (Overdue first)
  const pendingDocs = documents
    .filter(d => d.status === DocumentStatus.PENDING || d.status === DocumentStatus.IN_PROGRESS || d.status === DocumentStatus.OVERDUE)
    .sort((a, b) => {
        // Sort Overdue first
        const aOver = a.status === DocumentStatus.OVERDUE ? 1 : 0;
        const bOver = b.status === DocumentStatus.OVERDUE ? 1 : 0;
        if (aOver !== bOver) return bOver - aOver;
        
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    })
    .slice(0, 3); // Show top 3

  // Calculate total overdue items for stats
  const overdueTasksCount = tasks.filter(t => !t.completed && t.dueDate && isOverdue(new Date(t.dueDate))).length;
  const overdueDocsCount = documents.filter(d => d.status === DocumentStatus.OVERDUE).length;
  const totalOverdue = overdueTasksCount + overdueDocsCount;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Briefcase className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Xin chào, Lãnh đạo</h1>
          <p className="text-indigo-100 text-lg mb-6">{formatDate(today)}</p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">Sự kiện hôm nay</p>
              <p className="text-3xl font-bold mt-1">{todayEvents.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">Việc cần làm gấp</p>
              <p className="text-3xl font-bold mt-1">{urgentTasks.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">Văn bản chờ xử lý</p>
              <p className="text-3xl font-bold mt-1">{pendingDocs.length}</p>
            </div>
            
            {/* Dedicated Overdue Documents Card */}
            {overdueDocsCount > 0 ? (
                <div className="bg-red-600 rounded-lg p-4 border border-red-500 shadow-xl shadow-red-900/20 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
                    <p className="text-xs text-white/90 uppercase tracking-wider font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Văn bản Quá hạn
                    </p>
                    <p className="text-3xl font-extrabold text-white mt-1">{overdueDocsCount}</p>
                </div>
            ) : totalOverdue > 0 ? (
                 <div className="bg-amber-500/90 rounded-lg p-4 border border-amber-400 shadow-lg">
                    <p className="text-xs text-white/90 uppercase tracking-wider font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> Việc quá hạn
                    </p>
                    <p className="text-3xl font-bold text-white mt-1">{overdueTasksCount}</p>
                </div>
            ) : (
                <div className="bg-emerald-500/20 backdrop-blur-sm rounded-lg p-4 border border-emerald-400/30">
                    <p className="text-xs text-emerald-100 uppercase tracking-wider font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Trạng thái
                    </p>
                    <p className="text-lg font-bold text-white mt-1">Hoàn hảo</p>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Lịch trình hôm nay
            </h2>
            <span className="text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
              {todayEvents.length} sự kiện
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {todayEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Hôm nay không có lịch trình.</p>
            ) : (
              todayEvents.map((event) => {
                const baseColor = eventColors[event.type] || '#3b82f6';
                return (
                <div key={event.id} className="flex gap-4 group">
                  <div className="w-16 flex-shrink-0 flex flex-col items-center justify-start pt-1">
                    <span className="text-sm font-bold text-gray-900">{formatTime(new Date(event.start))}</span>
                    <div className="h-full w-0.5 bg-gray-100 mt-2 group-last:hidden"></div>
                  </div>
                  <div 
                    className="flex-1 p-4 rounded-lg border-l-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    style={{
                        borderLeftColor: baseColor,
                        backgroundColor: hexToRgba(baseColor, 0.05)
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span 
                            className="text-xs px-2 py-0.5 rounded border"
                            style={{
                                backgroundColor: hexToRgba(baseColor, 0.1),
                                color: baseColor,
                                borderColor: hexToRgba(baseColor, 0.2)
                            }}
                          >
                            {event.type}
                          </span>
                          {event.location && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              📍 {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {Math.round((new Date(event.end).getTime() - new Date(event.start).getTime()) / 60000)}p
                      </span>
                    </div>
                  </div>
                </div>
              )})
            )}
          </div>
        </div>

        {/* Right Column: Action Center (Documents + Tasks) */}
        <div className="space-y-6">
            
          {/* Documents Widget */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Văn bản đến hạn
              </h2>
              <button onClick={onViewAllDocuments} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center">
                Xem tất cả <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {pendingDocs.length === 0 ? (
                 <div className="text-center py-4 text-sm text-gray-500">Không có văn bản gấp.</div>
              ) : (
                pendingDocs.map(doc => {
                  const isDocOverdue = doc.status === DocumentStatus.OVERDUE;
                  return (
                    <div key={doc.id} className={`p-3 rounded-lg border transition-colors ${isDocOverdue ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-100'}`}>
                      <div className="flex justify-between items-start mb-1">
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isDocOverdue ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{doc.code}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getDocumentStatusColor(doc.status)}`}>{doc.status}</span>
                      </div>
                      <p className={`text-sm font-medium line-clamp-2 leading-snug ${isDocOverdue ? 'text-red-900' : 'text-gray-800'}`} title={doc.title}>{doc.title}</p>
                      <div className={`mt-2 text-xs flex items-center gap-1 ${isDocOverdue ? 'text-red-600 font-bold' : 'text-amber-700'}`}>
                          <Clock className="w-3 h-3" />
                          Hạn: {formatDate(new Date(doc.deadline))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Priority Tasks Widget */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Việc gấp & Quá hạn
              </h2>
            </div>

            <div className="space-y-3">
              {urgentTasks.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  <CheckCircle2 className="w-8 h-8 text-green-200 mx-auto mb-2" />
                  <p>Đã xử lý hết việc quan trọng</p>
                </div>
              ) : (
                urgentTasks.slice(0, 5).map(task => { // Limit to 5 tasks
                  const overdue = task.dueDate && isOverdue(new Date(task.dueDate));
                  return (
                    <div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${overdue ? 'bg-red-50 border-red-200' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <button 
                        onClick={() => onTaskToggle(task.id)}
                        className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center text-transparent focus:outline-none ${overdue ? 'border-red-300 hover:border-red-500' : 'border-gray-300 hover:border-blue-500'}`}
                      >
                        <div className="w-2 h-2 rounded-sm bg-blue-500 opacity-0 scale-0 transition-all" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium leading-snug truncate ${overdue ? 'text-red-800' : 'text-gray-800'}`}>{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${overdue ? 'bg-red-100 text-red-700 border-red-200' : getPriorityColor(task.priority)}`}>
                            {overdue ? 'QUÁ HẠN' : task.priority}
                          </span>
                          {task.dueDate && (
                            <span className={`text-[10px] ${overdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                              {getRelativeTimeLabel(new Date(task.dueDate))}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
