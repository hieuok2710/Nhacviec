import React from 'react';
import { Task, Priority } from '../types';
import { getPriorityColor, formatDate, getRelativeTimeLabel, isOverdue } from '../utils';
import { CheckSquare, Square, Clock } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
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

export const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle }) => {
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
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Square className="w-5 h-5" />
          Việc cần làm ({pendingTasks.length})
        </h2>
        <div className="space-y-3">
          {pendingTasks.map(task => <TaskItem key={task.id} task={task} onToggle={onToggle} />)}
          {pendingTasks.length === 0 && (
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