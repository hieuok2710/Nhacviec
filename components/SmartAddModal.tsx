import React, { useState } from 'react';
import { CalendarEvent, EventType, Document, Priority } from '../types';
import { X, Calendar, MapPin, AlignLeft, Clock, FileText, Building2, AlertTriangle, Hash } from 'lucide-react';

interface SmartAddModalProps {
  onClose: () => void;
  onAddEvent: (event: Partial<CalendarEvent>) => void;
  onAddDocument: (doc: Partial<Document>) => void;
}

type Tab = 'EVENT' | 'DOCUMENT';

export const SmartAddModal: React.FC<SmartAddModalProps> = ({ onClose, onAddEvent, onAddDocument }) => {
  const [activeTab, setActiveTab] = useState<Tab>('EVENT');

  // Event Form State
  const [eventData, setEventData] = useState({
    title: '',
    start: '',
    end: '',
    type: EventType.MEETING,
    location: '',
    description: ''
  });

  // Document Form State
  const [docData, setDocData] = useState({
    code: '',
    title: '',
    submitter: '',
    deadline: '',
    priority: Priority.NORMAL,
  });

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDocData(prev => ({ ...prev, [name]: value }));
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventData.title || !eventData.start || !eventData.end) return;

    onAddEvent({
      title: eventData.title,
      start: new Date(eventData.start),
      end: new Date(eventData.end),
      type: eventData.type as EventType,
      location: eventData.location,
      description: eventData.description
    });
    onClose();
  };

  const handleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docData.title) return;

    onAddDocument({
        code: docData.code,
        title: docData.title,
        submitter: docData.submitter,
        deadline: docData.deadline ? new Date(docData.deadline) : undefined,
        priority: docData.priority as Priority
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {activeTab === 'EVENT' ? <Calendar className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            {activeTab === 'EVENT' ? 'Thêm sự kiện mới' : 'Thêm văn bản mới'}
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 p-2 flex gap-2 border-b border-gray-100">
            <button 
                onClick={() => setActiveTab('EVENT')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'EVENT' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:bg-gray-200'}`}
            >
                <Calendar className="w-4 h-4" /> Sự kiện
            </button>
            <button 
                onClick={() => setActiveTab('DOCUMENT')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'DOCUMENT' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:bg-gray-200'}`}
            >
                <FileText className="w-4 h-4" /> Văn bản
            </button>
        </div>

        <div className="p-6">
          {activeTab === 'EVENT' ? (
              // --- EVENT FORM ---
              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Tiêu đề sự kiện *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={eventData.title}
                    onChange={handleEventChange}
                    placeholder="Ví dụ: Họp giao ban"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Bắt đầu *</label>
                    <input
                        type="datetime-local"
                        name="start"
                        required
                        value={eventData.start}
                        onChange={handleEventChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Kết thúc *</label>
                    <input
                        type="datetime-local"
                        name="end"
                        required
                        value={eventData.end}
                        onChange={handleEventChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Loại sự kiện</label>
                    <select
                      name="type"
                      value={eventData.type}
                      onChange={handleEventChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                    >
                      {Object.values(EventType).map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Địa điểm</label>
                    <div className="relative">
                        <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            name="location"
                            value={eventData.location}
                            onChange={handleEventChange}
                            placeholder="Phòng họp A"
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Ghi chú</label>
                  <div className="relative">
                    <AlignLeft className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <textarea
                        name="description"
                        value={eventData.description}
                        onChange={handleEventChange}
                        rows={2}
                        placeholder="Chi tiết nội dung..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
                  >
                    Lưu sự kiện
                  </button>
                </div>
              </form>
          ) : (
              // --- DOCUMENT FORM ---
              <form onSubmit={handleDocSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Số ký hiệu</label>
                        <div className="relative">
                            <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                name="code"
                                value={docData.code}
                                onChange={handleDocChange}
                                placeholder="VD: 123/BC"
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                autoFocus
                            />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Độ khẩn</label>
                        <select
                            name="priority"
                            value={docData.priority}
                            onChange={handleDocChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                        >
                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Trích yếu nội dung *</label>
                    <textarea
                        name="title"
                        required
                        value={docData.title}
                        onChange={handleDocChange}
                        rows={3}
                        placeholder="Nội dung chính của văn bản..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Đơn vị trình</label>
                        <div className="relative">
                            <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                name="submitter"
                                value={docData.submitter}
                                onChange={handleDocChange}
                                placeholder="Phòng/Ban"
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Hạn xử lý</label>
                        <div className="relative">
                            <input
                                type="date"
                                name="deadline"
                                value={docData.deadline}
                                onChange={handleDocChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                            />
                        </div>
                      </div>
                  </div>

                  <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
                    >
                        Lưu văn bản
                    </button>
                  </div>
              </form>
          )}
        </div>
      </div>
    </div>
  );
};