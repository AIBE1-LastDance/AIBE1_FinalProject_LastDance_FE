import React, {useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {X, Users, Hash, Check} from 'lucide-react';
import toast from 'react-hot-toast';
import {useAppStore} from '../../store/appStore';
import {useAuthStore} from '../../store/authStore';
import {groupsAPI} from '../../api/groups';
import {Group} from '../../types';

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({isOpen, onClose}) => {
    const {user} = useAuthStore();
    const {createGroup, loadMyGroups} = useAppStore();
    const [groupName, setGroupName] = useState('');
    const [description, setDescription] = useState('');
    const [maxMembers, setMaxMembers] = useState('');
    const [monthlyBudget, setMonthlyBudget] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const generateGroupCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    // 숫자 입력 처리 함수 (앞자리 0 방지)
    const handleNumberInput = (value: string, setter: (value: string) => void) => {
        // 숫자와 빈 문자열만 허용
        const numericValue = value.replace(/[^0-9]/g, '');
        
        // 앞자리 0 방지
        if (numericValue.length > 1 && numericValue.startsWith('0')) {
            setter(numericValue.substring(1));
        } else {
            setter(numericValue);
        }
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
            // API를 통해 그룹 생성
            const groupResponse = await groupsAPI.createGroup({
                groupName: groupName.trim(),
                maxMembers: parseInt(maxMembers) || 4,
                groupBudget: parseInt(monthlyBudget) || 0,
            });

            // 그룹 목록 새로고침
            await loadMyGroups();

            toast.success(`그룹 "${groupResponse.groupName}"이 생성되었습니다!`);
            onClose();
            resetForm();
        } catch (error: any) {
            console.error('그룹 생성 오류:', error);
            toast.error(error.message || '그룹 생성 중 오류가 발생했습니다.');
        } finally {
            setIsCreating(false);
        }
    };

    const resetForm = () => {
        setGroupName('');
        setDescription('');
        setMaxMembers('');
        setMonthlyBudget('');
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
                        initial={{opacity: 0, scale: 0.95}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.95}}
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                    >
                        {/* 헤더 */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <Users className="w-5 h-5 text-primary-600"/>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">새 그룹 만들기</h2>
                            </div>
                            <button
                                onClick={handleClose}
                                disabled={isCreating}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5 text-gray-500"/>
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none focus:border-transparent"
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none focus:border-transparent resize-none"
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
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={maxMembers}
                                        onChange={(e) => handleNumberInput(e.target.value, setMaxMembers)}
                                        placeholder="예: 4"
                                        className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none focus:border-transparent"
                                    />
                                    <span className="absolute right-3 top-3 text-gray-500">명</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    최소 2명 이상 입력해주세요
                                </p>
                            </div>

                            {/* 한 달 예산 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    그룹 한 달 예산 (선택)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={monthlyBudget}
                                        onChange={(e) => handleNumberInput(e.target.value, setMonthlyBudget)}
                                        placeholder="예: 500000"
                                        className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none focus:border-transparent"
                                    />
                                    <span className="absolute right-3 top-3 text-gray-500">원</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    그룹 전체의 한 달 지출 목표 금액 (나중에 변경 가능)
                                </p>
                            </div>

                            {/* 안내 메시지 */}
                            <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                                <div className="flex items-start space-x-2">
                                    <Hash className="w-4 h-4 text-primary-600 mt-0.5"/>
                                    <div className="text-sm text-primary-700">
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
                                whileHover={{scale: 1.02}}
                                whileTap={{scale: 0.98}}
                                onClick={handleCreate}
                                disabled={isCreating || !groupName.trim()}
                                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {isCreating ? (
                                    <>
                                        <div
                                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                                        <span>생성 중...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4"/>
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