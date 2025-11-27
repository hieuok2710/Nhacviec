import React, { useState } from 'react';
import { Task, Document, Priority, DocumentStatus } from '../types';
import { Bell, X, AlertCircle, FileText, CheckSquare, ArrowRight } from 'lucide-react';
import { getRelativeTimeLabel } from '../utils';

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

  // Filter Urgent Items
  const urgentTasks = tasks.filter(t => !t.completed && (t.priority === Priority.URGENT || t.priority === Priority.HIGH));
  const urgentDocs = documents.filter(d => d.status === DocumentStatus.OVERDUE || d.status === DocumentStatus.PENDING);
  
  const totalCount = urgentTasks.length + urgentDocs.length;

  if (totalCount === 0) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-none">
      {/* Expanded Panel */}
      {isOpen && (
        <div className="mb-4 w-96 bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="bg-gradient-to-r from-red-600 to-rose-600 px-5 py-4 flex justify-between items-center">
            <h3 className="text-white font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-white" />
              Cần xử lý gấp ({totalCount})
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
                {urgentDocs.slice(0, 3).map(doc => (
                  <div 
                    key={doc.id} 
                    onClick={() => { onViewDocument(doc.id); setIsOpen(false); }}
                    className="mx-2 mb-2 p-3 bg-white rounded-xl border border-red-100 shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-red-300 group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                        {doc.status === DocumentStatus.OVERDUE ? 'QUÁ HẠN' : 'GẤP'}
                      </span>
                      <span className="text-[10px] text-gray-400">{doc.code}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-red-700 transition-colors">
                      {doc.title}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tasks Section */}
            {urgentTasks.length > 0 && (
              <div>
                <p className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Nhắc việc ({urgentTasks.length})</p>
                {urgentTasks.slice(0, 3).map(task => (
                  <div 
                    key={task.id}
                    onClick={() => { onViewTask(task.id); setIsOpen(false); }}
                    className="mx-2 mb-2 p-3 bg-white rounded-xl border border-orange-100 shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-orange-300 group"
                  >
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                            {task.priority}
                        </span>
                        {task.dueDate && (
                            <span className="text-[10px] text-red-500 font-medium">
                                {getRelativeTimeLabel(new Date(task.dueDate))}
                            </span>
                        )}
                    </div>
                    <p className="text-sm font-medium text-gray-800 group-hover:text-orange-700 transition-colors">
                      {task.title}
                    </p>
                  </div>
                ))}
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
          isOpen ? 'bg-gray-800 rotate-90' : 'bg-gradient-to-r from-red-600 to-rose-600 hover:scale-110'
        }`}
      >
        {/* Ping effect for attention */}
        {!isOpen && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20 animate-ping"></span>
        )}
        
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Bell className="w-6 h-6 text-white" />
        )}

        {/* Badge Count */}
        {!isOpen && totalCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-red-600 shadow-sm ring-2 ring-red-600">
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>
    </div>
  );
};