import React, { useState, useEffect } from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Grid, List, Calendar as CalendarIcon, BarChart3, Repeat, Users, User } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addDays, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useCalendar } from '../../hooks/useCalendar';
import { useAppStore } from '../../store/appStore';
import { useLocation, useNavigate } from 'react-router-dom';
import EventModal from './EventModal';

const CalendarPage: React.FC = () => {
  const { mode, currentGroup } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showViewDropdown, setShowViewDropdown] = useState(false);

  // useCalendar 훅 사용 - 그룹 모드일 때 currentGroup.id 전달
  const {
    events,
    loading,
    error,
    currentDate,
    currentView,
    createEvent,
    updateEvent,
    deleteEvent,
    setCurrentView,
    goToPrevious,
    goToNext,
    getEventsForDate,
    clearError,
  } = useCalendar({
    autoLoad: true,
    initialView: 'month',
    groupId: mode === 'group' && currentGroup ? currentGroup.id : undefined, // 그룹 ID 전달
  });

  // URL 쿼리 파라미터에서 eventId 확인하여 상세 모달 열기
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const eventId = urlParams.get('eventId');
    
    if (eventId && events.length > 0 && !showEventModal) {
      // 해당 이벤트 찾기
      const targetEvent = events.find(event => event.id === eventId);
      if (targetEvent) {
        setSelectedEvent(targetEvent);
        setSelectedDate(new Date(targetEvent.date));
        setShowEventModal(true);
        
        // URL에서 eventId 파라미터 제거 (모달을 닫았을 때 재열리지 않도록)
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('eventId');
        navigate(newUrl.pathname + newUrl.search, { replace: true });
      }
    }
  }, [events, location.search, showEventModal, navigate]);

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

      return '날짜 오류';
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (event: any, e: React.MouseEvent, clickedDate?: Date) => {
    e.stopPropagation();
    setSelectedEvent(event);
    
    // ✅ 중요: 사용자가 실제로 클릭한 날짜를 selectedDate로 설정
    if (clickedDate) {
      setSelectedDate(clickedDate); // 14일 (클릭한 날짜)
    } else {
      setSelectedDate(new Date(event.date)); // 11일 (원본 날짜) - fallback
    }
    
    setShowEventModal(true);
  };

  // 모드에 따른 이벤트 필터링
  const getFilteredEventsForDate = (date: Date) => {
    const allEvents = getEventsForDate(date);
    
    return allEvents.filter(event => {
      if (mode === 'personal') {
        return true; // 개인 모드: 모든 일정 표시 (개인 + 그룹)
      } else {
        // 그룹 모드: 현재 선택된 그룹의 일정만 표시
        return event.groupId === currentGroup?.id;
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

  // 이벤트 삭제 핸들러 (모든 반복 일정 삭제)
  const handleDeleteEvent = async (eventId: string) => {
    return await deleteEvent(eventId);
  };

  const viewOptions = [
    { value: 'year', label: '연간', icon: BarChart3 },
    { value: 'month', label: '월간', icon: Grid },
    { value: 'week', label: '주간', icon: List },
    { value: 'day', label: '일간', icon: CalendarIcon },
  ];

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">캘린더를 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-8">
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

        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between space-y-2 xl:space-y-0 mb-2">
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center space-y-1 lg:space-y-0 lg:space-x-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                {mode === 'personal' ? '내 캘린더' : (
                    <div className="space-y-1">
                      <div className="text-base font-medium text-gray-500">
                        공유 캘린더
                      </div>
                      <div className="text-2xl lg:text-3xl font-bold text-primary-600 truncate" title={currentGroup?.name || "그룹 선택 필요"}>
                        {currentGroup?.name || "그룹 선택 필요"}
                      </div>
                    </div>
                )}
              </h1>
              <div className="flex items-center justify-center space-x-2">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToPrevious}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    disabled={loading}
                >
                  <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
                </motion.button>
                <h2 className="text-sm sm:text-lg font-medium text-gray-700 min-w-[160px] sm:min-w-[200px] text-center px-2">
                  {getViewTitle()}
                </h2>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToNext}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    disabled={loading}
                >
                  <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
                </motion.button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 justify-end">
            {/* View Selector */}
            <div className="relative">
              <motion.button
                  className="flex items-center space-x-2 sm:space-x-3 pl-4 pr-4 py-3 border border-gray-200 rounded-2xl text-sm bg-white hover:bg-gray-50 transition-colors font-medium text-gray-700 cursor-pointer shadow-md hover:shadow-lg w-full sm:w-auto whitespace-nowrap"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowViewDropdown(!showViewDropdown)}
              >
                <div className="flex items-center space-x-2">
                  {viewOptions.find(option => option.value === currentView)?.icon && (
                      React.createElement(viewOptions.find(option => option.value === currentView).icon,
                          { className: "w-4 h-4 text-gray-400" }
                      )
                  )}
                  <span className="flex-1 text-left">
        {viewOptions.find(option => option.value === currentView)?.label}
      </span>
                </div>
                <motion.svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: showViewDropdown ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </motion.button>

              {/* 드롭다운 메뉴 */}
              <AnimatePresence>
                {showViewDropdown && (
                    <>
                      <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowViewDropdown(false)}
                      />
                      <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-lg border border-gray-200 py-2 z-20"
                      >
                        {viewOptions.map((option) => (
                            <motion.button
                                key={option.value}
                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                    currentView === option.value ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'
                                }`}
                                whileHover={{ x: 4 }}
                                onClick={() => {
                                  setCurrentView(option.value as any);
                                  setShowViewDropdown(false);
                                }}
                            >
                              {/* 좌측: 아이콘 + 텍스트 */}
                              <div className="flex items-center space-x-3">
                                <option.icon className="w-4 h-4 flex-shrink-0" />
                                <span className="whitespace-nowrap">{option.label}</span>
                              </div>

                              {/* 우측: 체크 아이콘 */}
                              {currentView === option.value && (
                                  <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="flex-shrink-0"
                                  >
                                    <svg className="w-4 h-4 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </motion.div>
                              )}
                            </motion.button>
                        ))}
                      </motion.div>
                    </>
                )}
              </AnimatePresence>
            </div>

            {/* Add Event Button */}
            <motion.button
                className="flex items-center space-x-2 px-6 py-3 bg-accent-500 text-white rounded-2xl font-medium hover:bg-accent-600 transition-colors shadow-md hover:shadow-lg whitespace-nowrap"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedDate(new Date());
                  setSelectedEvent(null);
                  setShowEventModal(true);
                }}
                disabled={loading}
            >
              <Plus className="w-5 h-5" />
              <span>일정 추가</span>
            </motion.button>
          </div>
        </div>

        {/* Calendar Content */}
        {!loading && (
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
        )}

        {/* Event Modal */}
        {showEventModal && (
            <EventModal
                selectedDate={selectedDate}
                event={selectedEvent}
                mode={mode}
                currentGroup={currentGroup}
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
      <div className="p-3 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {months.map((month) => {
            const eventCount = getMonthEventCount(month);
            const isCurrentMonth = isSameMonth(month, new Date());

            return (
                <motion.div
                    key={month.toString()}
                    className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-colors ${
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
  onEventClick: (event: any, e: React.MouseEvent, clickedDate?: Date) => void;
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
      <div className="overflow-x-auto">
        {/* Week Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 min-w-[700px]">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className="p-2 sm:p-4 text-center font-medium text-gray-600 bg-gray-50 text-sm">
                {day}
              </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 min-w-[700px]">
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
                    className={`min-h-[100px] sm:min-h-[120px] p-1 sm:p-2 border-b border-r border-gray-200 cursor-pointer transition-colors ${
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
                            className={`text-[10px] sm:text-xs px-1 sm:px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-all border ${getEventStyle(event)}`}
                            whileHover={{ scale: 1.02 }}
                            onClick={(e) => onEventClick(event, e, day)} // ✅ day 파라미터 추가
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium truncate flex items-center space-x-1">
                              <span className="hidden sm:inline">{renderEventIcon(event)}</span>
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
                          +{dayEvents.length - 3}개
                        </div>
                    )}
                  </div>
                </motion.div>
            );
          })}
        </div>
      </div>
  );
};

// Week View Component
const WeekView: React.FC<{
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onEventClick: (event: any, e: React.MouseEvent, clickedDate?: Date) => void;
  getEventsForDate: (date: Date) => any[];
  getEventStyle: (event: any) => string;
  renderEventIcon: (event: any) => React.ReactNode;
  renderEventLabel: (event: any) => React.ReactNode;
}> = ({ currentDate, onDateClick, onEventClick, getEventsForDate, getEventStyle, renderEventIcon, renderEventLabel }) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
      <div className="overflow-x-auto">
        {/* Week Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 min-w-[700px]">
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
                <div key={day.toString()} className={`p-2 sm:p-4 text-center font-medium ${
                    isToday ? 'bg-primary-100 text-primary-600' : 'bg-gray-50 text-gray-600'
                }`}>
                  <div>{format(day, 'E', { locale: ko })}</div>
                  <div className={`text-sm sm:text-lg ${isToday ? 'font-bold' : ''}`}>
                    {format(day, 'd')}
                  </div>
                </div>
            );
          })}
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 min-w-[700px]">
          {weekDays.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, new Date());

            return (
                <div
                    key={day.toString()}
                    className={`min-h-[300px] sm:min-h-[400px] p-1 sm:p-2 border-r border-gray-200 cursor-pointer transition-colors ${
                        isToday ? 'bg-primary-50' : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => onDateClick(day)}
                >
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                        <motion.div
                            key={event.id}
                            className={`text-[10px] sm:text-xs px-1 sm:px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-all border ${getEventStyle(event)}`}
                            whileHover={{ scale: 1.02 }}
                            onClick={(e) => onEventClick(event, e, day)} // ✅ day 파라미터 추가
                        >
                          <div className="font-medium flex items-center space-x-1 mb-1">
                            <span className="hidden sm:inline">{renderEventIcon(event)}</span>
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
      </div>
  );
};

// Day View Component
const DayView: React.FC<{
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onEventClick: (event: any, e: React.MouseEvent, clickedDate?: Date) => void;
  getEventsForDate: (date: Date) => any[];
  getEventStyle: (event: any) => string;
  renderEventIcon: (event: any) => React.ReactNode;
  renderEventLabel: (event: any) => React.ReactNode;
}> = ({ currentDate, onDateClick, onEventClick, getEventsForDate, getEventStyle, renderEventIcon, renderEventLabel }) => {
  const dayEvents = getEventsForDate(currentDate);
  const isToday = isSameDay(currentDate, new Date());

  return (
      <div className="p-3 sm:p-6">
        <div className={`text-center mb-6 p-4 rounded-lg ${
            isToday ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
        }`}>
          <h3 className={`text-xl sm:text-2xl font-bold ${isToday ? 'text-primary-600' : 'text-gray-800'}`}>
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
                      className={`p-3 sm:p-4 rounded-lg cursor-pointer hover:shadow-md transition-all border-2 ${getEventStyle(event)}`}
                      whileHover={{ scale: 1.02 }}
                      onClick={(e) => onEventClick(event, e, currentDate)} // ✅ currentDate 파라미터 추가
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="hidden sm:inline">{renderEventIcon(event)}</span>
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
                    className="mt-4 px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
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