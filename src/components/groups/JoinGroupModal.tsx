import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Hash, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { groupsAPI } from '../../api/groups';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { joinedGroups, setCurrentGroup, setMode } = useAppStore();
  const [groupCode, setGroupCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!groupCode.trim()) {
      toast.error('참여 코드를 입력해주세요.');
      return;
    }

    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    setIsJoining(true);

    try {
      const cleanCode = groupCode.trim().toUpperCase();
      
      // 기존에 참여한 그룹인지 확인
      const existingGroup = joinedGroups.find(group => group.code === cleanCode);
      if (existingGroup) {
        toast.error('이미 참여한 그룹입니다.');
        return;
      }

      // API를 통해 그룹 참여 신청
      await groupsAPI.applyToGroup(cleanCode);
      
      toast.success('그룹 참여 신청이 완료되었습니다. 그룹 오너의 승인을 기다려주세요.');
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('그룹 참여 오류:', error);
      
      // 에러 메시지에 따른 적절한 토스트 메시지
      if (error.message.includes('찾을 수 없음') || error.message.includes('not found')) {
        toast.error('유효하지 않은 참여 코드입니다.');
      } else if (error.message.includes('가득') || error.message.includes('full')) {
        toast.error('해당 그룹이 가득 찼습니다.');
      } else if (error.message.includes('이미') || error.message.includes('already')) {
        toast.error('이미 참여한 그룹이거나 신청한 그룹입니다.');
      } else {
        toast.error(error.message || '그룹 참여 중 오류가 발생했습니다.');
      }
    } finally {
      setIsJoining(false);
    }
  };

  const resetForm = () => {
    setGroupCode('');
  };

  const handleClose = () => {
    if (!isJoining) {
      resetForm();
      onClose();
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setGroupCode(value);
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
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">그룹 참여하기</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isJoining}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* 내용 */}
          <div className="p-6 space-y-6">
            {/* 참여 코드 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                참여 코드 *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={groupCode}
                  onChange={handleCodeChange}
                  placeholder="6자리 코드를 입력하세요"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-mono tracking-wider"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                영문 대문자와 숫자 조합 (예: ABC123)
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="space-y-3">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-start space-x-2">
                  <Users className="w-4 h-4 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-700">
                    <p className="font-medium mb-1">참여 코드란?</p>
                    <p>그룹 생성자가 제공하는 6자리 코드로, 이 코드를 통해 그룹에 참여할 수 있습니다.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="text-sm text-amber-700">
                  <p className="font-medium mb-1">주의사항</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>잘못된 코드 입력 시 참여되지 않습니다</li>
                    <li>그룹이 가득 찬 경우 참여할 수 없습니다</li>
                    <li>이미 참여한 그룹은 다시 참여할 수 없습니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={isJoining}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoin}
              disabled={isJoining || !groupCode.trim() || groupCode.length !== 6}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isJoining ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>참여 중...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>그룹 참여</span>
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

export default JoinGroupModal;