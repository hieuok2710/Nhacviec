import React, { useState } from 'react';
import { Task, Priority } from '../types';
import { getPriorityColor, formatDate, getRelativeTimeLabel, isOverdue } from '../utils';
import { CheckSquare, Square, Clock, Plus, X, Calendar, User } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onAddTask: (task: Partial<Task>) => void;
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle }) => {
  const isTaskOverdue = task.dueDate && isOverdue(new Date(task.dueDate)) && !task.completed;
  
  return (
    <div className={`group flex items-center gap-4 p-4 bg-white rounded-lg border hover:shadow-md transition-all ${task.completed ? 'border-gray-100 opacity-60' : isTaskOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}>
      <button 
        onClick={() => onToggle(task.id)}
        className={`w-6 h-6 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 text-transparent hover:border-blue-500'}`}
      >
        <CheckSquare className="w-4 h-4" />
      </button>
      
      <div className="flex-1">
        <h3 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
          {task.title}
        </h3>
        <div className="flex items-center gap-3 mt-1.5">
          <span className={`text-xs px-2 py-0.5 rounded font-medium border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-xs ${isTaskOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              <Clock className="w-3 h-3" />
              {getRelativeTimeLabel(new Date(task.dueDate))}
            </span>
          )}
          {task.assignee && (
            <span className="text-xs text-gray-500">
              Giao cho: {task.assignee}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle, onAddTask }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState<{
    title: string;
    priority: Priority;
    dueDate: string;
    assignee: string;
  }>({
    title: '',
    priority: Priority.NORMAL,
    dueDate: '',
    assignee: ''
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    onAddTask({
        title: newTask.title,
        priority: newTask.priority,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
        assignee: newTask.assignee || undefined
    });

    // Reset and close
    setNewTask({ title: '', priority: Priority.NORMAL, dueDate: '', assignee: '' });
    setIsAdding(false);
  };

  // Sort tasks: Due Date (asc) -> Priority (desc) -> Creation (implicit)
  const pendingTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => {
      // 1. Due date check
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1; // Tasks with date come first
      if (b.dueDate) return 1;

      // 2. Priority check (for tasks without date or same date)
      const pScore = { [Priority.URGENT]: 3, [Priority.HIGH]: 2, [Priority.NORMAL]: 1, [Priority.LOW]: 0 };
      return pScore[b.priority] - pScore[a.priority];
    });

  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Square className="w-5 h-5" />
                Việc cần làm ({pendingTasks.length})
            </h2>
            {!isAdding && (
                <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Thêm việc mới
                </button>
            )}
        </div>

        {/* Add Task Form */}
        {isAdding && (
            <div className="mb-6 p-4 bg-white rounded-xl border border-indigo-200 shadow-lg shadow-indigo-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <form onSubmit={handleCreate}>
                    <div className="mb-4">
                        <input 
                            type="text" 
                            placeholder="Nhập nội dung công việc..." 
                            className="w-full text-lg font-medium placeholder-gray-400 border-none outline-none focus:ring-0 p-0"
                            autoFocus
                            value={newTask.title}
                            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <select 
                            className="px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 text-gray-700"
                            value={newTask.priority}
                            onChange={(e) => setNewTask({...newTask, priority: e.target.value as Priority})}
                        >
                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>

                        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <input 
                                type="date" 
                                className="bg-transparent border-none text-sm text-gray-700 focus:outline-none p-0"
                                value={newTask.dueDate}
                                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                            />
                        </div>

                        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md">
                            <User className="w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Người thực hiện"
                                className="bg-transparent border-none text-sm text-gray-700 focus:outline-none w-28 p-0"
                                value={newTask.assignee}
                                onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                            />
                        </div>

                        <div className="ml-auto flex gap-2">
                             <button 
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-3 py-1.5 text-gray-500 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Hủy
                            </button>
                            <button 
                                type="submit"
                                disabled={!newTask.title.trim()}
                                className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        )}

        <div className="space-y-3">
          {pendingTasks.map(task => <TaskItem key={task.id} task={task} onToggle={onToggle} />)}
          {pendingTasks.length === 0 && !isAdding && (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-100 border-dashed">
                Chưa có công việc nào cần xử lý.
            </div>
          )}
        </div>
      </div>

      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-500 mb-4 flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Đã hoàn thành ({completedTasks.length})
          </h2>
          <div className="space-y-3">
            {completedTasks.map(task => <TaskItem key={task.id} task={task} onToggle={onToggle} />)}
          </div>
        </div>
      )}
    </div>
  );
};