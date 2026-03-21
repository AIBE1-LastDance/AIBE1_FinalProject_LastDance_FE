// hooks/useCalendar.ts
import { useState, useEffect, useCallback } from 'react';
import { calendarApi, CalendarsQuery } from '../api/calendar';
import { Event } from '../types';
import toast from 'react-hot-toast';

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
    loadEvents: (query?: CalendarsQuery, shouldReplace?: boolean) => Promise<void>;
    createEvent: (eventData: Partial<Event>) => Promise<Event | null>;
    updateEvent: (eventId: string, eventData: Partial<Event>) => Promise<Event | null>;
    // 이벤트 삭제 (모든 반복 일정 삭제)
    deleteEvent: (eventId: string) => Promise<boolean>;
    refreshEvents: () => Promise<void>;

    // 네비게이션
    setCurrentDate: (date: Date) => void;
    setCurrentView: (view: 'day' | 'week' | 'month' | 'year') => void;
    goToToday: () => void;
    goToMonth: (date: Date) => void;
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
    const [eventsCache, setEventsCache] = useState<{[key: string]: Event[]}>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState<Date>(initialDate);
    const [currentView, setCurrentView] = useState<'day' | 'week' | 'month' | 'year'>(initialView);

    // 현재 모드의 키 생성
    const getCurrentCacheKey = useCallback(() => {
        return groupId ? `group_${groupId}` : 'personal';
    }, [groupId]);

    // 현재 이벤트 데이터 가져오기
    const events = eventsCache[getCurrentCacheKey()] || [];

    // 에러 클리어
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // 이벤트 로드
    const loadEvents = useCallback(async (query: CalendarsQuery = {}, shouldReplace = true) => {
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
                const cacheKey = getCurrentCacheKey();
                
                if (shouldReplace) {
                    setEventsCache(prev => ({
                        ...prev,
                        [cacheKey]: response.data!
                    }));
                } else {
                    // 기존 데이터와 병합
                    setEventsCache(prev => {
                        const existingEvents = prev[cacheKey] || [];
                        const existingIds = new Set(existingEvents.map(event => event.id));
                        const newEvents = response.data!.filter(event => !existingIds.has(event.id));
                        return {
                            ...prev,
                            [cacheKey]: [...existingEvents, ...newEvents]
                        };
                    });
                }
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
    }, [groupId, getCurrentCacheKey]); // loading 의존성 제거

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
            case 'week':   // 🔥 MONTHLY 데이터 사용
            case 'day':    // 🔥 MONTHLY 데이터 사용
                query.viewType = 'MONTHLY';
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
                const cacheKey = getCurrentCacheKey();
                setEventsCache(prev => ({
                    ...prev,
                    [cacheKey]: [...(prev[cacheKey] || []), response.data!]
                }));
                await refreshEvents();
                toast.success('일정이 추가되었습니다');
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
    }, [loading, getCurrentCacheKey]);

    // 이벤트 수정
    const updateEvent = useCallback(async (eventId: string, eventData: Partial<Event>): Promise<Event | null> => {
        if (loading) return null;
        
        setLoading(true);
        setError(null);

        try {
            const response = await calendarApi.updateCalendar(eventId, eventData);

            if (response.success && response.data) {
                const cacheKey = getCurrentCacheKey();
                setEventsCache(prev => ({
                    ...prev,
                    [cacheKey]: (prev[cacheKey] || []).map(event =>
                        event.id === eventId ? response.data! : event
                    )
                }));
                toast.success('일정이 수정되었습니다');
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
    }, [loading, getCurrentCacheKey]);

    // 이벤트 삭제 (모든 반복 일정 삭제)
    const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
        if (loading) return false;
        
        setLoading(true);
        setError(null);

        try {
            const response = await calendarApi.deleteCalendar(eventId);

            if (response.success) {
                // 모든 반복 일정 삭제이므로 해당 이벤트를 완전히 제거
                const cacheKey = getCurrentCacheKey();
                setEventsCache(prev => ({
                    ...prev,
                    [cacheKey]: (prev[cacheKey] || []).filter(event => event.id !== eventId)
                }));
                toast.success('일정이 삭제되었습니다');
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
    }, [loading, getCurrentCacheKey]);

    // 네비게이션 함수들
    const goToToday = useCallback(() => {
        setCurrentDate(new Date());
    }, []);

    // 월 이동 (데이터 유지)
    const goToMonth = useCallback((targetDate: Date) => {
        setCurrentDate(targetDate);
        setCurrentView('month');
        // 데이터는 유지하고 새로운 데이터만 필요시 추가 로드
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

        const filteredEvents = events.filter(event => {
            const eventStartDate = event.date instanceof Date ? new Date(event.date) : new Date(event.date);
            const eventStart = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());

            const eventEndDate = event.endDate ?
                (event.endDate instanceof Date ? new Date(event.endDate) : new Date(event.endDate)) :
                eventStartDate;
            const eventEnd = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate());

            // 백엔드가 이미 반복 일정을 확장해서 인스턴스로 보내주므로
            // 프론트에서는 단순히 날짜 범위만 체크
            return targetDate >= eventStart && targetDate <= eventEnd;
        });

        // 중복 제거
        const uniqueEvents = filteredEvents.reduce((acc: Event[], current: Event) => {
            const duplicate = acc.find(event =>
                event.id === current.id &&
                event.startTime === current.startTime
            );
            if (!duplicate) {
                acc.push(current);
            }
            return acc;
        }, []);

        return uniqueEvents;
    }, [events]);

    // 자동 로드 - groupId, currentDate, currentView 변경 시 실행
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
                case 'week':   // 🔥 MONTHLY 데이터 사용
                case 'day':    // 🔥 MONTHLY 데이터 사용
                    query.viewType = 'MONTHLY';
                    break;
            }

            loadEvents(query);
        }
    }, [groupId, currentDate, currentView, autoLoad, loadEvents]); // 모든 관련 의존성 추가

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