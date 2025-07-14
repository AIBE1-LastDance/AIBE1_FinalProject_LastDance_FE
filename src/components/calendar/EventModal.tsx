import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Repeat, Trash2, Save } from 'lucide-react';
import { format } from 'date-fns';
import {Event, Group} from '../../types';
import toast from 'react-hot-toast';
import {createPortal} from "react-dom";

interface EventModalProps {
  selectedDate: Date | null;
  event?: Event | null;
  mode?: 'personal' | 'group';
  currentGroup?: Group | null;
  onClose: () => void;
  onSave: (eventId: string, eventData: Partial<Event>) => Promise<Event | null>;
  onDelete: (eventId: string) => Promise<boolean>;
}

const EventModal: React.FC<EventModalProps> = ({
                                                 selectedDate,
                                                 event,
                                                 mode,
                                                 currentGroup,
                                                 onClose,
                                                 onSave,
                                                 onDelete
                                               }) => {
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: selectedDate || new Date(),
    endDate: undefined,
    startTime: '09:00',
    endTime: '10:00',
    isAllDay: false,
    category: 'general' as const,
    repeat: 'none',
    repeatEndDate: undefined,
    groupId: mode === 'group' && currentGroup ? currentGroup.id : undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이벤트 편집 모드일 때 폼 데이터 설정
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        date: event.date,
        endDate: event.endDate,
        startTime: event.startTime || '09:00',
        endTime: event.endTime || '10:00',
        isAllDay: event.isAllDay || false,
        category: event.category || 'general' as const,
        repeat: event.repeat || 'none' as const,
        repeatEndDate: event.repeatEndDate,
      });
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate,
      }));
    }
  }, [event, selectedDate]);

  // 모드나 그룹이 변경될 때 groupId 업데이트
  useEffect(() => {
    if (!event) { // 새 일정 생성 모드일 때만
      setFormData(prev => ({
        ...prev,
        groupId: mode === 'group' && currentGroup ? currentGroup.id : undefined,
      }));
    }
  }, [mode, currentGroup, event]);

  // 새 일정 생성 시 기본값 검증 및 설정
  useEffect(() => {
    if (!event && !formData.isAllDay) {
      // 시작시간이 종료시간보다 늦은 경우 자동 조정
      if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
        const [hours, minutes] = formData.startTime.split(':').map(Number);
        const endHours = hours + 1;
        const endTime = endHours < 24 ?
            `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}` :
            '23:59';

        setFormData(prev => ({
          ...prev,
          endTime: endTime
        }));
      }
    }
  }, [event, formData.startTime, formData.endTime, formData.isAllDay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    // 하루 종일이 아닌 경우 시간 검증
    if (!formData.isAllDay && formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        toast.error('시작 시간은 종료 시간보다 이전이어야 합니다.');
        return;
      }
    }

    // 종료 날짜가 시작 날짜보다 이전인지 검증
    if (formData.endDate && formData.date && formData.endDate < formData.date) {
      toast.error('종료 날짜는 시작 날짜보다 이후여야 합니다.');
      return;
    }

    // 반복 종료 날짜가 시작 날짜보다 이전인지 검증
    if (formData.repeatEndDate && formData.date && formData.repeatEndDate < formData.date) {
      toast.error('반복 종료 날짜는 시작 날짜보다 이후여야 합니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      if (event) {
        // 수정 모드
        result = await onSave(event.id, formData);
      } else {
        // 생성 모드
        result = await onSave('', formData);
      }

      if (result) {
        onClose();
      }
    } catch (error) {
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    // 반복 일정인 경우 모든 반복 일정이 삭제된다는 것을 명확히 안내
    const confirmMessage = event.repeat && event.repeat !== 'none' 
      ? '모든 반복 일정이 삭제됩니다. 정말 삭제하시겠습니까?' 
      : '정말 삭제하시겠습니까?';

    if (!window.confirm(confirmMessage)) return;

    setIsSubmitting(true);

    try {
      const success = await onDelete(event.id);
      if (success) {
        onClose();
      }
    } catch (error) {
      toast.error('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'general', label: '일반', color: 'bg-gray-100 text-gray-800' },
    { value: 'bill', label: '청구서/결제', color: 'bg-status-error text-gray-800' },
    { value: 'cleaning', label: '청소', color: 'bg-status-success text-gray-800' },
    { value: 'meeting', label: '회의', color: 'bg-accent-100 text-accent-800' },
    { value: 'appointment', label: '약속', color: 'bg-primary-100 text-primary-800' },
    { value: 'health', label: '건강', color: 'bg-category-mint text-gray-800' },
    { value: 'shopping', label: '쇼핑', color: 'bg-category-orange text-gray-800' },
    { value: 'travel', label: '여행', color: 'bg-category-lavender text-gray-800' },
  ];

  const repeatOptions = [
    { value: 'none', label: '반복 안함' },
    { value: 'daily', label: '매일' },
    { value: 'weekly', label: '매주' },
    { value: 'monthly', label: '매월' },
    { value: 'yearly', label: '매년' },
  ];

  const modalContent = (
      <AnimatePresence>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4"
            onClick={onClose}
        >
          <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {event ? '일정 수정' : '새 일정'}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="일정 제목을 입력하세요"
                    disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none"
                    placeholder="일정에 대한 상세 설명을 입력하세요"
                    rows={3}
                    disabled={isSubmitting}
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  날짜
                </label>
                <input
                    type="date"
                    value={formData.date ? format(formData.date, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      date: new Date(e.target.value)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-accent-500 focus:border-transparent"
                    disabled={isSubmitting}
                />
              </div>

              {/* End Date (for multi-day events) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  종료 날짜 (선택사항)
                </label>
                <input
                    type="date"
                    value={formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      endDate: e.target.value ? new Date(e.target.value) : undefined
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    disabled={isSubmitting}
                />
              </div>

              {/* All Day Toggle */}
              <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="allDay"
                    checked={formData.isAllDay}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAllDay: e.target.checked }))}
                    className="rounded border-gray-300 text-accent-600 focus:ring-accent-500 focus:outline-none"
                    disabled={isSubmitting}
                />
                <label htmlFor="allDay" className="text-sm font-medium text-gray-700">
                  하루 종일
                </label>
              </div>

              {/* Time Range (if not all day) */}
              {!formData.isAllDay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        시작 시간
                      </label>
                      <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => {
                            const startTime = e.target.value;
                            // 시작 시간에서 1시간 후로 종료 시간 자동 설정
                            const [hours, minutes] = startTime.split(':').map(Number);
                            const endHours = hours + 1;
                            let endTime;
                            if (endHours < 24) {
                              endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                            } else {
                              // 23시 이후인 경우, 종료시간을 23:59로 설정하고 사용자에게 알림
                              endTime = '23:59';
                              // 잠시 후 toast 표시 (상태 업데이트 후)
                              setTimeout(() => {
                                toast.success('시작 시간이 23시 이후여서 종료 시간을 23:59로 설정했습니다.');
                              }, 100);
                            }

                            setFormData(prev => ({
                              ...prev,
                              startTime: startTime,
                              endTime: endTime
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-accent-500 focus:border-transparent"
                          disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        종료 시간
                      </label>
                      <input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-accent-500 focus:border-transparent"
                          disabled={isSubmitting}
                      />
                    </div>
                  </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리
                </label>
                <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Event['category'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={isSubmitting}
                >
                  {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                  ))}
                </select>
              </div>

              {/* Repeat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Repeat className="w-4 h-4 inline mr-1" />
                  반복
                </label>
                <select
                    value={formData.repeat}
                    onChange={(e) => setFormData(prev => ({ ...prev, repeat: e.target.value as Event['repeat'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-accent-500 focus:border-transparent"
                    disabled={isSubmitting}
                >
                  {repeatOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                  ))}
                </select>
              </div>

              {/* Repeat End Date (if repeating) */}
              {formData.repeat && formData.repeat !== 'none' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      반복 종료 날짜 (선택사항)
                    </label>
                    <input
                        type="date"
                        value={formData.repeatEndDate ? format(formData.repeatEndDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          repeatEndDate: e.target.value ? new Date(e.target.value) : undefined
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-accent-500 focus:border-transparent"
                        disabled={isSubmitting}
                    />
                  </div>
              )}

              {/* Delete Options - 제거됨 (모든 반복 일정 삭제만 지원) */}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                {event && (
                    <motion.button
                        type="button"
                        className={`px-4 py-2 border border-status-error text-status-error rounded-lg font-medium transition-colors ${
                            isSubmitting
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-red-50'
                        }`}
                        whileHover={isSubmitting ? {} : { scale: 1.02 }}
                        whileTap={isSubmitting ? {} : { scale: 0.98 }}
                        onClick={handleDelete}
                        disabled={isSubmitting}
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
                    disabled={isSubmitting}
                >
                  취소
                </motion.button>
                <motion.button
                    type="submit"
                    className={`px-4 py-2 bg-accent-500 text-white rounded-lg font-medium transition-colors ${
                        isSubmitting
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-accent-600'
                    }`}
                    whileHover={isSubmitting ? {} : { scale: 1.02 }}
                    whileTap={isSubmitting ? {} : { scale: 0.98 }}
                    disabled={isSubmitting}
                >
                  {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                        <span>저장 중...</span>
                      </div>
                  ) : (
                      '저장'
                  )}
                </motion.button>
                </div>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>
  )
  return createPortal(modalContent, document.body)
};

export default EventModal;