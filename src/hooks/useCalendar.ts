// hooks/useCalendar.ts
import { useState, useEffect, useCallback } from 'react';
import { calendarApi, CalendarsQuery } from '../api/calendar';
import { Event } from '../types';

interface UseCalendarOptions {
    autoLoad?: boolean;
    initialView?: 'day' | 'week' | 'month' | 'year';
    initialDate?: Date;
    groupId?: string;
}

interface UseCalendarReturn {
    // 상태
    events: Event[];
    loading: boolean;
    error: string | null;
    currentDate: Date;
    currentView: 'day' | 'week' | 'month' | 'year';

    // 액션
    loadEvents: (query?: CalendarsQuery) => Promise<void>;
    createEvent: (eventData: Partial<Event>) => Promise<Event | null>;
    updateEvent: (eventId: string, eventData: Partial<Event>) => Promise<Event | null>;
    // 이벤트 삭제 (모든 반복 일정 삭제)
    deleteEvent: (eventId: string) => Promise<boolean>;
    refreshEvents: () => Promise<void>;

    // 네비게이션
    setCurrentDate: (date: Date) => void;
    setCurrentView: (view: 'day' | 'week' | 'month' | 'year') => void;
    goToToday: () => void;
    goToPrevious: () => void;
    goToNext: () => void;

    // 유틸리티
    getEventsForDate: (date: Date) => Event[];
    clearError: () => void;
}

export const useCalendar = (options: UseCalendarOptions = {}): UseCalendarReturn => {
    const {
        autoLoad = true,
        initialView = 'month',
        initialDate = new Date(),
        groupId
    } = options;

    // 상태
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState<Date>(initialDate);
    const [currentView, setCurrentView] = useState<'day' | 'week' | 'month' | 'year'>(initialView);

    // 에러 클리어
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // 이벤트 로드
    const loadEvents = useCallback(async (query: CalendarsQuery = {}) => {
        // 이미 로딩 중이면 중복 요청 방지
        if (loading) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let response;

            if (groupId) {
                response = await calendarApi.getGroupCalendars(groupId, query);
            } else {
                response = await calendarApi.getMyCalendars(query);
            }

            if (response.success && response.data) {
                setEvents(response.data);
            } else {
                const errorMsg = response.error || 'Failed to load events';
                // 401 에러는 이미 api.ts에서 처리하므로 여기서는 다른 에러만 표시
                if (!errorMsg.includes('로그인') && !errorMsg.includes('401')) {
                    setError(errorMsg);
                }
            }
        } catch (error: any) {
            // 401 에러는 이미 api.ts에서 처리하므로 무시
            if (error.response?.status === 401) {
                return;
            }
            
            const errorMsg = error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [groupId]); // loading 의존성 제거

    // 현재 뷰와 날짜에 맞는 이벤트 로드
    const refreshEvents = useCallback(async () => {
        // 이미 로딩 중이면 중복 요청 방지
        if (loading) {
            return;
        }

        const query: CalendarsQuery = {
            dateTime: currentDate.toISOString(),
        };

        switch (currentView) {
            case 'year':
                query.viewType = 'YEARLY';
                break;
            case 'month':
                query.viewType = 'MONTHLY';
                break;
            case 'week':
                query.viewType = 'WEEKLY';
                break;
            case 'day':
                query.viewType = 'DAILY';
                break;
        }

        await loadEvents(query);
    }, [currentDate, currentView, loadEvents, loading]);

    // 이벤트 생성
    const createEvent = useCallback(async (eventData: Partial<Event>): Promise<Event | null> => {
        if (loading) return null;
        
        setLoading(true);
        setError(null);

        try {
            const response = await calendarApi.createCalendar(eventData);

            if (response.success && response.data) {
                setEvents(prev => [...prev, response.data!]);
                await refreshEvents();
                return response.data;
            } else {
                const errorMsg = response.error || 'Failed to create event';
                if (!errorMsg.includes('로그인') && !errorMsg.includes('401')) {
                    setError(errorMsg);
                }
                return null;
            }
        } catch (error: any) {
            if (error.response?.status === 401) {
                return null;
            }
            
            const errorMsg = error instanceof Error ? error.message : '이벤트 생성 중 오류가 발생했습니다.';
            setError(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    }, [loading]);

    // 이벤트 수정
    const updateEvent = useCallback(async (eventId: string, eventData: Partial<Event>): Promise<Event | null> => {
        if (loading) return null;
        
        setLoading(true);
        setError(null);

        try {
            const response = await calendarApi.updateCalendar(eventId, eventData);

            if (response.success && response.data) {
                setEvents(prev => prev.map(event =>
                    event.id === eventId ? response.data! : event
                ));
                return response.data;
            } else {
                const errorMsg = response.error || 'Failed to update event';
                if (!errorMsg.includes('로그인') && !errorMsg.includes('401')) {
                    setError(errorMsg);
                }
                return null;
            }
        } catch (error: any) {
            if (error.response?.status === 401) {
                return null;
            }
            
            const errorMsg = error instanceof Error ? error.message : '이벤트 수정 중 오류가 발생했습니다.';
            setError(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    }, [loading]);

    // 이벤트 삭제 (모든 반복 일정 삭제)
    const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
        if (loading) return false;
        
        setLoading(true);
        setError(null);

        try {
            const response = await calendarApi.deleteCalendar(eventId);

            if (response.success) {
                // 모든 반복 일정 삭제이므로 해당 이벤트를 완전히 제거
                setEvents(prev => prev.filter(event => event.id !== eventId));
                return true;
            } else {
                const errorMsg = response.error || 'Failed to delete event';
                if (!errorMsg.includes('로그인') && !errorMsg.includes('401')) {
                    setError(errorMsg);
                }
                return false;
            }
        } catch (error: any) {
            if (error.response?.status === 401) {
                return false;
            }
            
            const errorMsg = error instanceof Error ? error.message : '이벤트 삭제 중 오류가 발생했습니다.';
            setError(errorMsg);
            return false;
        } finally {
            setLoading(false);
        }
    }, [loading]);

    // 네비게이션 함수들
    const goToToday = useCallback(() => {
        setCurrentDate(new Date());
    }, []);

    const goToPrevious = useCallback(() => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            switch (currentView) {
                case 'year':
                    newDate.setFullYear(prev.getFullYear() - 1);
                    break;
                case 'month':
                    newDate.setMonth(prev.getMonth() - 1);
                    break;
                case 'week':
                    newDate.setDate(prev.getDate() - 7);
                    break;
                case 'day':
                    newDate.setDate(prev.getDate() - 1);
                    break;
            }
            return newDate;
        });
    }, [currentView]);

    const goToNext = useCallback(() => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            switch (currentView) {
                case 'year':
                    newDate.setFullYear(prev.getFullYear() + 1);
                    break;
                case 'month':
                    newDate.setMonth(prev.getMonth() + 1);
                    break;
                case 'week':
                    newDate.setDate(prev.getDate() + 7);
                    break;
                case 'day':
                    newDate.setDate(prev.getDate() + 1);
                    break;
            }
            return newDate;
        });
    }, [currentView]);

    // 특정 날짜의 이벤트 필터링
    const getEventsForDate = useCallback((date: Date): Event[] => {
        const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const targetDateString = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식

        return events.filter(event => {

            const eventStartDate = event.date instanceof Date ? new Date(event.date) : new Date(event.date);
            const eventStart = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());

            const eventEndDate = event.endDate ?
                (event.endDate instanceof Date ? new Date(event.endDate) : new Date(event.endDate)) :
                eventStartDate;
            const eventEnd = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate());

            // 반복 설정이 없는 경우
            if (!event.repeat || event.repeat === 'none') {
                return targetDate >= eventStart && targetDate <= eventEnd;
            }

            // 반복 일정 처리
            if (targetDate < eventStart) {
                return false;
            }

            // 반복 종료일 확인
            if (event.repeatEndDate) {
                const repeatEndDate = event.repeatEndDate instanceof Date ?
                    new Date(event.repeatEndDate) :
                    new Date(event.repeatEndDate);
                const repeatEnd = new Date(repeatEndDate.getFullYear(), repeatEndDate.getMonth(), repeatEndDate.getDate());

                if (targetDate > repeatEnd) {
                    return false;
                }
            }

            // 예외 날짜(exceptionDates) 확인 - 이 날짜들은 제외
            if (event.exceptionDates && Array.isArray(event.exceptionDates) && event.exceptionDates.length > 0) {
                
                // 예외 날짜 배열에서 해당 날짜가 있는지 확인
                const isExceptionDate = event.exceptionDates.some(exceptionDate => {
                    // exceptionDate가 "2025-06-24T09:00:00" 형식인 경우 날짜 부분만 추출
                    let exceptionDateString;
                    if (typeof exceptionDate === 'string') {
                        exceptionDateString = exceptionDate.split('T')[0];
                    } else {
                        exceptionDateString = new Date(exceptionDate).toISOString().split('T')[0];
                    }
                    
                    return exceptionDateString === targetDateString;
                });
                
                if (isExceptionDate) {
                    return false; // 예외 날짜이므로 해당 날짜에는 표시하지 않음
                }
            }

            // 반복 패턴 확인
            let patternMatch = false;
            switch (event.repeat) {
                case 'daily':
                    patternMatch = true;
                    break;
                case 'weekly':
                    patternMatch = eventStart.getDay() === targetDate.getDay();
                    break;
                case 'monthly':
                    const startDay = eventStart.getDate();
                    const targetDay = targetDate.getDate();
                    const lastDayOfTargetMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
                    const adjustedStartDay = startDay > lastDayOfTargetMonth ? lastDayOfTargetMonth : startDay;
                    patternMatch = targetDay === adjustedStartDay;
                    break;
                case 'yearly':
                    patternMatch = eventStart.getMonth() === targetDate.getMonth() &&
                        eventStart.getDate() === targetDate.getDate();
                    break;
                default:
                    patternMatch = false;
            }

            return patternMatch;
        });
    }, [events]);

    // 자동 로드 - 한 번만 실행
    useEffect(() => {
        if (autoLoad) {
            const query: CalendarsQuery = {
                dateTime: currentDate.toISOString(),
            };

            switch (currentView) {
                case 'year':
                    query.viewType = 'YEARLY';
                    break;
                case 'month':
                    query.viewType = 'MONTHLY';
                    break;
                case 'week':
                    query.viewType = 'WEEKLY';
                    break;
                case 'day':
                    query.viewType = 'DAILY';
                    break;
            }

            loadEvents(query);
        }
    }, []); // 컴포넌트 마운트 시에만 실행

    // 날짜나 뷰 변경 시 이벤트 새로고침
    useEffect(() => {
        if (autoLoad) {
            const query: CalendarsQuery = {
                dateTime: currentDate.toISOString(),
            };

            switch (currentView) {
                case 'year':
                    query.viewType = 'YEARLY';
                    break;
                case 'month':
                    query.viewType = 'MONTHLY';
                    break;
                case 'week':
                    query.viewType = 'WEEKLY';
                    break;
                case 'day':
                    query.viewType = 'DAILY';
                    break;
            }

            loadEvents(query);
        }
    }, [currentDate, currentView]); // loadEvents, autoLoad 의존성 제거

    return {
        // 상태
        events,
        loading,
        error,
        currentDate,
        currentView,

        // 액션
        loadEvents,
        createEvent,
        updateEvent,
        deleteEvent,
        refreshEvents,

        // 네비게이션
        setCurrentDate,
        setCurrentView,
        goToToday,
        goToPrevious,
        goToNext,

        // 유틸리티
        getEventsForDate,
        clearError,
    };
};