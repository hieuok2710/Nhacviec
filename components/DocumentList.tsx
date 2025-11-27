import React from 'react';
import { Document, DocumentStatus, Priority } from '../types';
import { formatDate, getDocumentStatusColor, getPriorityColor } from '../utils';
import { FileText, AlertTriangle, CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface DocumentListProps {
  documents: Document[];
  onUpdateStatus: (id: string, newStatus: DocumentStatus) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onUpdateStatus }) => {
  // Sort: Overdue first, then by deadline
  const sortedDocs = [...documents].sort((a, b) => {
    if (a.status === DocumentStatus.OVERDUE && b.status !== DocumentStatus.OVERDUE) return -1;
    if (a.status !== DocumentStatus.OVERDUE && b.status === DocumentStatus.OVERDUE) return 1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
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
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Danh sách văn bản toàn đơn vị
          </h2>
          <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-200">Tất cả</span>
              <span className="px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600 cursor-pointer hover:border-indigo-500 hover:text-indigo-600">Chờ ký</span>
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
              {sortedDocs.map((doc) => (
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
              {sortedDocs.length === 0 && (
                <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <FileText className="w-12 h-12 mb-3 opacity-20" />
                            <p>Không có văn bản nào cần xử lý.</p>
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