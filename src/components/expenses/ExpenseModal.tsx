import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {X, Calculator, Tag, Calendar, FileText, Users, Camera} from 'lucide-react';
import {useAppStore} from '../../store/appStore';
import {useAuthStore} from '../../store/authStore';
import {Expense} from '../../types';
import toast from 'react-hot-toast';
import {expenseAPI} from "../../api/expense";
import {createPortal} from "react-dom";

interface ExpenseModalProps {
  expense: Expense | null;
  onClose: () => void;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({expense, onClose}) => {
  // console.log('expense 객체: ', expense?.expenseType, expense);

    const {addExpense, updateExpense, deleteExpense, mode, currentGroup} = useAppStore();
    const {user} = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // splitData 변환
    const convertSplitDataToObject = (splitData: any) => {
      if (!splitData) return {};

      // 객체라면 그대로 반환
      if (typeof splitData === 'object' && !Array.isArray(splitData)) {
        return splitData;
      }

      // 배열 형태면 객체로 변환
      if (Array.isArray(splitData)) {
        const converted = {};
        splitData.forEach(item => {
          if (item.userId && item.amount !== undefined) {
            converted[item.userId] = item.amount;
          }
        });
        return converted;
      }

      return {};
    };


    const [formData, setFormData] = useState({
      title: expense?.title || '',
      amount: expense?.amount?.toString() || '',
      category: expense?.category || 'FOOD',
      date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      memo: expense?.memo || '',
      receipt: null as File | null,
      splitType: expense?.splitType || 'EQUAL',
      splitData: convertSplitDataToObject(expense?.splitData),
    });

    // 영수증 별도 관리
    const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

    useEffect(() => {
      if (expense?.hasReceipt && expense.id) {
        // 그룹분담금인 경우 originalExpenseId 사용, 아니면 id
        const targetId = expense.originalExpenseId || expense.id;
        expenseAPI.getReceiptUrl(targetId)
          .then(response => {
            setReceiptUrl(response.data);
          })
          .catch(error => {
            console.error('영수증 로드 실패: ', error);
          });
      }
    }, [expense]);

    const getDisplayNickname = (member: any) => {
      if (member.userId === user?.id) {
        return user?.nickname || member.nickname;
      }
      return member.nickname;
    };

    const categories = [
      {value: 'FOOD', label: '식비', color: '#FF6B6B'},
      {value: 'UTILITIES', label: '공과금', color: '#4ECDC4'},
      {value: 'TRANSPORT', label: '교통비', color: '#45B7D1'},
      {value: 'SHOPPING', label: '쇼핑', color: '#96CEB4'},
      {value: 'ENTERTAINMENT', label: '유흥', color: '#FFEAA7'},
      {value: 'OTHER', label: '기타', color: '#DDA0DD'},
    ];

    const splitTypes = [
      {value: 'EQUAL', label: '균등 분할'},
      {value: 'CUSTOM', label: '커스텀 분할'},
      {value: 'SPECIFIC', label: '특정 인원'},
    ];

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;

      const amount = Number(formData.amount.replace(/[^0-9]/g, ''));

      if (!formData.title.trim()) {
        toast.error('제목을 입력해주세요.');
        return;
      }

      if (amount <= 0 || isNaN(amount)) {
        toast.error('올바른 금액을 입력해주세요.');
        return;
      }

      // 그룹 모드에서 정산 방식별 검증
      if (mode === 'group' && currentGroup) {
        if (formData.splitType === 'CUSTOM') {
          const totalSplit = Object.values(formData.splitData).reduce((sum, val) => sum + (Number(val) || 0), 0);
          const totalAmount = Number(formData.amount);
          if (totalSplit !== totalAmount) {
            toast.error('커스텀 분할 금액의 합계가 총 금액과 일치하지 않습니다.');
            return;
          }
        } else if (formData.splitType === 'SPECIFIC') {
          if (Object.keys(formData.splitData).length === 0) {
            toast.error('정산에 참여할 인원을 선택해주세요.');
            return;
          }
        }
      }

      let splitDataArray = undefined;
      if (mode === 'group' && currentGroup) {
        // EQUAL일 때는 데이터 x
        if (formData.splitType === 'EQUAL') {
          splitDataArray = undefined;
        } else if ((formData.splitType === 'CUSTOM' || formData.splitType === 'SPECIFIC') &&
          Object.keys(formData.splitData).length > 0) {
          splitDataArray = Object.entries(formData.splitData).map(([userId, amount]) => ({
            userId,
            amount: Number(amount)
          }));
        }
      }

      if (!user) return;

      setIsSubmitting(true)

      const expenseData = {
        title: formData.title,
        amount: amount,
        category: formData.category,
        date: formData.date,
        memo: formData.memo || undefined,
        groupId: mode === 'group' && currentGroup ? currentGroup.id : null,  // 개인 모드에서는 null
        splitType: mode === 'group' ? formData.splitType : undefined,
        splitData: splitDataArray,
        receipt: formData.receipt,
      };

      try {
        if (expense) {
          updateExpense(expense.id, expenseData);

        } else {
          await addExpense(expenseData);
        }

        // 지출 추가/수정 후 목록 새로고침
        const {loadCombinedExpenses} = useAppStore.getState();
        await loadCombinedExpenses({
          mode,
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          groupId: mode === 'group' ? currentGroup?.id : null
        });

        // 그룹 분담금도 새로고침
        if (mode === 'group' && currentGroup) {
          const {loadGroupShares} = useAppStore.getState();
          await loadGroupShares({
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
          });
        }

        onClose();
        toast.success(expense ? '지출이 수정되었습니다' : '지출이 추가되었습니다');
        window.dispatchEvent(new CustomEvent('refreshMonthlyTrend'));
      } catch (error) {
        console.error('지출 처리 실패: ', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleDelete = async () => {
      if (!expense) return;

      if (expense && window.confirm('정말로 이 지출을 삭제하시겠습니까?')) {
        setIsDeleting(true);

        try {
          await deleteExpense(expense.id);
          onClose();
        } catch (error) {
          console.error('지출 삭제 실패: ', error);
        } finally {
          setIsDeleting(false)
        }
      }
    };

    const modalContent = (
      <div
        className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{opacity: 0, scale: 0.8}}
          animate={{opacity: 1, scale: 1}}
          exit={{opacity: 0, scale: 0.8}}
          transition={{duration: 0.3}}
          className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {expense ? '지출 수정' : '새 지출 추가'}
            </h2>
            <motion.button
              whileHover={{scale: 1.1}}
              whileTap={{scale: 0.9}}
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5"/>
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
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                placeholder="지출 내용을 입력하세요"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Calculator className="w-4 h-4"/>
                <span>금액 *</span>
              </label>
              <input
                type="text"
                value={formData.amount ? new Intl.NumberFormat('ko-KR').format(Number(formData.amount)) : ''}
                onChange={(e) => {
                  // 숫자만 추출 (콤마 제거)
                  const numericValue = e.target.value.replace(/[^0-9]/g, '');
                  setFormData({...formData, amount: numericValue});
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent text-2xl font-bold text-right"
                placeholder="10,000"
                inputMode="numeric"
              />
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4"/>
                <span>카테고리</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category.value}
                    type="button"
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      formData.category === category.value
                        ? 'border-accent-500 bg-accent-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{scale: 1.02}}
                    whileTap={{scale: 0.98}}
                    onClick={() => setFormData({...formData, category: category.value})}
                  >
                    <div
                      className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
                      style={{backgroundColor: category.color + '33'}}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{backgroundColor: category.color}}
                      />
                    </div>
                    <span className="text-sm font-medium">{category.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4"/>
                <span>날짜</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              />
            </div>

            {/* Memo */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4"/>
                <span>메모</span>
              </label>
              <textarea
                value={formData.memo}
                onChange={(e) => setFormData({...formData, memo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                placeholder="추가 설명을 입력하세요"
                rows={3}
              />
            </div>

            {/* Receipt */}
            {!expense?.isGroupShare && (
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Camera className="w-4 h-4"/>
                  <span>영수증</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    console.log('file: ', file);
                    if (file) {
                      // 파일 크기 제한
                      if (file.size > 1024 * 1024 * 10) {
                        toast.error('파일 크기는 10MB를 초과할 수 없습니다.');
                        e.target.value = '';
                        return;
                      }
                      setFormData({...formData, receipt: file});
                      setReceiptUrl(null);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                />
                {(formData.receipt || receiptUrl) && (
                  <div className="mt-2">
                    <img
                      src={formData.receipt ? URL.createObjectURL(formData.receipt) : receiptUrl}
                      alt="Receipt"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="flex flex-col space-y-2 mt-3">
                      {/* 임시 제거 (새로 선택한 파일이나 미리보기 제거) */}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({...formData, receipt: null});
                          setReceiptUrl(null);
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800 text-left"
                      >
                        📎 다시 선택
                      </button>

                      {/* 기존 영수증 완전 삭제 */}
                      {expense && receiptUrl && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm('영수증을 완전히 삭제하시겠습니까?')) {
                              try {
                                await expenseAPI.deleteReceipt(expense.id);
                                setReceiptUrl(null);
                                toast.success('영수증이 삭제되었습니다.');
                              } catch (error) {
                                console.error('영수증 삭제 실패:', error);
                                toast.error('영수증 삭제에 실패했습니다.');
                              }
                            }
                          }}
                          className="text-sm text-red-600 hover:text-red-800 text-left"
                        >
                          🗑️ 영수증 삭제
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* 그룹 분담의 경우 영수증 조회만 가능 */}
            {expense?.isGroupShare && receiptUrl && (
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Camera className="w-4 h-4"/>
                  <span>영수증 (조회 전용)</span>
                </label>
                <div className="mt-2">
                  <img
                    src={receiptUrl}
                    alt="Receipt"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Split Options (Group Mode Only) */}
            {mode === 'group' && currentGroup && (
              <>
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4"/>
                    <span>정산 방식</span>
                  </label>
                  <select
                    value={formData.splitType}
                    onChange={(e) => setFormData({
                      ...formData,
                      splitType: e.target.value,
                      splitData: {}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  >
                    {splitTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Split Settings */}
                {formData.splitType === 'CUSTOM' && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">커스텀 분할 설정</h4>
                    <div className="space-y-3">
                      {currentGroup.members.map((member) => (
                        <div key={member.userId} className="flex items-center justify-between">
                                                    <span
                                                      className="text-sm text-gray-600">{getDisplayNickname(member)}</span>
                          <input
                            type="text"  // number → text로 변경
                            value={formData.splitData[member.userId] ?
                              new Intl.NumberFormat('ko-KR').format(formData.splitData[member.userId]) : ''}
                            onChange={(e) => {
                              // 입력하는 동안 실시간으로 콤마 표시
                              const numericValue = e.target.value.replace(/[^0-9]/g, '');
                              const amount = numericValue === '' ? 0 : Number(numericValue);

                              const newSplitData = {
                                ...formData.splitData,
                                [member.userId]: amount
                              };

                              setFormData({
                                ...formData,
                                splitData: newSplitData
                              });
                            }}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-accent-500"
                            placeholder="0"
                            inputMode="numeric"  // 모바일에서 숫자 키패드
                          />
                        </div>
                      ))}
                      <div className="border-t pt-3 mt-3">
                        {(() => {
                          const totalSplit = Object.values(formData.splitData).reduce((sum, val) => sum + (Number(val) || 0), 0);
                          const totalAmount = Number(formData.amount);
                          const remainingAmount = Number(formData.amount) - totalSplit;

                          return (
                            <>
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">분할 합계:</span>
                                <span className={`font-medium ${
                                  totalSplit === totalAmount ? 'text-green-600' : 'text-gray-600'
                                }`}>
                  {new Intl.NumberFormat('ko-KR', {style: 'currency', currency: 'KRW'}).format(totalSplit)}
                </span>
                              </div>

                              <div className="flex items-center justify-between text-sm mt-1">
                                <span className="font-medium">남은 금액:</span>
                                <span className={`font-medium ${
                                  remainingAmount === 0 ? 'text-green-600' :
                                    remainingAmount > 0 ? 'text-blue-600' : 'text-red-600'
                                }`}>
                  {new Intl.NumberFormat('ko-KR', {style: 'currency', currency: 'KRW'}).format(remainingAmount)}
                </span>
                              </div>

                              {/* 빠른 분할 버튼들 - 균등분할 버튼 제거 */}
                              {remainingAmount > 0 && (
                                <div className="mt-3 space-y-2">
                                  <div className="text-xs text-gray-500 mb-1">빠른 분할:</div>
                                  <div className="flex space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        // 남은 금액을 현재 사용자에게 배정
                                        if (user) {
                                          setFormData({
                                            ...formData,
                                            splitData: {
                                              ...formData.splitData,
                                              [user.id]: (formData.splitData[user.id] || 0) + remainingAmount
                                            }
                                          });
                                        }
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                                    >
                                      내가 부담 (+{new Intl.NumberFormat('ko-KR', {
                                      style: 'currency',
                                      currency: 'KRW'
                                    }).format(remainingAmount)})
                                    </button>

                                    {/* 다른 사람에게 배정하는 버튼들도 추가할 수 있어요 */}
                                    {currentGroup.members.filter(m => m.userId !== user?.id).map(member => (
                                      <button
                                        key={member.userId}
                                        type="button"
                                        onClick={() => {
                                          setFormData({
                                            ...formData,
                                            splitData: {
                                              ...formData.splitData,
                                              [member.userId]: (formData.splitData[member.userId] || 0) + remainingAmount
                                            }
                                          });
                                        }}
                                        className="px-2 py-1 bg-accent-100 text-accent-600 rounded text-xs hover:bg-accent-200 transition-colors"
                                      >
                                        {getDisplayNickname(member)}가 부담
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Specific Split Settings */}
                {formData.splitType === 'SPECIFIC' && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">특정 인원 선택</h4>
                    <div className="space-y-2">
                      {currentGroup.members.map((member) => {
                        return (
                          <label key={member.userId} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={formData.splitData[member.userId] !== undefined}
                              onChange={(e) => {
                                const newSplitData = {...formData.splitData};
                                if (e.target.checked) {
                                  newSplitData[member.userId] = 0; // 임시 추가
                                } else {
                                  delete newSplitData[member.userId];
                                }

                                const selectedUserIds = Object.keys(newSplitData);
                                const memberCount = selectedUserIds.length;
                                const totalAmount = Number(formData.amount) || 0;

                                if (memberCount > 0) {
                                  const baseAmount = Math.floor(totalAmount / memberCount);
                                  const remainder = totalAmount % memberCount;

                                  // 모든 선택된 멤버에게 기본 금액 할당
                                  selectedUserIds.forEach(userId => {
                                    newSplitData[userId] = baseAmount;
                                  });

                                  // 나머지 금액을 순서대로 분배
                                  for (let i = 0; i < remainder; i++) {
                                    newSplitData[selectedUserIds[i]] += 1;
                                  }
                                }

                                setFormData({
                                  ...formData,
                                  splitData: newSplitData
                                });
                              }}
                              className="rounded border-gray-300 accent-accent-500 focus:ring-accent-500 focus:outline-none"
                            />
                            <span
                              className="text-sm text-gray-700">{getDisplayNickname(member)}</span>
                            {formData.splitData[member.userId] !== undefined && (
                              <span className="text-sm text-accent-600 ml-auto">
                                                                {new Intl.NumberFormat('ko-KR', {
                                                                  style: 'currency',
                                                                  currency: 'KRW'
                                                                }).format(
                                                                  formData.splitData[member.userId] || 0
                                                                )}
                                                            </span>
                            )}
                          </label>
                        );
                      })}

                      {Object.keys(formData.splitData).length > 0 && (
                        <div className="border-t pt-3 mt-3">
                          <div className="text-sm text-gray-600">
                            선택된 인원: {Object.keys(formData.splitData).length}명
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Equal Split Info */}
                {formData.splitType === 'EQUAL' && (
                  <div className="bg-accent-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-accent-600 mb-2">균등 분할</h4>
                    <p className="text-sm text-accent-600">
                      총 {currentGroup.members.length}명이 균등하게 분담합니다.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              {expense && expense.expenseType !== 'SHARE' && (
                <motion.button
                  type="button"
                  className={`px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium transition-colors ${
                    isDeleting
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-red-50'
                  }`}
                  whileHover={isDeleting ? {} : {scale: 1.02}}
                  whileTap={isDeleting ? {} : {scale: 0.98}}
                  onClick={handleDelete}
                  disabled={isDeleting || isSubmitting}
                >
                  {isDeleting ? (
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"/>
                      <span>삭제 중...</span>
                    </div>
                  ) : (
                    '삭제'
                  )}
                </motion.button>
              )}

              {expense?.expenseType !== 'SHARE' && (
                <motion.button
                  type="submit"
                  className={`flex-1 px-4 py-2 bg-accent-500 text-white rounded-lg font-medium transition-colors ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent-600'
                  }`}
                  whileHover={isSubmitting ? {} : {scale: 1.02}}
                  whileTap={isSubmitting ? {} : {scale: 0.98}}
                  disabled={isSubmitting || isDeleting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                      <span>{expense ? '수정 중...' : '추가 중...'}</span>
                    </div>
                  ) : (
                    expense ? '수정' : '추가'
                  )}
                </motion.button>
              )}

              <motion.button
                type="button"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                whileHover={{scale: 1.02}}
                whileTap={{scale: 0.98}}
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
              >
                취소
              </motion.button>

            </div>
          </form>
        </motion.div>
      </div>
    );

  return createPortal(modalContent, document.body);
  }
;

export default ExpenseModal;