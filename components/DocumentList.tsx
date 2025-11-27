import React, { useState } from 'react';
import { Document, DocumentStatus, Priority } from '../types';
import { formatDate, getDocumentStatusColor, getPriorityColor } from '../utils';
import { FileText, AlertTriangle, CheckCircle, Clock, ArrowRight, Bell } from 'lucide-react';

interface DocumentListProps {
  documents: Document[];
  onUpdateStatus: (id: string, newStatus: DocumentStatus) => void;
}

type FilterType = 'ALL' | 'PENDING' | 'REMINDER';

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onUpdateStatus }) => {
  const [filter, setFilter] = useState<FilterType>('ALL');

  // Sort: Strictly by deadline (Nearest/Past -> Farthest/Future)
  const sortedDocs = [...documents].sort((a, b) => {
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  // Filter Logic
  const displayDocs = sortedDocs.filter(doc => {
    if (filter === 'PENDING') {
        return doc.status === DocumentStatus.PENDING || doc.status === DocumentStatus.IN_PROGRESS;
    }
    if (filter === 'REMINDER') {
        // Show urgent priority OR overdue items OR items due soon (within 3 days)
        const isUrgent = doc.priority === Priority.URGENT;
        const isOverdue = doc.status === DocumentStatus.OVERDUE;
        
        // Check if due within next 3 days
        const today = new Date();
        today.setHours(0,0,0,0);
        const deadline = new Date(doc.deadline);
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isDueSoon = diffDays >= 0 && diffDays <= 3;

        return isUrgent || isOverdue || isDueSoon;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm uppercase tracking-wide">Quá hạn</span>
          </div>
          <span className="text-3xl font-bold text-gray-800">
            {documents.filter(d => d.status === DocumentStatus.OVERDUE).length}
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-yellow-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm uppercase tracking-wide">Chờ xử lý</span>
          </div>
          <span className="text-3xl font-bold text-gray-800">
            {documents.filter(d => d.status === DocumentStatus.PENDING).length}
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm uppercase tracking-wide">Đang xử lý</span>
          </div>
          <span className="text-3xl font-bold text-gray-800">
            {documents.filter(d => d.status === DocumentStatus.IN_PROGRESS).length}
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm uppercase tracking-wide">Đã ký/duyệt</span>
          </div>
          <span className="text-3xl font-bold text-gray-800">
            {documents.filter(d => d.status === DocumentStatus.COMPLETED).length}
          </span>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Danh sách văn bản toàn đơn vị
          </h2>
          <div className="flex gap-2 bg-gray-50 p-1 rounded-lg">
              <button 
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === 'ALL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                Tất cả
              </button>
              <button 
                onClick={() => setFilter('PENDING')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === 'PENDING' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                Chờ ký
              </button>
              <button 
                onClick={() => setFilter('REMINDER')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${filter === 'REMINDER' ? 'bg-red-50 text-red-600 shadow-sm ring-1 ring-red-100' : 'text-gray-500 hover:bg-red-50 hover:text-red-500'}`}
              >
                <Bell className="w-3 h-3" />
                Cần nhắc
              </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-800 text-white text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Số ký hiệu</th>
                <th className="px-6 py-4 w-1/3">Trích yếu nội dung</th>
                <th className="px-6 py-4">Đơn vị trình</th>
                <th className="px-6 py-4">Độ khẩn</th>
                <th className="px-6 py-4">Hạn xử lý</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 rounded-tr-lg text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-indigo-900 whitespace-nowrap">
                    {doc.code}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-800 font-medium line-clamp-2 leading-relaxed" title={doc.title}>
                      {doc.title}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {doc.submitter}
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${getPriorityColor(doc.priority)}`}>
                        {doc.priority}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {formatDate(new Date(doc.deadline))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getDocumentStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {doc.status !== DocumentStatus.COMPLETED ? (
                        <button 
                            onClick={() => onUpdateStatus(doc.id, DocumentStatus.COMPLETED)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1"
                        >
                            Ký duyệt <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    ) : (
                        <span className="text-gray-400 text-sm italic">Đã hoàn thành</span>
                    )}
                  </td>
                </tr>
              ))}
              {displayDocs.length === 0 && (
                <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <FileText className="w-12 h-12 mb-3 opacity-20" />
                            <p>Không tìm thấy văn bản nào trong mục này.</p>
                        </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};