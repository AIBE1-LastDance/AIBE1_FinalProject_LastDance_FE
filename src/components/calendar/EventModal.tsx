import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Repeat, Trash2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Event } from '../../types';

interface EventModalProps {
  selectedDate: Date | null;
  event?: Event | null;
  onClose: () => void;
  onSave: (eventId: string, eventData: Partial<Event>) => Promise<Event | null>;
  onDelete: (eventId: string, deleteType?: 'single' | 'future' | 'all') => Promise<boolean>;
}

const EventModal: React.FC<EventModalProps> = ({
                                                 selectedDate,
                                                 event,
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
    category: 'general',
    repeat: 'none',
    repeatEndDate: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteType, setDeleteType] = useState<'single' | 'future' | 'all'>('single');
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);

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
        category: event.category || 'general',
        repeat: event.repeat || 'none',
        repeatEndDate: event.repeatEndDate,
      });
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate,
      }));
    }
  }, [event, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      alert('제목을 입력해주세요.');
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
      console.error('Error saving event:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    if (!confirm('정말 삭제하시겠습니까?')) return;

    setIsSubmitting(true);

    try {
      const success = await onDelete(event.id, deleteType);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'general', label: '일반', color: 'bg-gray-100 text-gray-800' },
    { value: 'bill', label: '청구서/결제', color: 'bg-red-100 text-red-800' },
    { value: 'cleaning', label: '청소', color: 'bg-green-100 text-green-800' },
    { value: 'meeting', label: '회의', color: 'bg-blue-100 text-blue-800' },
    { value: 'appointment', label: '약속', color: 'bg-purple-100 text-purple-800' },
    { value: 'health', label: '건강', color: 'bg-pink-100 text-pink-800' },
    { value: 'shopping', label: '쇼핑', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'travel', label: '여행', color: 'bg-indigo-100 text-indigo-800' },
  ];

  const repeatOptions = [
    { value: 'none', label: '반복 안함' },
    { value: 'daily', label: '매일' },
    { value: 'weekly', label: '매주' },
    { value: 'monthly', label: '매월' },
    { value: 'yearly', label: '매년' },
  ];

  return (
      <AnimatePresence>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
          <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {event ? '일정 수정' : '새 일정'}
              </h2>
              <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
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
                          onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, repeat: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        disabled={isSubmitting}
                    />
                  </div>
              )}

              {/* Delete Options (for repeating events) */}
              {event && event.repeat && event.repeat !== 'none' && showDeleteOptions && (
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <h4 className="font-medium text-red-800 mb-2">삭제 옵션</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                            type="radio"
                            value="single"
                            checked={deleteType === 'single'}
                            onChange={(e) => setDeleteType(e.target.value as any)}
                            className="mr-2"
                        />
                        <span className="text-sm text-red-700">이 일정만 삭제</span>
                      </label>
                      <label className="flex items-center">
                        <input
                            type="radio"
                            value="future"
                            checked={deleteType === 'future'}
                            onChange={(e) => setDeleteType(e.target.value as any)}
                            className="mr-2"
                        />
                        <span className="text-sm text-red-700">이 일정과 이후 모든 반복 일정 삭제</span>
                      </label>
                      <label className="flex items-center">
                        <input
                            type="radio"
                            value="all"
                            checked={deleteType === 'all'}
                            onChange={(e) => setDeleteType(e.target.value as any)}
                            className="mr-2"
                        />
                        <span className="text-sm text-red-700">모든 반복 일정 삭제</span>
                      </label>
                    </div>
                  </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                {event && (
                    <motion.button
                        type="button"
                        onClick={() => {
                          if (event.repeat && event.repeat !== 'none') {
                            setShowDeleteOptions(!showDeleteOptions);
                            if (!showDeleteOptions) return;
                          }
                          handleDelete();
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isSubmitting}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>
                    {event.repeat && event.repeat !== 'none' && !showDeleteOptions
                        ? '삭제 옵션'
                        : '삭제'
                    }
                  </span>
                    </motion.button>
                )}

                <div className="flex space-x-2 ml-auto">
                  <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                      disabled={isSubmitting}
                  >
                    취소
                  </button>
                  <motion.button
                      type="submit"
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    <span>{isSubmitting ? '저장 중...' : '저장'}</span>
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>
  );
};

export default EventModal;