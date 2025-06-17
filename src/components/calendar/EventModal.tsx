import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, Repeat, Tag, Users, User, Trash2, CalendarDays, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { Event } from '../../types';
import toast from 'react-hot-toast';

interface EventModalProps {
  selectedDate: Date | null;
  onClose: () => void;
  event?: Event;
}

const EventModal: React.FC<EventModalProps> = ({ selectedDate, onClose, event }) => {
  const { addEvent, updateEvent, deleteEvent, deleteEventSeries, deleteFutureEvents, mode, currentGroup, joinedGroups } = useAppStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || selectedDate || new Date(),
    endDate: event?.endDate || event?.date || selectedDate || new Date(),
    startTime: event?.startTime || '09:00',
    endTime: event?.endTime || '10:00',
    isAllDay: event?.isAllDay || false,
    category: event?.category || 'other',
    repeat: event?.repeat || 'none',
    repeatEndDate: event?.repeatEndDate || null,
    isGroupEvent: event?.groupId ? true : (mode === 'group' ? true : false),
    groupId: event?.groupId || (mode === 'group' && currentGroup ? currentGroup.id : ''),
  });

  console.log('EventModal initialized with:', {
    selectedDate,
    event,
    formData,
    user,
    mode,
    currentGroup
  });

  const [isEditMode, setIsEditMode] = useState(!event);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const categories = [
    { value: 'bill', label: '납부', color: 'bg-red-100 text-red-800', icon: '💳' },
    { value: 'cleaning', label: '청소', color: 'bg-green-100 text-green-800', icon: '🧹' },
    { value: 'meeting', label: '회의', color: 'bg-blue-100 text-blue-800', icon: '👥' },
    { value: 'appointment', label: '약속', color: 'bg-purple-100 text-purple-800', icon: '🤝' },
    { value: 'health', label: '건강', color: 'bg-pink-100 text-pink-800', icon: '💊' },
    { value: 'shopping', label: '쇼핑', color: 'bg-yellow-100 text-yellow-800', icon: '🛒' },
    { value: 'travel', label: '여행', color: 'bg-indigo-100 text-indigo-800', icon: '✈️' },
    { value: 'other', label: '기타', color: 'bg-gray-100 text-gray-800', icon: '📌' },
  ];

  const repeatOptions = [
    { value: 'none', label: '반복 없음' },
    { value: 'daily', label: '매일' },
    { value: 'weekly', label: '매주' },
    { value: 'monthly', label: '매월' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Form submitted with data:', formData);
    console.log('User:', user);
    console.log('Event (editing):', event);

    if (!formData.title.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    if (!formData.isAllDay && formData.startTime >= formData.endTime) {
      toast.error('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.date)) {
      toast.error('종료 날짜는 시작 날짜보다 늦어야 합니다.');
      return;
    }

    if (!user) {
      console.error('User not found!');
      toast.error('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    // 그룹 일정인 경우 그룹 선택 확인
    if (formData.isGroupEvent && !formData.groupId) {
      toast.error('그룹을 선택해주세요.');
      return;
    }

    const eventData: Event = {
      id: event?.id || Math.random().toString(36).substr(2, 9),
      title: formData.title,
      description: formData.description,
      date: new Date(formData.date),
      endDate: new Date(formData.endDate),
      startTime: formData.isAllDay ? undefined : formData.startTime,
      endTime: formData.isAllDay ? undefined : formData.endTime,
      isAllDay: formData.isAllDay,
      category: formData.category as Event['category'],
      color: categories.find(c => c.value === formData.category)?.color || '',
      groupId: formData.isGroupEvent ? formData.groupId : undefined,
      userId: user.id,
      repeat: formData.repeat as Event['repeat'],
      repeatEndDate: formData.repeat !== 'none' ? (formData.repeatEndDate ? new Date(formData.repeatEndDate) : undefined) : undefined,
    };

    console.log('Creating event with data:', eventData);

    try {
      if (event) {
        updateEvent(event.id, eventData);
        toast.success('일정이 수정되었습니다.');
      } else {
        addEvent(eventData);
        toast.success('일정이 추가되었습니다.');
      }

      console.log('Event operation completed successfully');
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('일정 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = () => {
    if (!event) return;

    // 반복 일정인지 확인
    const isRepeatedEvent = event.repeat !== 'none' || event.originalEventId || event.isRepeated;

    if (isRepeatedEvent) {
      setShowDeleteModal(true);
    } else {
      if (window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
        deleteEvent(event.id);
        toast.success('일정이 삭제되었습니다.');
        onClose();
      }
    }
  };

  const handleDeleteChoice = (choice: 'single' | 'future' | 'all') => {
    if (!event) return;

    switch (choice) {
      case 'single':
        deleteEvent(event.id);
        toast.success('선택한 일정만 삭제되었습니다.');
        break;
      case 'future':
        deleteFutureEvents(event.id);
        toast.success('이후 반복 일정이 모두 삭제되었습니다.');
        break;
      case 'all':
        deleteEventSeries(event.id);
        toast.success('모든 반복 일정이 삭제되었습니다.');
        break;
    }

    setShowDeleteModal(false);
    onClose();
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
            {event && !isEditMode ? '일정 상세' : event ? '일정 수정' : '새 일정 추가'}
          </h2>
          <div className="flex items-center space-x-2">
            {event && !isEditMode && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsEditMode(true)}
                  className="p-2 rounded-full hover:bg-gray-100 text-blue-600"
                >
                  <Calendar className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  className="p-2 rounded-full hover:bg-gray-100 text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {event && !isEditMode ? (
          /* View Mode */
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{event.title}</h3>
              {event.description && (
                <p className="text-gray-600 text-sm">{event.description}</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {format(new Date(event.date), 'yyyy년 M월 d일', { locale: ko })}
                  {event.endDate && new Date(event.endDate).getTime() !== new Date(event.date).getTime() && (
                    <> - {format(new Date(event.endDate), 'yyyy년 M월 d일', { locale: ko })}</>
                  )}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {event.isAllDay ? '하루 종일' : `${event.startTime} - ${event.endTime}`}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Tag className="w-4 h-4 text-gray-500" />
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${event.color} flex items-center space-x-1`}>
                    <span>{categories.find(c => c.value === event.category)?.icon}</span>
                    <span>{categories.find(c => c.value === event.category)?.label}</span>
                  </span>
                  {event.groupId ? (
                    <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800 flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>그룹</span>
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>개인</span>
                    </span>
                  )}
                </div>
              </div>

              {event.groupId && (
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {joinedGroups.find(g => g.id === event.groupId)?.name || '그룹'}
                  </span>
                </div>
              )}

              {event.repeat !== 'none' && (
                <div className="flex items-center space-x-3">
                  <Repeat className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {repeatOptions.find(r => r.value === event.repeat)?.label}
                    {event.repeatEndDate && (
                      <> ({format(new Date(event.repeatEndDate), 'yyyy년 M월 d일', { locale: ko })}까지)</>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Edit/Create Mode */
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
                placeholder="일정 제목을 입력하세요"
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
                placeholder="일정 설명을 입력하세요"
                rows={3}
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                <span>날짜</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">시작일</label>
                  <input
                    type="date"
                    value={format(new Date(formData.date), 'yyyy-MM-dd')}
                    onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">종료일</label>
                  <input
                    type="date"
                    value={format(new Date(formData.endDate), 'yyyy-MM-dd')}
                    onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* All Day Toggle */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Clock className="w-4 h-4" />
                <span>하루 종일</span>
              </label>
              <motion.button
                type="button"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isAllDay ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                onClick={() => setFormData({ ...formData, isAllDay: !formData.isAllDay })}
                whileTap={{ scale: 0.95 }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isAllDay ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </motion.button>
            </div>

            {/* Time */}
            {!formData.isAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시작 시간
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종료 시간
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Personal/Group Toggle */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4" />
                <span>일정 유형</span>
              </label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <motion.button
                  type="button"
                  className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    !formData.isGroupEvent
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, isGroupEvent: false })}
                >
                  <User className="w-4 h-4" />
                  <span>개인 일정</span>
                </motion.button>
                <motion.button
                  type="button"
                  className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    formData.isGroupEvent
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, isGroupEvent: true })}
                >
                  <Users className="w-4 h-4" />
                  <span>그룹 일정</span>
                </motion.button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4" />
                <span>카테고리</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category.value}
                    type="button"
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      formData.category === category.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, category: category.value })}
                  >
                    <div className={`text-xs px-2 py-1 rounded ${category.color} mb-1 flex items-center justify-center space-x-1`}>
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Group Selection */}
            {formData.isGroupEvent && (
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4" />
                  <span>그룹 선택</span>
                </label>
                <select
                  value={formData.groupId}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">그룹을 선택하세요</option>
                  {joinedGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Repeat */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Repeat className="w-4 h-4" />
                <span>반복</span>
              </label>
              <select
                value={formData.repeat}
                onChange={(e) => setFormData({ ...formData, repeat: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {repeatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Repeat End Date */}
            {formData.repeat !== 'none' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  반복 종료일
                </label>
                <input
                  type="date"
                  value={formData.repeatEndDate ? format(new Date(formData.repeatEndDate), 'yyyy-MM-dd') : ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    repeatEndDate: e.target.value ? new Date(e.target.value) : null 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="반복 종료일을 선택하세요"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4">
              <motion.button
                type="button"
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (event && isEditMode) {
                    setIsEditMode(false);
                  } else {
                    onClose();
                  }
                }}
              >
                취소
              </motion.button>
              <motion.button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {event ? '수정' : '추가'}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">반복 일정 삭제</h3>
            </div>

            <p className="text-gray-600 mb-6 text-sm">
              이 일정은 반복 일정입니다. 어떻게 삭제하시겠습니까?
            </p>

            <div className="space-y-3">
              <motion.button
                className="w-full p-3 text-left rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDeleteChoice('single')}
              >
                <div className="font-medium text-gray-800">이 일정만 삭제</div>
                <div className="text-xs text-gray-500">선택한 날짜의 일정만 삭제됩니다</div>
              </motion.button>

              <motion.button
                className="w-full p-3 text-left rounded-lg hover:bg-orange-50 border border-orange-200 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDeleteChoice('future')}
              >
                <div className="font-medium text-orange-800">이후 일정 모두 삭제</div>
                <div className="text-xs text-orange-600">
                  {format(new Date(event?.date || new Date()), 'M월 d일', { locale: ko })} 이후의 모든 반복 일정이 삭제됩니다
                </div>
              </motion.button>

              <motion.button
                className="w-full p-3 text-left rounded-lg hover:bg-red-50 border border-red-200 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDeleteChoice('all')}
              >
                <div className="font-medium text-red-800">모든 반복 일정 삭제</div>
                <div className="text-xs text-red-600">관련된 모든 반복 일정이 삭제됩니다</div>
              </motion.button>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <motion.button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteModal(false)}
              >
                취소
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EventModal;
