import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, User, Flag } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { Task } from '../../types';
import toast from 'react-hot-toast';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose }) => {
  const { addTask, updateTask, deleteTask, mode, currentGroup } = useAppStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    priority: task?.priority || 'medium',
    assignedTo: task?.assignedTo || '',
  });

  const priorityOptions = [
    { value: 'low', label: '낮음', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: '보통', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: '높음', color: 'bg-red-100 text-red-800' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    if (!user) return;

    const taskData: Task = {
      id: task?.id || Math.random().toString(36).substr(2, 9),
      title: formData.title,
      description: formData.description,
      completed: task?.completed || false,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      priority: formData.priority as any,
      assignedTo: formData.assignedTo || undefined,
      groupId: mode === 'group' && currentGroup ? currentGroup.id : undefined,
      userId: user.id,
      category: mode === 'group' ? 'group' : 'personal',
      createdAt: task?.createdAt || new Date(),
    };

    if (task) {
      updateTask(task.id, taskData);
      toast.success('할일이 수정되었습니다.');
    } else {
      addTask(taskData);
      toast.success('할일이 추가되었습니다.');
    }

    onClose();
  };

  const handleDelete = () => {
    if (task && window.confirm('정말로 이 할일을 삭제하시겠습니까?')) {
      deleteTask(task.id);
      toast.success('할일이 삭제되었습니다.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {task ? '할일 수정' : '새 할일 추가'}
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="할일 제목을 입력하세요"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="할일 설명을 입력하세요"
              rows={3}
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              <span>마감일</span>
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Flag className="w-4 h-4" />
              <span>우선순위</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {priorityOptions.map((priority) => (
                <motion.button
                  key={priority.value}
                  type="button"
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    formData.priority === priority.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, priority: priority.value })}
                >
                  <div className={`text-xs px-2 py-1 rounded ${priority.color}`}>
                    {priority.label}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Assigned To (Group Mode Only) */}
          {mode === 'group' && currentGroup && (
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                <span>담당자</span>
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">담당자를 선택하세요</option>
                {currentGroup.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            {task && (
              <motion.button
                type="button"
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDelete}
              >
                삭제
              </motion.button>
            )}
            <motion.button
              type="button"
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
            >
              취소
            </motion.button>
            <motion.button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {task ? '수정' : '추가'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TaskModal;