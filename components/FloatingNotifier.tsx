import React, { useState } from 'react';
import { Task, Document, Priority, DocumentStatus } from '../types';
import { Bell, X, AlertCircle, FileText, CheckSquare, ArrowRight, AlertTriangle } from 'lucide-react';
import { getRelativeTimeLabel, isOverdue } from '../utils';

interface FloatingNotifierProps {
  tasks: Task[];
  documents: Document[];
  onViewTask: (id: string) => void;
  onViewDocument: (id: string) => void;
}

export const FloatingNotifier: React.FC<FloatingNotifierProps> = ({ 
  tasks, 
  documents, 
  onViewTask, 
  onViewDocument 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Logic: Include Urgent, High Priority, OR ANY Overdue task
  const urgentTasks = tasks
    .filter(t => !t.completed && (
        t.priority === Priority.URGENT || 
        t.priority === Priority.HIGH ||
        (t.dueDate && isOverdue(new Date(t.dueDate)))
    ))
    .sort((a, b) => {
        // Sort overdue first
        const aOver = a.dueDate && isOverdue(new Date(a.dueDate));
        const bOver = b.dueDate && isOverdue(new Date(b.dueDate));
        if (aOver && !bOver) return -1;
        if (!aOver && bOver) return 1;
        
        // Then priority
        const pScore = { [Priority.URGENT]: 3, [Priority.HIGH]: 2, [Priority.NORMAL]: 1, [Priority.LOW]: 0 };
        return pScore[b.priority] - pScore[a.priority];
    });

  // Docs: Overdue OR Pending/In Progress. Sort overdue first.
  const urgentDocs = documents
    .filter(d => d.status === DocumentStatus.OVERDUE || d.status === DocumentStatus.PENDING)
    .sort((a, b) => {
        if (a.status === DocumentStatus.OVERDUE && b.status !== DocumentStatus.OVERDUE) return -1;
        if (a.status !== DocumentStatus.OVERDUE && b.status === DocumentStatus.OVERDUE) return 1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  
  const totalCount = urgentTasks.length + urgentDocs.length;
  const hasOverdue = urgentTasks.some(t => t.dueDate && isOverdue(new Date(t.dueDate))) || 
                     urgentDocs.some(d => d.status === DocumentStatus.OVERDUE);

  if (totalCount === 0) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-none">
      {/* Expanded Panel */}
      {isOpen && (
        <div className="mb-4 w-96 bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className={`px-5 py-4 flex justify-between items-center ${hasOverdue ? 'bg-gradient-to-r from-red-600 to-rose-600' : 'bg-gradient-to-r from-indigo-600 to-violet-600'}`}>
            <h3 className="text-white font-bold flex items-center gap-2">
              {hasOverdue ? <AlertTriangle className="w-5 h-5 text-white" /> : <Bell className="w-5 h-5 text-white" />}
              {hasOverdue ? 'Cảnh báo quá hạn' : 'Thông báo nhắc việc'} ({totalCount})
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-2 bg-slate-50/50">
            {/* Documents Section */}
            {urgentDocs.length > 0 && (
              <div className="mb-2">
                <p className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Văn bản ({urgentDocs.length})</p>
                {urgentDocs.slice(0, 3).map(doc => {
                  const isDocOverdue = doc.status === DocumentStatus.OVERDUE;
                  return (
                    <div 
                        key={doc.id} 
                        onClick={() => { onViewDocument(doc.id); setIsOpen(false); }}
                        className={`mx-2 mb-2 p-3 rounded-xl border shadow-sm hover:shadow-md cursor-pointer transition-all group ${isDocOverdue ? 'bg-red-50 border-red-200 hover:border-red-300' : 'bg-white border-blue-100 hover:border-blue-300'}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isDocOverdue ? 'bg-red-100 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            {isDocOverdue ? 'QUÁ HẠN' : 'CẦN XỬ LÝ'}
                        </span>
                        <span className="text-[10px] text-gray-400">{doc.code}</span>
                        </div>
                        <p className={`text-sm font-medium line-clamp-2 leading-snug transition-colors ${isDocOverdue ? 'text-red-900 group-hover:text-red-700' : 'text-gray-800 group-hover:text-blue-700'}`}>
                        {doc.title}
                        </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tasks Section */}
            {urgentTasks.length > 0 && (
              <div>
                <p className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Nhắc việc ({urgentTasks.length})</p>
                {urgentTasks.slice(0, 3).map(task => {
                  const isTaskOverdue = task.dueDate && isOverdue(new Date(task.dueDate));
                  return (
                    <div 
                        key={task.id}
                        onClick={() => { onViewTask(task.id); setIsOpen(false); }}
                        className={`mx-2 mb-2 p-3 rounded-xl border shadow-sm hover:shadow-md cursor-pointer transition-all group ${isTaskOverdue ? 'bg-red-50 border-red-200 hover:border-red-300' : 'bg-white border-orange-100 hover:border-orange-300'}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isTaskOverdue ? 'bg-red-100 text-red-600 border-red-200' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                {isTaskOverdue ? 'QUÁ HẠN' : task.priority}
                            </span>
                            {task.dueDate && (
                                <span className={`text-[10px] font-medium ${isTaskOverdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                    {getRelativeTimeLabel(new Date(task.dueDate))}
                                </span>
                            )}
                        </div>
                        <p className={`text-sm font-medium transition-colors ${isTaskOverdue ? 'text-red-900 group-hover:text-red-700' : 'text-gray-800 group-hover:text-orange-700'}`}>
                        {task.title}
                        </p>
                    </div>
                  );
                })}
              </div>
            )}
            
            <button 
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2 text-xs text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors"
            >
                Đóng thông báo
            </button>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto relative group flex items-center justify-center w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-gray-800 rotate-90' : (hasOverdue ? 'bg-red-600 animate-pulse hover:animate-none' : 'bg-indigo-600 hover:scale-110')
        }`}
      >
        {/* Ping effect for attention */}
        {!isOpen && hasOverdue && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
        )}
        
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          hasOverdue ? <AlertTriangle className="w-6 h-6 text-white" /> : <Bell className="w-6 h-6 text-white" />
        )}

        {/* Badge Count */}
        {!isOpen && totalCount > 0 && (
          <span className={`absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow-sm ring-2 ring-white ${hasOverdue ? 'bg-white text-red-600' : 'bg-red-500 text-white'}`}>
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>
    </div>
  );
};
