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
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Quá hạn</span>
          </div>
          <span className="text-2xl font-bold text-gray-800">
            {documents.filter(d => d.status === DocumentStatus.OVERDUE).length}
          </span>
        </div>
        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Chờ xử lý</span>
          </div>
          <span className="text-2xl font-bold text-gray-800">
            {documents.filter(d => d.status === DocumentStatus.PENDING).length}
          </span>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <FileText className="w-5 h-5" />
            <span className="font-medium">Đang xử lý</span>
          </div>
          <span className="text-2xl font-bold text-gray-800">
            {documents.filter(d => d.status === DocumentStatus.IN_PROGRESS).length}
          </span>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Đã ký/duyệt</span>
          </div>
          <span className="text-2xl font-bold text-gray-800">
            {documents.filter(d => d.status === DocumentStatus.COMPLETED).length}
          </span>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Danh sách văn bản
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Số ký hiệu</th>
                <th className="px-6 py-4">Trích yếu</th>
                <th className="px-6 py-4">Đơn vị trình</th>
                <th className="px-6 py-4">Độ khẩn</th>
                <th className="px-6 py-4">Hạn xử lý</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {doc.code}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 line-clamp-2" title={doc.title}>
                      {doc.title}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {doc.submitter}
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(doc.priority)}`}>
                        {doc.priority}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(new Date(doc.deadline))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDocumentStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {doc.status !== DocumentStatus.COMPLETED && (
                        <button 
                            onClick={() => onUpdateStatus(doc.id, DocumentStatus.COMPLETED)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium hover:underline flex items-center justify-end gap-1 w-full"
                        >
                            Ký duyệt <ArrowRight className="w-3 h-3" />
                        </button>
                    )}
                  </td>
                </tr>
              ))}
              {sortedDocs.length === 0 && (
                <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Không có văn bản nào.
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