import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Hash, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { Group } from '../../types';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { addGroup, setCurrentGroup, setMode } = useAppStore();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);
  const [isCreating, setIsCreating] = useState(false);

  const generateGroupCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error('그룹명을 입력해주세요.');
      return;
    }

    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    setIsCreating(true);

    try {
      const newGroup: Group = {
        id: Date.now().toString(),
        name: groupName.trim(),
        description: description.trim(),
        code: generateGroupCode(),
        members: [user],
        createdBy: user.id,
        createdAt: new Date(),
        maxMembers,
      };

      addGroup(newGroup);
      setCurrentGroup(newGroup);
      setMode('group');
      
      toast.success(`그룹 "${groupName}"이 생성되었습니다!`);
      onClose();
      resetForm();
    } catch (error) {
      toast.error('그룹 생성 중 오류가 발생했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setGroupName('');
    setDescription('');
    setMaxMembers(4);
  };

  const handleClose = () => {
    if (!isCreating) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[100]">
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">새 그룹 만들기</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isCreating}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* 내용 */}
          <div className="p-6 space-y-6">
            {/* 그룹명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                그룹명 *
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="예: 신촌 하우스"
                maxLength={30}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="text-xs text-gray-500 mt-1">
                {groupName.length}/30
              </div>
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                그룹 설명 (선택)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="그룹에 대한 간단한 설명을 입력하세요"
                rows={3}
                maxLength={100}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="text-xs text-gray-500 mt-1">
                {description.length}/100
              </div>
            </div>

            {/* 최대 인원 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최대 인원
              </label>
              <select
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num}명</option>
                ))}
              </select>
            </div>

            {/* 안내 메시지 */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-2">
                <Hash className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">그룹 생성 후</p>
                  <p>자동으로 생성되는 참여 코드를 통해 다른 사람들을 초대할 수 있습니다.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={isCreating}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              disabled={isCreating || !groupName.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>생성 중...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>그룹 생성</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
    </AnimatePresence>
  );
};

export default CreateGroupModal;