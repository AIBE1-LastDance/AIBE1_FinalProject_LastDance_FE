import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Grid, List, Calendar as CalendarIcon, BarChart3 } from 'lucide-react';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
  startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, subDays, addYears, subYears, startOfYear, endOfYear,
  eachWeekOfInterval, eachMonthOfInterval
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import EventModal from './EventModal';

const CalendarPage: React.FC = () => {
  const { currentDate, setCurrentDate, currentView, setCurrentView, events, mode } = useAppStore();
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // currentDate가 유효한지 확인하고 필요시 수정
  useEffect(() => {
    if (!currentDate || !(currentDate instanceof Date) || isNaN(currentDate.getTime())) {
      console.warn('Invalid currentDate detected, resetting to current date');
      setCurrentDate(new Date());
    }
  }, [currentDate, setCurrentDate]);

  // 뷰에 따른 네비게이션 함수들
  const handlePrevious = () => {
    const safeDate = currentDate instanceof Date && !isNaN(currentDate.getTime()) 
      ? currentDate 
      : new Date();

    try {
      switch (currentView) {
        case 'year':
          setCurrentDate(subYears(safeDate, 1));
          break;
        case 'month':
          setCurrentDate(subMonths(safeDate, 1));
          break;
        case 'week':
          setCurrentDate(subWeeks(safeDate, 1));
          break;
        case 'day':
          setCurrentDate(subDays(safeDate, 1));
          break;
      }
    } catch (error) {
      console.error('Navigation error:', error);
      setCurrentDate(new Date());
    }
  };

  const handleNext = () => {
    const safeDate = currentDate instanceof Date && !isNaN(currentDate.getTime()) 
      ? currentDate 
      : new Date();

    try {
      switch (currentView) {
        case 'year':
          setCurrentDate(addYears(safeDate, 1));
          break;
        case 'month':
          setCurrentDate(addMonths(safeDate, 1));
          break;
        case 'week':
          setCurrentDate(addWeeks(safeDate, 1));
          break;
        case 'day':
          setCurrentDate(addDays(safeDate, 1));
          break;
      }
    } catch (error) {
      console.error('Navigation error:', error);
      setCurrentDate(new Date());
    }
  };

  // 뷰에 따른 제목 표시
  const getViewTitle = () => {
    // currentDate가 유효한지 확인
    const safeDate = currentDate instanceof Date && !isNaN(currentDate.getTime()) 
      ? currentDate 
      : new Date();

    try {
      switch (currentView) {
        case 'year':
          return format(safeDate, 'yyyy년', { locale: ko });
        case 'month':
          return format(safeDate, 'yyyy년 M월', { locale: ko });
        case 'week':
          const weekStart = startOfWeek(safeDate, { weekStartsOn: 0 });
          const weekEnd = endOfWeek(safeDate, { weekStartsOn: 0 });
          return `${format(weekStart, 'M월 d일', { locale: ko })} - ${format(weekEnd, 'M월 d일', { locale: ko })}`;
        case 'day':
          return format(safeDate, 'yyyy년 M월 d일 (E)', { locale: ko });
        default:
          return format(safeDate, 'yyyy년 M월', { locale: ko });
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

  const getEventsForDate = (date: Date) => {
    console.log('Getting events for date:', date);
    console.log('All events:', events);
    console.log('Current mode:', mode);

    // Ensure date is a valid Date object
    const safeDate = date instanceof Date ? date : new Date();
    const targetDate = new Date(safeDate.getFullYear(), safeDate.getMonth(), safeDate.getDate());

    const filteredEvents = events.filter(event => {
      // Ensure event.date is a valid Date object
      const eventStartDate = event.date instanceof Date ? new Date(event.date) : new Date();
      const eventStart = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());

      // Ensure event.endDate is a valid Date object if it exists
      const eventEndDate = event.endDate instanceof Date ? new Date(event.endDate) : 
                          (event.endDate ? new Date(event.endDate) : eventStartDate);
      const eventEnd = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate());

      // 일정 기간 확인 (시작일 <= 조회날짜 <= 종료일)
      const isInDateRange = targetDate >= eventStart && targetDate <= eventEnd;

      // 모드에 따른 필터링 수정
      let modeFilter = false;
      if (mode === 'personal') {
        // 개인모드: groupId가 없는 일정만 표시
        modeFilter = !event.groupId;
      } else {
        // 그룹모드: groupId가 있는 일정만 표시
        modeFilter = !!event.groupId;
      }

      console.log(`Event ${event.title}:`, {
        eventStart,
        eventEnd,
        targetDate,
        isInDateRange,
        modeFilter,
        groupId: event.groupId,
        mode,
        finalResult: isInDateRange && modeFilter
      });

      return isInDateRange && modeFilter;
    });

    console.log('Filtered events for date:', filteredEvents);
    return filteredEvents;
  };

  const viewOptions = [
    { value: 'year', label: '연간', icon: BarChart3 },
    { value: 'month', label: '월간', icon: Grid },
    { value: 'week', label: '주간', icon: List },
    { value: 'day', label: '일간', icon: CalendarIcon },
  ];

  return (
    <div className="space-y-6">
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
              onClick={handlePrevious}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <h2 className="text-lg font-medium text-gray-700 min-w-[200px] text-center">
              {getViewTitle()}
            </h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="p-2 rounded-lg hover:bg-gray-100"
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
              >
                <option.icon className="w-4 h-4" />
                <span>{option.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Add Event Button */}
          <motion.button
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedDate(new Date());
              setSelectedEvent(null);
              setShowEventModal(true);
            }}
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
        {currentView === 'year' && <YearView currentDate={currentDate} events={events} mode={mode} onDateClick={handleDateClick} />}
        {currentView === 'month' && <MonthView currentDate={currentDate} events={events} mode={mode} onDateClick={handleDateClick} onEventClick={handleEventClick} getEventsForDate={getEventsForDate} />}
        {currentView === 'week' && <WeekView currentDate={currentDate} events={events} mode={mode} onDateClick={handleDateClick} onEventClick={handleEventClick} getEventsForDate={getEventsForDate} />}
        {currentView === 'day' && <DayView currentDate={currentDate} events={events} mode={mode} onDateClick={handleDateClick} onEventClick={handleEventClick} getEventsForDate={getEventsForDate} />}
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
}> = ({ currentDate, events, mode, onDateClick }) => {
  // 안전한 날짜 확인
  const safeDate = currentDate instanceof Date && !isNaN(currentDate.getTime()) 
    ? currentDate 
    : new Date();

  const yearStart = startOfYear(safeDate);
  const yearEnd = endOfYear(safeDate);
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const getMonthEventCount = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    return events.filter(event => {
      // Ensure event.date is a valid Date object
      const eventDate = event.date instanceof Date ? new Date(event.date) : new Date();
      const modeFilter = mode === 'personal' ? !event.groupId : event.groupId;
      return eventDate >= monthStart && eventDate <= monthEnd && modeFilter;
    }).length;
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
  events: any[];
  mode: string;
  onDateClick: (date: Date) => void;
  onEventClick: (event: any, e: React.MouseEvent) => void;
  getEventsForDate: (date: Date) => any[];
}> = ({ currentDate, onDateClick, onEventClick, getEventsForDate }) => {
  // 안전한 날짜 확인
  const safeDate = currentDate instanceof Date && !isNaN(currentDate.getTime()) 
    ? currentDate 
    : new Date();

  const monthStart = startOfMonth(safeDate);
  const monthEnd = endOfMonth(safeDate);

  // 달력에서 표시할 첫 번째 날과 마지막 날 (주 단위로 표시)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // 달력에 표시할 모든 날짜들
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
          const isCurrentMonth = isSameMonth(day, safeDate);

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
                    className={`text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${
                      event.category === 'bill' ? 'bg-red-100 text-red-800' :
                      event.category === 'cleaning' ? 'bg-green-100 text-green-800' :
                      event.category === 'meeting' ? 'bg-blue-100 text-blue-800' :
                      event.category === 'appointment' ? 'bg-purple-100 text-purple-800' :
                      event.category === 'health' ? 'bg-pink-100 text-pink-800' :
                      event.category === 'shopping' ? 'bg-yellow-100 text-yellow-800' :
                      event.category === 'travel' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    onClick={(e) => onEventClick(event, e)}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    {event.isAllDay ? (
                      <div className="text-xs opacity-75">하루 종일</div>
                    ) : (
                      <div className="text-xs opacity-75">
                        {event.startTime} - {event.endTime}
                      </div>
                    )}
                    {event.endDate && new Date(event.endDate).getTime() !== new Date(event.date).getTime() && (
                      <div className="text-xs opacity-75">
                        ~{format(new Date(event.endDate), 'M/d', { locale: ko })}
                      </div>
                    )}
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
  events: any[];
  mode: string;
  onDateClick: (date: Date) => void;
  onEventClick: (event: any, e: React.MouseEvent) => void;
  getEventsForDate: (date: Date) => any[];
}> = ({ currentDate, onDateClick, onEventClick, getEventsForDate }) => {
  // 안전한 날짜 확인
  const safeDate = currentDate instanceof Date && !isNaN(currentDate.getTime()) 
    ? currentDate 
    : new Date();

  const weekStart = startOfWeek(safeDate, { weekStartsOn: 0 });
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
                    className={`text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                      event.category === 'bill' ? 'bg-red-100 text-red-800' :
                      event.category === 'cleaning' ? 'bg-green-100 text-green-800' :
                      event.category === 'meeting' ? 'bg-blue-100 text-blue-800' :
                      event.category === 'appointment' ? 'bg-purple-100 text-purple-800' :
                      event.category === 'health' ? 'bg-pink-100 text-pink-800' :
                      event.category === 'shopping' ? 'bg-yellow-100 text-yellow-800' :
                      event.category === 'travel' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    onClick={(e) => onEventClick(event, e)}
                  >
                    <div className="font-medium">{event.title}</div>
                    {!event.isAllDay && (
                      <div className="text-xs opacity-75">
                        {event.startTime} - {event.endTime}
                      </div>
                    )}
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
  events: any[];
  mode: string;
  onDateClick: (date: Date) => void;
  onEventClick: (event: any, e: React.MouseEvent) => void;
  getEventsForDate: (date: Date) => any[];
}> = ({ currentDate, onDateClick, onEventClick, getEventsForDate }) => {
  // 안전한 날짜 확인
  const safeDate = currentDate instanceof Date && !isNaN(currentDate.getTime()) 
    ? currentDate 
    : new Date();

  const dayEvents = getEventsForDate(safeDate);
  const isToday = isSameDay(safeDate, new Date());

  return (
    <div className="p-6">
      <div className={`text-center mb-6 p-4 rounded-lg ${
        isToday ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
      }`}>
        <h3 className={`text-2xl font-bold ${isToday ? 'text-primary-600' : 'text-gray-800'}`}>
          {format(safeDate, 'd')}
        </h3>
        <p className="text-gray-600">
          {format(safeDate, 'yyyy년 M월 d일 E요일', { locale: ko })}
        </p>
      </div>

      <div className="space-y-4">
        {dayEvents.length > 0 ? (
          dayEvents.map((event) => (
            <motion.div
              key={event.id}
              className={`p-4 rounded-lg cursor-pointer hover:shadow-md transition-all ${
                event.category === 'bill' ? 'bg-red-50 border border-red-200' :
                event.category === 'cleaning' ? 'bg-green-50 border border-green-200' :
                event.category === 'meeting' ? 'bg-blue-50 border border-blue-200' :
                event.category === 'appointment' ? 'bg-purple-50 border border-purple-200' :
                event.category === 'health' ? 'bg-pink-50 border border-pink-200' :
                event.category === 'shopping' ? 'bg-yellow-50 border border-yellow-200' :
                event.category === 'travel' ? 'bg-indigo-50 border border-indigo-200' :
                'bg-gray-50 border border-gray-200'
              }`}
              whileHover={{ scale: 1.02 }}
              onClick={(e) => onEventClick(event, e)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-800">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  )}
                </div>
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
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">이 날에는 일정이 없습니다</p>
            <motion.button
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              onClick={() => onDateClick(safeDate)}
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
