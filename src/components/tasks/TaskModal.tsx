import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, User, Flag } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { ChecklistResponseDTO, ChecklistRequestDTO } from '../../types/checklist';
import { ChecklistService } from '../../api/checklist';
import toast from 'react-hot-toast';
import {createPortal} from "react-dom";

interface TaskModalProps {
  task: ChecklistResponseDTO | null;
  onClose: () => void;
  onSave?: () => void; // 저장 후 콜백
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSave }) => {
  const { mode, currentGroup } = useAppStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    priority: task?.priority?.toLowerCase() || 'medium',
    assigneeId: task?.assignee?.userId || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const priorityOptions = [
    { value: 'low', label: '낮음', bgColor: '#10B981' + '33', iconColor: '#10B981' },
    { value: 'medium', label: '보통', bgColor: '#F59E0B' + '33', iconColor: '#F59E0B' },
    { value: 'high', label: '높음', bgColor: '#EF4444' + '33', iconColor: '#EF4444' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    // 그룹 모드인데 그룹이 없는 경우
    if (mode === 'group' && !currentGroup) {
      toast.error('그룹을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // API 요청 데이터 준비
      const requestData: ChecklistRequestDTO = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority.toUpperCase() as "HIGH" | "MEDIUM" | "LOW",
        dueDate: formData.dueDate ? new Date(formData.dueDate + 'T23:59:59.000Z').toISOString() : undefined,
        // 개인모드일 때는 현재 로그인된 사용자를 담당자로 자동 설정, 그룹모드일 때만 선택된 담당자 사용
        assigneeId: mode === 'personal' ? user.id : (formData.assigneeId || undefined),
      };

      if (task) {
        // 수정
        if (mode === 'personal') {
          await ChecklistService.updatePersonalChecklist(task.checklistId, requestData);
        } else if (mode === 'group' && currentGroup) {
          await ChecklistService.updateGroupChecklist(currentGroup.id, task.checklistId, requestData);
        }
        toast.success('할일이 수정되었습니다.');
      } else {
        // 생성
        if (mode === 'personal') {
          await ChecklistService.createPersonalChecklist(requestData);
        } else if (mode === 'group' && currentGroup) {
          await ChecklistService.createGroupChecklist(currentGroup.id, requestData);
        }
        toast.success('할일이 추가되었습니다.');
      }

      // 성공 후 처리
      onSave?.(); // 부모 컴포넌트에서 목록 새로고침
      onClose();

    } catch (error: any) {
      console.error('체크리스트 저장 오류:', error);
      toast.error(error.message || '할일 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    if (!window.confirm('정말로 이 할일을 삭제하시겠습니까?')) {
      return;
    }

    setIsSubmitting(true);

    try {
      await ChecklistService.deleteChecklist(task.checklistId);
      toast.success('할일이 삭제되었습니다.');
      onSave?.(); // 부모 컴포넌트에서 목록 새로고침
      onClose();
    } catch (error: any) {
      console.error('체크리스트 삭제 오류:', error);
      toast.error(error.message || '할일 삭제에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
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
            disabled={isSubmitting}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent focus:outline-none"
              placeholder="할일 제목을 입력하세요"
              disabled={isSubmitting}
              maxLength={100}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent focus:outline-none"
              placeholder="할일 설명을 입력하세요"
              rows={3}
              disabled={isSubmitting}
              maxLength={500}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent focus:outline-none"
              disabled={isSubmitting}
              min={new Date().toISOString().split('T')[0]} // 오늘 이후만 선택 가능
            />
          </div>

          {/* Priority */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Flag className="w-4 h-4" />
              <span>우선순위 *</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {priorityOptions.map((priority) => (
                <motion.button
                  key={priority.value}
                  type="button"
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    formData.priority === priority.value
                      ? 'border-accent-500 bg-accent-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, priority: priority.value })}
                  disabled={isSubmitting}
                >
                  <div
                    className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: priority.bgColor }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: priority.iconColor }}
                    />
                  </div>
                  <span className="text-sm font-medium">{priority.label}</span>
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
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent focus:outline-none"
                disabled={isSubmitting}
              >
                <option value="">담당자를 선택하세요</option>
                {currentGroup.members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.nickname}
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
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? '삭제 중...' : '삭제'}
              </motion.button>
            )}

            <motion.button
              type="submit"
              className="flex-1 px-4 py-2 bg-accent-500 text-white rounded-lg font-medium hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (task ? '수정 중...' : '추가 중...') : (task ? '수정' : '추가')}
            </motion.button>
            <motion.button
              type="button"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
  return createPortal(modalContent, document.body);
};

export default TaskModal;
