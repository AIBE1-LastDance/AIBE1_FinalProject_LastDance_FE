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
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [dayEventsModalDate, setDayEventsModalDate] = useState<Date | null>(null);
  const [showMonthEventsModal, setShowMonthEventsModal] = useState(false);
  const [monthEventsModalDate, setMonthEventsModalDate] = useState<Date | null>(null);

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

  const handleShowMoreEvents = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    setDayEventsModalDate(date);
    setShowDayEventsModal(true);
  };

  // 월의 모든 일정을 보여주는 모달 열기
  const handleShowMonthEvents = (month: Date, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setMonthEventsModalDate(month);
    setShowMonthEventsModal(true);
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
      bill: 'bg-red-100 text-red-700 border-red-200',
      cleaning: 'bg-green-100 text-green-700 border-green-200', 
      meeting: 'bg-blue-100 text-blue-700 border-blue-200',
      appointment: 'bg-purple-100 text-purple-700 border-purple-200',
      health: 'bg-teal-100 text-teal-700 border-teal-200',
      shopping: 'bg-orange-100 text-orange-700 border-orange-200',
      travel: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    };
    
    const categoryStyle = baseStyles[event.category as keyof typeof baseStyles] || 'bg-gray-100 text-gray-700 border-gray-200';
    
    // 그룹 일정인 경우 보더 추가
    if (event.groupId) {
      return `${categoryStyle} border-l-4 border-l-primary-500`;
    }
    
    return categoryStyle;
  };

  // 일정 아이콘 렌더링
  const renderEventIcon = (event: any) => {
    if (event.groupId) {
      return <Users className="w-3 h-3 text-gray-600 flex-shrink-0" />;
    } else {
      return <User className="w-3 h-3 text-gray-600 flex-shrink-0" />;
    }
  };

  // 일정 라벨 렌더링
  const renderEventLabel = (event: any) => {
    if (event.groupId) {
      return (
        <div 
          className="text-[10px] text-gray-600 font-medium truncate min-w-0 flex-1" 
          title={event.groupName || '그룹'}
          style={{ maxWidth: '80px', wordBreak: 'break-all' }}
        >
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
                      <div 
                        className="text-2xl lg:text-3xl font-bold text-primary-600 truncate max-w-[200px] lg:max-w-[300px]" 
                        title={currentGroup?.name || "그룹 선택 필요"}
                      >
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
                    onMonthClick={handleShowMonthEvents}
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
                    onShowMoreEvents={handleShowMoreEvents}
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

        {/* Month Events Modal */}
        {showMonthEventsModal && monthEventsModalDate && (
          <MonthEventsModal
            month={monthEventsModalDate}
            events={events}
            getEventsForDate={getFilteredEventsForDate}
            getEventStyle={getEventStyle}
            renderEventIcon={renderEventIcon}
            renderEventLabel={renderEventLabel}
            onClose={() => {
              setShowMonthEventsModal(false);
              setMonthEventsModalDate(null);
            }}
            onEventClick={(event, date) => {
              setShowMonthEventsModal(false);
              setSelectedEvent(event);
              setSelectedDate(date);
              setShowEventModal(true);
            }}
            onAddEvent={(date) => {
              setShowMonthEventsModal(false);
              setSelectedEvent(null);
              setSelectedDate(date);
              setShowEventModal(true);
            }}
          />
        )}

        {/* Day Events Modal */}
        {showDayEventsModal && dayEventsModalDate && (
          <DayEventsModal
            date={dayEventsModalDate}
            events={getFilteredEventsForDate(dayEventsModalDate)}
            getEventStyle={getEventStyle}
            renderEventIcon={renderEventIcon}
            renderEventLabel={renderEventLabel}
            onClose={() => {
              setShowDayEventsModal(false);
              setDayEventsModalDate(null);
            }}
            onEventClick={(event) => {
              setShowDayEventsModal(false);
              setSelectedEvent(event);
              setSelectedDate(dayEventsModalDate);
              setShowEventModal(true);
            }}
            onAddEvent={() => {
              setShowDayEventsModal(false);
              setSelectedEvent(null);
              setSelectedDate(dayEventsModalDate);
              setShowEventModal(true);
            }}
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
  onMonthClick: (month: Date) => void;
  getEventsForDate: (date: Date) => any[];
}> = ({ currentDate, onMonthClick, getEventsForDate }) => {
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
                    onClick={() => onMonthClick(month)}
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
  onShowMoreEvents: (date: Date, e: React.MouseEvent) => void;
}> = ({ currentDate, onDateClick, onEventClick, getEventsForDate, getEventStyle, renderEventIcon, renderEventLabel, onShowMoreEvents }) => {
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
                            className={`text-[10px] sm:text-xs px-1 sm:px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-all border ${getEventStyle(event)} break-words overflow-hidden`}
                            whileHover={{ scale: 1.02 }}
                            onClick={(e) => onEventClick(event, e, day)} // ✅ day 파라미터 추가
                        >
                          <div className="flex items-center justify-between mb-1 min-w-0">
                            <div className="font-medium flex items-center space-x-1 min-w-0 flex-1">
                              <span className="hidden sm:inline flex-shrink-0">{renderEventIcon(event)}</span>
                              {event.repeat !== 'none' && (
                                  <Repeat className="w-3 h-3 opacity-60 flex-shrink-0" />
                              )}
                              <span className="truncate min-w-0" style={{ wordBreak: 'break-all' }}>{event.title}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between min-w-0">
                            <div className="flex-1 min-w-0">{renderEventLabel(event)}</div>
                            {event.isAllDay ? (
                                <div className="text-xs opacity-75 flex-shrink-0 ml-1">하루 종일</div>
                            ) : (
                                <div className="text-xs opacity-75 flex-shrink-0 ml-1">
                                  {event.startTime}
                                </div>
                            )}
                          </div>
                        </motion.div>
                    ))}
                    {dayEvents.length > 3 && (
                        <motion.button
                          className="text-xs text-accent-600 hover:text-accent-800 px-2 py-1 hover:bg-accent-50 rounded transition-colors font-medium"
                          whileHover={{ scale: 1.02 }}
                          onClick={(e) => onShowMoreEvents(day, e)}
                        >
                          +{dayEvents.length - 3}개
                        </motion.button>
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
                            className={`text-[10px] sm:text-xs px-1 sm:px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-all border ${getEventStyle(event)} break-words overflow-hidden`}
                            whileHover={{ scale: 1.02 }}
                            onClick={(e) => onEventClick(event, e, day)} // ✅ day 파라미터 추가
                        >
                          <div className="font-medium flex items-center space-x-1 mb-1 min-w-0">
                            <span className="hidden sm:inline flex-shrink-0">{renderEventIcon(event)}</span>
                            {event.repeat !== 'none' && (
                                <Repeat className="w-3 h-3 opacity-60 flex-shrink-0" />
                            )}
                            <span className="truncate min-w-0 flex-1" style={{ wordBreak: 'break-all' }}>{event.title}</span>
                          </div>
                          
                          <div className="flex items-center justify-between min-w-0">
                            <div className="flex-1 min-w-0">{renderEventLabel(event)}</div>
                            {!event.isAllDay && (
                                <div className="text-xs opacity-75 flex-shrink-0 ml-1">
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
                      className={`p-3 sm:p-4 rounded-lg cursor-pointer hover:shadow-md transition-all border-2 ${getEventStyle(event)} break-words overflow-hidden`}
                      whileHover={{ scale: 1.02 }}
                      onClick={(e) => onEventClick(event, e, currentDate)} // ✅ currentDate 파라미터 추가
                  >
                    <div className="flex justify-between items-start min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2 min-w-0">
                          <span className="hidden sm:inline flex-shrink-0">{renderEventIcon(event)}</span>
                          <h4 className="font-semibold text-gray-800 truncate min-w-0 flex-1" style={{ wordBreak: 'break-all' }}>{event.title}</h4>
                          {event.repeat !== 'none' && (
                              <Repeat className="w-4 h-4 opacity-60 flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mb-2 min-w-0">
                          <div className="flex-1 min-w-0">{renderEventLabel(event)}</div>
                          <div className="text-right flex-shrink-0">
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
                            <p className="text-sm text-gray-600 mt-1 break-words" style={{ wordBreak: 'break-all' }}>{event.description}</p>
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

// Day Events Modal Component
const DayEventsModal: React.FC<{
  date: Date;
  events: any[];
  getEventStyle: (event: any) => string;
  renderEventIcon: (event: any) => React.ReactNode;
  renderEventLabel: (event: any) => React.ReactNode;
  onClose: () => void;
  onEventClick: (event: any) => void;
  onAddEvent: () => void;
}> = ({ date, events, getEventStyle, renderEventIcon, renderEventLabel, onClose, onEventClick, onAddEvent }) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-primary-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {format(date, 'M월 d일 (E)', { locale: ko })} 일정
                </h2>
                <p className="text-primary-100 text-sm mt-1">
                  총 {events.length}개의 일정
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Events List */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {events.length > 0 ? (
              <div className="space-y-3">
                {events.map((event) => (
                  <motion.div
                    key={event.id}
                    className={`p-4 rounded-lg cursor-pointer hover:shadow-md transition-all border ${getEventStyle(event)} break-words overflow-hidden`}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onEventClick(event)}
                  >
                    <div className="flex items-start justify-between min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2 min-w-0">
                          <span className="flex-shrink-0">{renderEventIcon(event)}</span>
                          <h4 className="font-semibold text-gray-800 truncate min-w-0 flex-1" style={{ wordBreak: 'break-all' }}>{event.title}</h4>
                          {event.repeat !== 'none' && (
                            <Repeat className="w-4 h-4 opacity-60 flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between min-w-0">
                          <div className="flex-1 min-w-0">{renderEventLabel(event)}</div>
                          <div className="text-right flex-shrink-0">
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
                          <p className="text-sm text-gray-600 mt-2 break-words" style={{ wordBreak: 'break-all' }}>{event.description}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">이 날에는 일정이 없습니다</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-4 border-t">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                닫기
              </button>
              <motion.button
                className="flex items-center space-x-2 px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddEvent}
              >
                <Plus className="w-4 h-4" />
                <span>일정 추가</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Month Events Modal Component
const MonthEventsModal: React.FC<{
  month: Date;
  events: any[];
  getEventsForDate: (date: Date) => any[];
  getEventStyle: (event: any) => string;
  renderEventIcon: (event: any) => React.ReactNode;
  renderEventLabel: (event: any) => React.ReactNode;
  onClose: () => void;
  onEventClick: (event: any, date: Date) => void;
  onAddEvent: (date: Date) => void;
}> = ({ month, getEventsForDate, getEventStyle, renderEventIcon, renderEventLabel, onClose, onEventClick, onAddEvent }) => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 해당 월의 모든 일정 가져오기
  const allMonthEvents = monthDays.reduce((acc, day) => {
    const dayEvents = getEventsForDate(day);
    dayEvents.forEach(event => {
      acc.push({ ...event, eventDate: day });
    });
    return acc;
  }, [] as any[]);

  // 날짜별로 그룹화
  const eventsByDate = monthDays.map(day => ({
    date: day,
    events: getEventsForDate(day)
  })).filter(item => item.events.length > 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-primary-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {format(month, 'yyyy년 M월', { locale: ko })} 일정
                </h2>
                <p className="text-primary-100 text-sm mt-1">
                  총 {allMonthEvents.length}개의 일정
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Events List */}
          <div className="p-6 overflow-y-auto max-h-[65vh]">
            {eventsByDate.length > 0 ? (
              <div className="space-y-6">
                {eventsByDate.map(({ date, events }) => (
                  <div key={date.toString()} className="border-b border-gray-200 pb-6 last:border-b-0">
                    {/* Date Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {format(date, 'M월 d일 (E)', { locale: ko })}
                        {isSameDay(date, new Date()) && (
                          <span className="ml-2 text-sm bg-primary-100 text-primary-600 px-2 py-1 rounded-full">
                            오늘
                          </span>
                        )}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {events.length}개 일정
                      </span>
                    </div>

                    {/* Events for this date */}
                    <div className="grid gap-3 md:grid-cols-2">
                      {events.map((event) => (
                        <motion.div
                          key={event.id}
                          className={`p-4 rounded-lg cursor-pointer hover:shadow-md transition-all border ${getEventStyle(event)} break-words overflow-hidden`}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => onEventClick(event, date)}
                        >
                          <div className="flex items-start justify-between min-w-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2 min-w-0">
                                <span className="flex-shrink-0">{renderEventIcon(event)}</span>
                                <h4 className="font-semibold text-gray-800 truncate min-w-0 flex-1" style={{ wordBreak: 'break-all' }}>{event.title}</h4>
                                {event.repeat !== 'none' && (
                                  <Repeat className="w-4 h-4 opacity-60 flex-shrink-0" />
                                )}
                              </div>
                              
                              <div className="flex items-center justify-between mb-2 min-w-0">
                                <div className="flex-1 min-w-0">{renderEventLabel(event)}</div>
                                <div className="text-right flex-shrink-0">
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
                                <p className="text-sm text-gray-600 mt-2 overflow-hidden break-words" style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  wordBreak: 'break-all'
                                }}>{event.description}</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Add event button for this date */}
                    <motion.button
                      className="mt-3 flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-800 hover:bg-primary-50 px-3 py-2 rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => onAddEvent(date)}
                    >
                      <Plus className="w-4 h-4" />
                      <span>이 날에 일정 추가</span>
                    </motion.button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  {format(month, 'M월', { locale: ko })}에는 일정이 없습니다
                </h3>
                <p className="text-gray-500 mb-6">새로운 일정을 추가해보세요</p>
                <motion.button
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onAddEvent(monthStart)}
                >
                  <Plus className="w-5 h-5" />
                  <span>일정 추가</span>
                </motion.button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-4 border-t">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                닫기
              </button>
              <div className="text-sm text-gray-500">
                {format(month, 'yyyy년 M월', { locale: ko })} 일정 요약
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CalendarPage;