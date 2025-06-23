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
    deleteEvent: (eventId: string, deleteType?: 'single' | 'future' | 'all') => Promise<boolean>;
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
                console.log('[useCalendar] Events loaded:', response.data.length);
            } else {
                const errorMsg = response.error || 'Failed to load events';
                setError(errorMsg);
                console.error('[useCalendar] Load error:', errorMsg);
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.';
            setError(errorMsg);
            console.error('[useCalendar] Load exception:', error);
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    // 현재 뷰와 날짜에 맞는 이벤트 로드
    const refreshEvents = useCallback(async () => {
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
    }, [currentDate, currentView, loadEvents]);

    // 이벤트 생성
    const createEvent = useCallback(async (eventData: Partial<Event>): Promise<Event | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await calendarApi.createCalendar(eventData);

            if (response.success && response.data) {
                setEvents(prev => [...prev, response.data!]);
                console.log('[useCalendar] Event created:', response.data);
                await refreshEvents();
                return response.data;
            } else {
                const errorMsg = response.error || 'Failed to create event';
                setError(errorMsg);
                console.error('[useCalendar] Create error:', errorMsg);
                return null;
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : '이벤트 생성 중 오류가 발생했습니다.';
            setError(errorMsg);
            console.error('[useCalendar] Create exception:', error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // 이벤트 수정
    const updateEvent = useCallback(async (eventId: string, eventData: Partial<Event>): Promise<Event | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await calendarApi.updateCalendar(eventId, eventData);

            if (response.success && response.data) {
                setEvents(prev => prev.map(event =>
                    event.id === eventId ? response.data! : event
                ));
                console.log('[useCalendar] Event updated:', response.data);
                return response.data;
            } else {
                const errorMsg = response.error || 'Failed to update event';
                setError(errorMsg);
                console.error('[useCalendar] Update error:', errorMsg);
                return null;
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : '이벤트 수정 중 오류가 발생했습니다.';
            setError(errorMsg);
            console.error('[useCalendar] Update exception:', error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // 이벤트 삭제
    const deleteEvent = useCallback(async (eventId: string, deleteType?: 'single' | 'future' | 'all'): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const response = await calendarApi.deleteCalendar(eventId, deleteType);

            if (response.success) {
                setEvents(prev => prev.filter(event => event.id !== eventId));
                console.log('[useCalendar] Event deleted:', eventId);
                return true;
            } else {
                const errorMsg = response.error || 'Failed to delete event';
                setError(errorMsg);
                console.error('[useCalendar] Delete error:', errorMsg);
                return false;
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : '이벤트 삭제 중 오류가 발생했습니다.';
            setError(errorMsg);
            console.error('[useCalendar] Delete exception:', error);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

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

            // 반복 패턴 확인
            switch (event.repeat) {
                case 'daily':
                    return true;
                case 'weekly':
                    return eventStart.getDay() === targetDate.getDay();
                case 'monthly':
                    const startDay = eventStart.getDate();
                    const targetDay = targetDate.getDate();
                    const lastDayOfTargetMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
                    const adjustedStartDay = startDay > lastDayOfTargetMonth ? lastDayOfTargetMonth : startDay;
                    return targetDay === adjustedStartDay;
                case 'yearly':
                    return eventStart.getMonth() === targetDate.getMonth() &&
                        eventStart.getDate() === targetDate.getDate();
                default:
                    return false;
            }
        });
    }, [events]);

    // 자동 로드
    useEffect(() => {
        if (autoLoad) {
            refreshEvents();
        }
    }, [autoLoad, refreshEvents]);

    // 날짜나 뷰 변경 시 이벤트 새로고침
    useEffect(() => {
        if (autoLoad) {
            refreshEvents();
        }
    }, [currentDate, currentView, autoLoad, refreshEvents]);

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