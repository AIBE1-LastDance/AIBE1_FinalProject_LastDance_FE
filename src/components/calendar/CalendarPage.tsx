import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Grid, List, Calendar as CalendarIcon, BarChart3, Repeat, Users, User } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addDays, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useCalendar } from '../../hooks/useCalendar';
import { useAppStore } from '../../store/appStore';
import EventModal from './EventModal';

const CalendarPage: React.FC = () => {
  const { mode } = useAppStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // useCalendar 훅 사용
  const {
    events,
    loading,
    error,
    currentDate,
    currentView,
    createEvent,
    updateEvent,
    deleteEvent,
    setCurrentDate,
    setCurrentView,
    goToPrevious,
    goToNext,
    getEventsForDate,
    clearError,
  } = useCalendar({
    autoLoad: true,
    initialView: 'month',
  });

  // 뷰에 따른 제목 표시
  const getViewTitle = () => {
    try {
      switch (currentView) {
        case 'year':
          return format(currentDate, 'yyyy년', { locale: ko });
        case 'month':
          return format(currentDate, 'yyyy년 M월', { locale: ko });
        case 'week':
          const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
          const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
          return `${format(weekStart, 'M월 d일', { locale: ko })} - ${format(weekEnd, 'M월 d일', { locale: ko })}`;
        case 'day':
          return format(currentDate, 'yyyy년 M월 d일 (E)', { locale: ko });
        default:
          return format(currentDate, 'yyyy년 M월', { locale: ko });
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return '날짜 오류';
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (event: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setSelectedDate(new Date(event.date));
    setShowEventModal(true);
  };

  // 모드에 따른 이벤트 필터링
  const getFilteredEventsForDate = (date: Date) => {
    const allEvents = getEventsForDate(date);
    return allEvents.filter(event => {
      if (mode === 'personal') {
        return true; // 개인 모드: 모든 일정 표시 (개인 + 그룹)
      } else {
        return !!event.groupId; // 그룹 모드: 그룹 일정만 표시
      }
    });
  };

  // 일정 타입별 스타일 가져오기
  const getEventStyle = (event: any) => {
    const baseStyles = {
      bill: 'bg-red-100 text-red-800 border-red-200',
      cleaning: 'bg-green-100 text-green-800 border-green-200',
      meeting: 'bg-blue-100 text-blue-800 border-blue-200',
      appointment: 'bg-purple-100 text-purple-800 border-purple-200',
      health: 'bg-pink-100 text-pink-800 border-pink-200',
      shopping: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      travel: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    
    const categoryStyle = baseStyles[event.category as keyof typeof baseStyles] || 'bg-gray-100 text-gray-800 border-gray-200';
    
    // 그룹 일정인 경우 보더 추가
    if (event.groupId) {
      return `${categoryStyle} border-l-4 border-l-blue-500`;
    }
    
    return categoryStyle;
  };

  // 일정 아이콘 렌더링
  const renderEventIcon = (event: any) => {
    if (event.groupId) {
      return <Users className="w-3 h-3 text-blue-600" />;
    } else {
      return <User className="w-3 h-3 text-gray-600" />;
    }
  };

  // 일정 라벨 렌더링
  const renderEventLabel = (event: any) => {
    if (event.groupId) {
      return (
        <div className="text-[10px] text-blue-600 font-medium">
          <span>{event.groupName || '그룹'}</span>
        </div>
      );
    } else {
      // 개인 일정은 라벨 표시하지 않음
      return null;
    }
  };

  // 이벤트 저장 핸들러
  const handleSaveEvent = async (eventId: string, eventData: any) => {
    if (eventId && selectedEvent) {
      // 수정 모드
      return await updateEvent(eventId, eventData);
    } else {
      // 생성 모드
      return await createEvent(eventData);
    }
  };

  // 이벤트 삭제 핸들러
  const handleDeleteEvent = async (eventId: string, deleteType?: 'single' | 'future' | 'all') => {
    return await deleteEvent(eventId, deleteType);
  };

  const viewOptions = [
    { value: 'year', label: '연간', icon: BarChart3 },
    { value: 'month', label: '월간', icon: Grid },
    { value: 'week', label: '주간', icon: List },
    { value: 'day', label: '일간', icon: CalendarIcon },
  ];

  return (
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
              <button
                  onClick={clearError}
                  className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
        )}

        {/* Loading Indicator */}
        {loading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
              데이터를 불러오는 중...
            </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {mode === 'personal' ? '내 캘린더' : '공유 캘린더'}
            </h1>
            <div className="flex items-center space-x-2">
              <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={goToPrevious}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  disabled={loading}
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <h2 className="text-lg font-medium text-gray-700 min-w-[200px] text-center">
                {getViewTitle()}
              </h2>
              <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={goToNext}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  disabled={loading}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* View Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {viewOptions.map((option) => (
                  <motion.button
                      key={option.value}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          currentView === option.value
                              ? 'bg-white text-primary-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-800'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentView(option.value as any)}
                      disabled={loading}
                  >
                    <option.icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </motion.button>
              ))}
            </div>

            {/* Add Event Button */}
            <motion.button
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedDate(new Date());
                  setSelectedEvent(null);
                  setShowEventModal(true);
                }}
                disabled={loading}
            >
              <Plus className="w-4 h-4" />
              <span>일정 추가</span>
            </motion.button>
          </div>
        </div>

        {/* Calendar Content */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {currentView === 'year' && (
              <YearView
                  currentDate={currentDate}
                  events={events}
                  mode={mode}
                  onDateClick={handleDateClick}
                  getEventsForDate={getFilteredEventsForDate}
              />
          )}
          {currentView === 'month' && (
              <MonthView
                  currentDate={currentDate}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                  getEventsForDate={getFilteredEventsForDate}
                  getEventStyle={getEventStyle}
                  renderEventIcon={renderEventIcon}
                  renderEventLabel={renderEventLabel}
              />
          )}
          {currentView === 'week' && (
              <WeekView
                  currentDate={currentDate}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                  getEventsForDate={getFilteredEventsForDate}
                  getEventStyle={getEventStyle}
                  renderEventIcon={renderEventIcon}
                  renderEventLabel={renderEventLabel}
              />
          )}
          {currentView === 'day' && (
              <DayView
                  currentDate={currentDate}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                  getEventsForDate={getFilteredEventsForDate}
                  getEventStyle={getEventStyle}
                  renderEventIcon={renderEventIcon}
                  renderEventLabel={renderEventLabel}
              />
          )}
        </motion.div>

        {/* Event Modal */}
        {showEventModal && (
            <EventModal
                selectedDate={selectedDate}
                event={selectedEvent}
                onClose={() => {
                  setShowEventModal(false);
                  setSelectedDate(null);
                  setSelectedEvent(null);
                }}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
            />
        )}
      </div>
  );
};

// Year View Component
const YearView: React.FC<{
  currentDate: Date;
  events: any[];
  mode: string;
  onDateClick: (date: Date) => void;
  getEventsForDate: (date: Date) => any[];
}> = ({ currentDate, onDateClick, getEventsForDate }) => {
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const getMonthEventCount = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return monthDays.reduce((count, day) => {
      return count + getEventsForDate(day).length;
    }, 0);
  };

  return (
      <div className="p-6">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {months.map((month) => {
            const eventCount = getMonthEventCount(month);
            const isCurrentMonth = isSameMonth(month, new Date());

            return (
                <motion.div
                    key={month.toString()}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        isCurrentMonth ? 'bg-primary-50 border-primary-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onDateClick(month)}
                >
                  <div className={`text-sm font-medium ${isCurrentMonth ? 'text-primary-600' : 'text-gray-700'}`}>
                    {format(month, 'M월', { locale: ko })}
                  </div>
                  {eventCount > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {eventCount}개 일정
                      </div>
                  )}
                </motion.div>
            );
          })}
        </div>
      </div>
  );
};

// Month View Component
const MonthView: React.FC<{
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onEventClick: (event: any, e: React.MouseEvent) => void;
  getEventsForDate: (date: Date) => any[];
  getEventStyle: (event: any) => string;
  renderEventIcon: (event: any) => React.ReactNode;
  renderEventLabel: (event: any) => React.ReactNode;
}> = ({ currentDate, onDateClick, onEventClick, getEventsForDate, getEventStyle, renderEventIcon, renderEventLabel }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
      <>
        {/* Week Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className="p-4 text-center font-medium text-gray-600 bg-gray-50">
                {day}
              </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
                <motion.div
                    key={day.toString()}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.01 }}
                    className={`min-h-[120px] p-2 border-b border-r border-gray-200 cursor-pointer transition-colors ${
                        isCurrentMonth
                            ? 'bg-white hover:bg-gray-50'
                            : 'bg-gray-50 text-gray-400'
                    } ${isToday ? 'bg-primary-50' : ''}`}
                    onClick={() => onDateClick(day)}
                    whileHover={{ scale: 1.02 }}
                >
                  <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-primary-600' : isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                        <motion.div
                            key={event.id}
                            className={`text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-all border ${getEventStyle(event)}`}
                            whileHover={{ scale: 1.02 }}
                            onClick={(e) => onEventClick(event, e)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium truncate flex items-center space-x-1">
                              {renderEventIcon(event)}
                              {event.repeat !== 'none' && (
                                  <Repeat className="w-3 h-3 opacity-60" />
                              )}
                              <span className="truncate">{event.title}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            {renderEventLabel(event)}
                            {event.isAllDay ? (
                                <div className="text-xs opacity-75">하루 종일</div>
                            ) : (
                                <div className="text-xs opacity-75">
                                  {event.startTime}
                                </div>
                            )}
                          </div>
                        </motion.div>
                    ))}
                    {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 px-2">
                          +{dayEvents.length - 3}개 더
                        </div>
                    )}
                  </div>
                </motion.div>
            );
          })}
        </div>
      </>
  );
};

// Week View Component
const WeekView: React.FC<{
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onEventClick: (event: any, e: React.MouseEvent) => void;
  getEventsForDate: (date: Date) => any[];
  getEventStyle: (event: any) => string;
  renderEventIcon: (event: any) => React.ReactNode;
  renderEventLabel: (event: any) => React.ReactNode;
}> = ({ currentDate, onDateClick, onEventClick, getEventsForDate, getEventStyle, renderEventIcon, renderEventLabel }) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
      <>
        {/* Week Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
                <div key={day.toString()} className={`p-4 text-center font-medium ${
                    isToday ? 'bg-primary-100 text-primary-600' : 'bg-gray-50 text-gray-600'
                }`}>
                  <div>{format(day, 'E', { locale: ko })}</div>
                  <div className={`text-lg ${isToday ? 'font-bold' : ''}`}>
                    {format(day, 'd')}
                  </div>
                </div>
            );
          })}
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7">
          {weekDays.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, new Date());

            return (
                <div
                    key={day.toString()}
                    className={`min-h-[400px] p-2 border-r border-gray-200 cursor-pointer transition-colors ${
                        isToday ? 'bg-primary-50' : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => onDateClick(day)}
                >
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                        <motion.div
                            key={event.id}
                            className={`text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-all border ${getEventStyle(event)}`}
                            whileHover={{ scale: 1.02 }}
                            onClick={(e) => onEventClick(event, e)}
                        >
                          <div className="font-medium flex items-center space-x-1 mb-1">
                            {renderEventIcon(event)}
                            {event.repeat !== 'none' && (
                                <Repeat className="w-3 h-3 opacity-60" />
                            )}
                            <span className="truncate">{event.title}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            {renderEventLabel(event)}
                            {!event.isAllDay && (
                                <div className="text-xs opacity-75">
                                  {event.startTime}
                                </div>
                            )}
                          </div>
                        </motion.div>
                    ))}
                  </div>
                </div>
            );
          })}
        </div>
      </>
  );
};

// Day View Component
const DayView: React.FC<{
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onEventClick: (event: any, e: React.MouseEvent) => void;
  getEventsForDate: (date: Date) => any[];
  getEventStyle: (event: any) => string;
  renderEventIcon: (event: any) => React.ReactNode;
  renderEventLabel: (event: any) => React.ReactNode;
}> = ({ currentDate, onDateClick, onEventClick, getEventsForDate, getEventStyle, renderEventIcon, renderEventLabel }) => {
  const dayEvents = getEventsForDate(currentDate);
  const isToday = isSameDay(currentDate, new Date());

  return (
      <div className="p-6">
        <div className={`text-center mb-6 p-4 rounded-lg ${
            isToday ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
        }`}>
          <h3 className={`text-2xl font-bold ${isToday ? 'text-primary-600' : 'text-gray-800'}`}>
            {format(currentDate, 'd')}
          </h3>
          <p className="text-gray-600">
            {format(currentDate, 'yyyy년 M월 d일 E요일', { locale: ko })}
          </p>
        </div>

        <div className="space-y-4">
          {dayEvents.length > 0 ? (
              dayEvents.map((event) => (
                  <motion.div
                      key={event.id}
                      className={`p-4 rounded-lg cursor-pointer hover:shadow-md transition-all border-2 ${getEventStyle(event)}`}
                      whileHover={{ scale: 1.02 }}
                      onClick={(e) => onEventClick(event, e)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {renderEventIcon(event)}
                          <h4 className="font-semibold text-gray-800">{event.title}</h4>
                          {event.repeat !== 'none' && (
                              <Repeat className="w-4 h-4 opacity-60" />
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                          {renderEventLabel(event)}
                          <div className="text-right">
                            {event.isAllDay ? (
                                <span className="text-sm text-gray-500">하루 종일</span>
                            ) : (
                                <span className="text-sm text-gray-500">
                                  {event.startTime} - {event.endTime}
                                </span>
                            )}
                          </div>
                        </div>
                        
                        {event.description && (
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
              ))
          ) : (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">이 날에는 일정이 없습니다</p>
                <motion.button
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => onDateClick(currentDate)}
                >
                  일정 추가
                </motion.button>
              </div>
          )}
        </div>
      </div>
  );
};

export default CalendarPage;