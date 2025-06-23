import { apiClient, ApiResponse } from './client';
import { Event } from '../types';

// 백엔드 실제 Calendar 응답 타입에 맞게 수정
export interface CalendarResponseDTO {
  calendarId: number;
  title: string;
  description?: string;
  startDate: string; // LocalDateTime as ISO string
  endDate?: string;
  isAllDay: boolean;
  category: string; // Enum이 string으로 변환됨
  type: string; // Enum이 string으로 변환됨
  repeatType?: string; // Enum이 string으로 변환됨
  repeatEndDate?: string;
  userId: string; // UUID가 string으로 변환됨
  groupId?: string; // UUID가 string으로 변환됨
  createdAt: string;
  // startTime, endTime, updatedAt는 백엔드에 없음
}

// 백엔드 요청 타입들
export interface CreateCalendarRequestDTO {
  title: string;
  description?: string;
  startDate: string; // LocalDateTime as ISO string
  endDate?: string;
  isAllDay: boolean;
  category: string;
  type: string;
  repeatType?: string;
  repeatEndDate?: string;
  groupId?: string;
}

export interface UpdateCalendarRequestDTO extends Partial<CreateCalendarRequestDTO> {}

export interface CalendarsQuery {
  viewType?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'NONE';
  dateTime?: string; // LocalDateTime as ISO string
  type?: string;
  category?: string;
  groupId?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export class CalendarApi {
  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 날짜에서 시간을 안전하게 추출 (로컬 시간대 기준)
   */
  private extractTimeFromDate(date: Date): string {
    // 백엔드에서 LocalDateTime으로 오는 데이터를 로컬 시간으로 처리
    // 예: "2025-06-23T09:00:00" → "09:00"
    
    if (date instanceof Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Date가 아닌 경우 (문자열 등) ISO 문자열에서 추출
    const dateStr = date.toString();
    const timeMatch = dateStr.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '00:00';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * Event를 백엔드 요청으로 변환
   */
  private eventToCalendarRequest(event: Partial<Event>): CreateCalendarRequestDTO | UpdateCalendarRequestDTO {
    // 날짜와 시간을 합쳐서 LocalDateTime으로 변환
    const eventDate = event.date ? new Date(event.date) : new Date();
    let startDateTime = eventDate;
    let endDateTime = eventDate;

    // startTime이 있으면 날짜와 시간을 합치기
    if (!event.isAllDay && event.startTime) {
      const [hours, minutes] = event.startTime.split(':');
      startDateTime = new Date(eventDate);
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    // endTime이 있으면 날짜와 시간을 합치기
    if (!event.isAllDay && event.endTime) {
      const [hours, minutes] = event.endTime.split(':');
      endDateTime = event.endDate ? new Date(event.endDate) : new Date(eventDate);
      endDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else if (event.endDate) {
      endDateTime = new Date(event.endDate);
    } else {
      // 기본적으로 1시간 후로 설정
      endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
    }

    const request = {
      title: event.title || '새 일정',
      description: event.description || '',
      startDate: this.formatDateTimeForBackend(startDateTime),
      endDate: this.formatDateTimeForBackend(endDateTime),
      isAllDay: Boolean(event.isAllDay),
      category: this.mapCategoryToBackend(event.category || 'general'),
      type: event.groupId ? 'GROUP' : 'PERSONAL',
      repeatType: this.mapRepeatType(event.repeat),
      repeatEndDate: event.repeatEndDate ? this.formatDateTimeForBackend(new Date(event.repeatEndDate)) : undefined,
      groupId: event.groupId,
    };

    console.log('[CalendarApi] Converted event to request:', request);
    return request;
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 날짜에서 시간을 안전하게 추출 (로컬 시간대 기준)
   */
  private extractTimeFromDate(date: Date): string {
    // 백엔드에서 LocalDateTime으로 오는 데이터를 로컬 시간으로 처리
    // 예: "2025-06-23T09:00:00" → "09:00"
    
    if (date instanceof Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Date가 아닌 경우 (문자열 등) ISO 문자열에서 추출
    const dateStr = date.toString();
    const timeMatch = dateStr.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '00:00';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 백엔드 응답을 Event로 안전하게 변환
   */
  private calendarToEvent(calendar: any): Event {
    console.log('[CalendarApi] Converting calendar to event:', calendar);

    // 안전한 필드 접근
    const safeId = calendar?.calendarId?.toString() || `temp-${Date.now()}`;
    const safeTitle = calendar?.title || '제목 없음';
    const safeStartDate = calendar?.startDate ? new Date(calendar.startDate) : new Date();
    const safeCategory = this.mapCategoryFromBackend(calendar?.category) || 'general';
    const safeUserId = calendar?.userId || 'unknown';

    // startDate에서 시간 추출 (시간대 보정)
    const startTime = calendar?.isAllDay ? '' : this.extractTimeFromDate(safeStartDate);
    const endTime = calendar?.isAllDay ? '' : (
      calendar?.endDate 
        ? this.extractTimeFromDate(new Date(calendar.endDate))
        : this.extractTimeFromDate(new Date(safeStartDate.getTime() + 60 * 60 * 1000))
    );

    const event = {
      id: safeId,
      title: safeTitle,
      description: calendar?.description || '',
      date: safeStartDate,
      endDate: calendar?.endDate ? new Date(calendar.endDate) : undefined,
      startTime: startTime,
      endTime: endTime,
      isAllDay: Boolean(calendar?.isAllDay),
      category: safeCategory,
      repeat: this.mapRepeatTypeFromBackend(calendar?.repeatType),
      repeatEndDate: calendar?.repeatEndDate ? new Date(calendar.repeatEndDate) : undefined,
      userId: safeUserId,
      groupId: calendar?.groupId,
      color: this.getCategoryColor(safeCategory),
    };

    console.log('[CalendarApi] Converted to event:', event);
    return event;
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 날짜에서 시간을 안전하게 추출 (로컬 시간대 기준)
   */
  private extractTimeFromDate(date: Date): string {
    // 백엔드에서 LocalDateTime으로 오는 데이터를 로컬 시간으로 처리
    // 예: "2025-06-23T09:00:00" → "09:00"
    
    if (date instanceof Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Date가 아닌 경우 (문자열 등) ISO 문자열에서 추출
    const dateStr = date.toString();
    const timeMatch = dateStr.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '00:00';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 프론트엔드 카테고리를 백엔드 Enum으로 변환
   */
  private mapCategoryToBackend(category: string): string {
    const categoryMap: Record<string, string> = {
      'general': 'GENERAL',
      'bill': 'PAYMENT',
      'cleaning': 'HOUSEHOLD',
      'meeting': 'MEETING',
      'appointment': 'APPOINTMENT',
      'health': 'HEALTH',
      'shopping': 'SHOPPING',
      'travel': 'TRAVEL',
    };
    return categoryMap[category] || 'general';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 날짜에서 시간을 안전하게 추출 (로컬 시간대 기준)
   */
  private extractTimeFromDate(date: Date): string {
    // 백엔드에서 LocalDateTime으로 오는 데이터를 로컬 시간으로 처리
    // 예: "2025-06-23T09:00:00" → "09:00"
    
    if (date instanceof Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Date가 아닌 경우 (문자열 등) ISO 문자열에서 추출
    const dateStr = date.toString();
    const timeMatch = dateStr.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '00:00';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 백엔드 Enum을 프론트엔드 카테고리로 변환
   */
  private mapCategoryFromBackend(category?: string): string {
    
    const categoryMap: Record<string, string> = {
      'GENERAL': 'general',
      'MEETING': 'meeting',
      'PAYMENT': 'bill',
      'HOUSEHOLD': 'cleaning',
      'APPOINTMENT': 'appointment',
      'HEALTH': 'health',
      'SHOPPING': 'shopping',
      'TRAVEL': 'travel',
    };
    if (!category) return 'general';
    return categoryMap[category.toUpperCase()] || 'general';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 날짜에서 시간을 안전하게 추출 (로컬 시간대 기준)
   */
  private extractTimeFromDate(date: Date): string {
    // 백엔드에서 LocalDateTime으로 오는 데이터를 로컬 시간으로 처리
    // 예: "2025-06-23T09:00:00" → "09:00"
    
    if (date instanceof Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Date가 아닌 경우 (문자열 등) ISO 문자열에서 추출
    const dateStr = date.toString();
    const timeMatch = dateStr.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '00:00';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 프론트엔드 repeat 타입을 백엔드 repeatType으로 변환
   */
  private mapRepeatType(repeat?: string): string {
    switch (repeat) {
      case 'daily': return 'DAILY';
      case 'weekly': return 'WEEKLY';
      case 'monthly': return 'MONTHLY';
      case 'yearly': return 'YEARLY';
      default: return 'NONE';
    }
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 날짜에서 시간을 안전하게 추출 (로컬 시간대 기준)
   */
  private extractTimeFromDate(date: Date): string {
    // 백엔드에서 LocalDateTime으로 오는 데이터를 로컬 시간으로 처리
    // 예: "2025-06-23T09:00:00" → "09:00"
    
    if (date instanceof Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Date가 아닌 경우 (문자열 등) ISO 문자열에서 추출
    const dateStr = date.toString();
    const timeMatch = dateStr.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '00:00';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 백엔드 repeatType을 프론트엔드 repeat로 변환
   */
  private mapRepeatTypeFromBackend(repeatType?: string): 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' {
    if (!repeatType) return 'none';
    
    switch (repeatType.toUpperCase()) {
      case 'DAILY': return 'daily';
      case 'WEEKLY': return 'weekly';
      case 'MONTHLY': return 'monthly';
      case 'YEARLY': return 'yearly';
      default: return 'none';
    }
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 날짜에서 시간을 안전하게 추출 (로컬 시간대 기준)
   */
  private extractTimeFromDate(date: Date): string {
    // 백엔드에서 LocalDateTime으로 오는 데이터를 로컬 시간으로 처리
    // 예: "2025-06-23T09:00:00" → "09:00"
    
    if (date instanceof Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Date가 아닌 경우 (문자열 등) ISO 문자열에서 추출
    const dateStr = date.toString();
    const timeMatch = dateStr.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '00:00';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 카테고리에 따른 색상 반환
   */
  private getCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      bill: 'bg-red-100 text-red-800',
      cleaning: 'bg-green-100 text-green-800',
      meeting: 'bg-blue-100 text-blue-800',
      appointment: 'bg-purple-100 text-purple-800',
      health: 'bg-pink-100 text-pink-800',
      shopping: 'bg-yellow-100 text-yellow-800',
      travel: 'bg-indigo-100 text-indigo-800',
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 날짜에서 시간을 안전하게 추출 (로컬 시간대 기준)
   */
  private extractTimeFromDate(date: Date): string {
    // 백엔드에서 LocalDateTime으로 오는 데이터를 로컬 시간으로 처리
    // 예: "2025-06-23T09:00:00" → "09:00"
    
    if (date instanceof Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Date가 아닌 경우 (문자열 등) ISO 문자열에서 추출
    const dateStr = date.toString();
    const timeMatch = dateStr.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '00:00';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 안전한 배열 처리 함수
   */
  private ensureArray<T>(data: any): T[] {
    console.log('[CalendarApi] Processing data for array conversion:', data);

    if (Array.isArray(data)) {
      console.log('[CalendarApi] Data is already an array:', data.length, 'items');
      return data;
    }

    if (data && typeof data === 'object') {
      // 백엔드에서 페이징된 응답을 보내는 경우
      if (data.content && Array.isArray(data.content)) {
        console.log('[CalendarApi] Found paginated response with content array');
        return data.content;
      }

      // 백엔드에서 data 필드에 배열을 감싸서 보내는 경우
      if (data.data && Array.isArray(data.data)) {
        console.log('[CalendarApi] Found wrapped data array');
        return data.data;
      }

      // 단일 객체인 경우 배열로 감싸기
      console.log('[CalendarApi] Converting single object to array');
      return [data];
    }

    // null, undefined, 기타 값인 경우 빈 배열 반환
    console.log('[CalendarApi] Data is null/undefined, returning empty array');
    return [];
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 날짜에서 시간을 안전하게 추출 (로컬 시간대 기준)
   */
  private extractTimeFromDate(date: Date): string {
    // 백엔드에서 LocalDateTime으로 오는 데이터를 로컬 시간으로 처리
    // 예: "2025-06-23T09:00:00" → "09:00"
    
    if (date instanceof Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Date가 아닌 경우 (문자열 등) ISO 문자열에서 추출
    const dateStr = date.toString();
    const timeMatch = dateStr.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '00:00';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 내 일정 목록 조회
   */
  async getMyCalendars(query: CalendarsQuery = {}): Promise<ApiResponse<Event[]>> {
    const searchParams = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        let stringValue = String(value);
        
        // dateTime 파라미터의 경우 LocalDateTime 호환 형식으로 변환
        if (key === 'dateTime' && typeof value === 'string') {
          // ISO 문자열에서 Z 제거하고 밀리초 제거
          stringValue = value.replace('Z', '').split('.')[0];
        }
        
        searchParams.append(key, stringValue);
      }
    });

    const endpoint = `/api/v1/calendars/me${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    console.log('[CalendarApi] Calling:', endpoint);

    try {
      const response = await apiClient.get<any>(endpoint);

      console.log('[CalendarApi] Raw response:', response);

      if (response.success && response.data !== undefined) {
        // 안전한 배열 처리
        const dataArray = this.ensureArray<CalendarResponseDTO>(response.data);
        console.log('[CalendarApi] Processed data array:', dataArray);

        const events = dataArray.map(calendar => this.calendarToEvent(calendar));
        console.log('[CalendarApi] Converted events:', events);

        return {
          success: true,
          data: events,
          message: response.message
        };
      }

      // 실패한 경우 빈 배열 반환
      return {
        success: false,
        data: [],
        error: response.error || 'Unknown error'
      };
    } catch (error) {
      console.error('[CalendarApi] Exception in getMyCalendars:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 날짜에서 시간을 안전하게 추출 (로컬 시간대 기준)
   */
  private extractTimeFromDate(date: Date): string {
    // 백엔드에서 LocalDateTime으로 오는 데이터를 로컬 시간으로 처리
    // 예: "2025-06-23T09:00:00" → "09:00"
    
    if (date instanceof Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Date가 아닌 경우 (문자열 등) ISO 문자열에서 추출
    const dateStr = date.toString();
    const timeMatch = dateStr.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '00:00';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 특정 일정 조회
   */
  async getCalendar(calendarId: string): Promise<ApiResponse<Event>> {
    try {
      const response = await apiClient.get<any>(`/api/v1/calendars/${calendarId}`);

      console.log('[CalendarApi] Get calendar response:', response);

      if (response.success && response.data) {
        const event = this.calendarToEvent(response.data);
        return { ...response, data: event };
      }

      return response as ApiResponse<Event>;
    } catch (error) {
      console.error('[CalendarApi] Exception in getCalendar:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 날짜에서 시간을 안전하게 추출 (로컬 시간대 기준)
   */
  private extractTimeFromDate(date: Date): string {
    // 백엔드에서 LocalDateTime으로 오는 데이터를 로컬 시간으로 처리
    // 예: "2025-06-23T09:00:00" → "09:00"
    
    if (date instanceof Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Date가 아닌 경우 (문자열 등) ISO 문자열에서 추출
    const dateStr = date.toString();
    const timeMatch = dateStr.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '00:00';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 일정 생성
   */
  async createCalendar(eventData: Partial<Event>): Promise<ApiResponse<Event>> {
    try {
      const requestData = this.eventToCalendarRequest(eventData);
      console.log('[CalendarApi] Creating calendar with data:', requestData);

      const response = await apiClient.post<any>('/api/v1/calendars', requestData);
      console.log('[CalendarApi] Create calendar raw response:', response);

      if (response.success && response.data) {
        // 응답 데이터 유효성 검사
        if (!response.data.calendarId) {
          console.warn('[CalendarApi] Response data missing calendarId field:', response.data);
          // 임시 ID 할당
          response.data.calendarId = Date.now();
        }

        const event = this.calendarToEvent(response.data);
        console.log('[CalendarApi] Converted created event:', event);

        return {
          success: true,
          data: event,
          message: response.message
        };
      }

      return response as ApiResponse<Event>;
    } catch (error) {
      console.error('[CalendarApi] Exception in createCalendar:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 날짜에서 시간을 안전하게 추출 (로컬 시간대 기준)
   */
  private extractTimeFromDate(date: Date): string {
    // 백엔드에서 LocalDateTime으로 오는 데이터를 로컬 시간으로 처리
    // 예: "2025-06-23T09:00:00" → "09:00"
    
    if (date instanceof Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Date가 아닌 경우 (문자열 등) ISO 문자열에서 추출
    const dateStr = date.toString();
    const timeMatch = dateStr.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '00:00';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 일정 수정
   */
  async updateCalendar(calendarId: string, eventData: Partial<Event>): Promise<ApiResponse<Event>> {
    try {
      const requestData = this.eventToCalendarRequest(eventData);
      console.log('[CalendarApi] Updating calendar with data:', requestData);

      const response = await apiClient.patch<any>(`/api/v1/calendars/${calendarId}`, requestData);

      if (response.success && response.data) {
        const event = this.calendarToEvent(response.data);
        return { ...response, data: event };
      }

      return response as ApiResponse<Event>;
    } catch (error) {
      console.error('[CalendarApi] Exception in updateCalendar:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 날짜에서 시간을 안전하게 추출 (로컬 시간대 기준)
   */
  private extractTimeFromDate(date: Date): string {
    // 백엔드에서 LocalDateTime으로 오는 데이터를 로컬 시간으로 처리
    // 예: "2025-06-23T09:00:00" → "09:00"
    
    if (date instanceof Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Date가 아닌 경우 (문자열 등) ISO 문자열에서 추출
    const dateStr = date.toString();
    const timeMatch = dateStr.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '00:00';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 일정 삭제
   */
  async deleteCalendar(
      calendarId: string,
      deleteType?: 'single' | 'future' | 'all',
      instanceDate?: string
  ): Promise<ApiResponse<void>> {
    try {
      const params = new URLSearchParams();

      if (deleteType) {
        params.append('deleteType', deleteType);
      }
      if (instanceDate) {
        params.append('instanceDate', instanceDate);
      }

      const endpoint = `/api/v1/calendars/${calendarId}${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('[CalendarApi] Deleting calendar:', endpoint);

      return await apiClient.delete<void>(endpoint);
    } catch (error) {
      console.error('[CalendarApi] Exception in deleteCalendar:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 날짜에서 시간을 안전하게 추출 (로컬 시간대 기준)
   */
  private extractTimeFromDate(date: Date): string {
    // 백엔드에서 LocalDateTime으로 오는 데이터를 로컬 시간으로 처리
    // 예: "2025-06-23T09:00:00" → "09:00"
    
    if (date instanceof Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Date가 아닌 경우 (문자열 등) ISO 문자열에서 추출
    const dateStr = date.toString();
    const timeMatch = dateStr.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '00:00';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 그룹 일정 목록 조회
   */
  async getGroupCalendars(groupId: string, query: CalendarsQuery = {}): Promise<ApiResponse<Event[]>> {
    const searchParams = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        let stringValue = String(value);
        
        // dateTime 파라미터의 경우 LocalDateTime 호환 형식으로 변환
        if (key === 'dateTime' && typeof value === 'string') {
          // ISO 문자열에서 Z 제거하고 밀리초 제거
          stringValue = value.replace('Z', '').split('.')[0];
        }
        
        searchParams.append(key, stringValue);
      }
    });

    const endpoint = `/api/v1/calendars/groups/${groupId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    try {
      const response = await apiClient.get<any>(endpoint);

      if (response.success && response.data !== undefined) {
        const dataArray = this.ensureArray<CalendarResponseDTO>(response.data);
        const events = dataArray.map(calendar => this.calendarToEvent(calendar));
        return {
          success: true,
          data: events,
          message: response.message
        };
      }

      return {
        success: false,
        data: [],
        error: response.error || 'Unknown error'
      };
    } catch (error) {
      console.error('[CalendarApi] Exception in getGroupCalendars:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 날짜에서 시간을 안전하게 추출 (로컬 시간대 기준)
   */
  private extractTimeFromDate(date: Date): string {
    // 백엔드에서 LocalDateTime으로 오는 데이터를 로컬 시간으로 처리
    // 예: "2025-06-23T09:00:00" → "09:00"
    
    if (date instanceof Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Date가 아닌 경우 (문자열 등) ISO 문자열에서 추출
    const dateStr = date.toString();
    const timeMatch = dateStr.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '00:00';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 월간 일정 조회 (편의 메서드)
   */
  async getMonthlyCalendars(year: number, month: number, groupId?: string): Promise<ApiResponse<Event[]>> {
    const startOfMonth = new Date(year, month - 1, 1);
    const query: CalendarsQuery = {
      viewType: 'MONTHLY',
      dateTime: startOfMonth.toISOString(),
    };

    if (groupId) {
      return this.getGroupCalendars(groupId, query);
    } else {
      return this.getMyCalendars(query);
    }
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 날짜에서 시간을 안전하게 추출 (로컬 시간대 기준)
   */
  private extractTimeFromDate(date: Date): string {
    // 백엔드에서 LocalDateTime으로 오는 데이터를 로컬 시간으로 처리
    // 예: "2025-06-23T09:00:00" → "09:00"
    
    if (date instanceof Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Date가 아닌 경우 (문자열 등) ISO 문자열에서 추출
    const dateStr = date.toString();
    const timeMatch = dateStr.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '00:00';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 주간 일정 조회 (편의 메서드)
   */
  async getWeeklyCalendars(date: Date, groupId?: string): Promise<ApiResponse<Event[]>> {
    const query: CalendarsQuery = {
      viewType: 'WEEKLY',
      dateTime: date.toISOString(),
    };

    if (groupId) {
      return this.getGroupCalendars(groupId, query);
    } else {
      return this.getMyCalendars(query);
    }
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 날짜에서 시간을 안전하게 추출 (로컬 시간대 기준)
   */
  private extractTimeFromDate(date: Date): string {
    // 백엔드에서 LocalDateTime으로 오는 데이터를 로컬 시간으로 처리
    // 예: "2025-06-23T09:00:00" → "09:00"
    
    if (date instanceof Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Date가 아닌 경우 (문자열 등) ISO 문자열에서 추출
    const dateStr = date.toString();
    const timeMatch = dateStr.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '00:00';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 일간 일정 조회 (편의 메서드)
   */
  async getDailyCalendars(date: Date, groupId?: string): Promise<ApiResponse<Event[]>> {
    const query: CalendarsQuery = {
      viewType: 'DAILY',
      dateTime: date.toISOString(),
    };

    if (groupId) {
      return this.getGroupCalendars(groupId, query);
    } else {
      return this.getMyCalendars(query);
    }
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 날짜에서 시간을 안전하게 추출 (로컬 시간대 기준)
   */
  private extractTimeFromDate(date: Date): string {
    // 백엔드에서 LocalDateTime으로 오는 데이터를 로컬 시간으로 처리
    // 예: "2025-06-23T09:00:00" → "09:00"
    
    if (date instanceof Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Date가 아닌 경우 (문자열 등) ISO 문자열에서 추출
    const dateStr = date.toString();
    const timeMatch = dateStr.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '00:00';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 특정 날짜의 일정 조회
   */
  async getCalendarsByDate(date: Date, groupId?: string): Promise<ApiResponse<Event[]>> {
    return this.getDailyCalendars(date, groupId);
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * 날짜에서 시간을 안전하게 추출 (로컬 시간대 기준)
   */
  private extractTimeFromDate(date: Date): string {
    // 백엔드에서 LocalDateTime으로 오는 데이터를 로컬 시간으로 처리
    // 예: "2025-06-23T09:00:00" → "09:00"
    
    if (date instanceof Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Date가 아닌 경우 (문자열 등) ISO 문자열에서 추출
    const dateStr = date.toString();
    const timeMatch = dateStr.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '00:00';
  }

  /**
   * Date를 백엔드 LocalDateTime 형식으로 변환
   */
  private formatDateTimeForBackend(date: Date): string {
    // 로컬 시간을 YYYY-MM-DDTHH:mm:ss 형식으로 변환 (시간대 정보 없이)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * API 상태 확인 (디버깅용)
   */
  async healthCheck(): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get('/api/health');
    } catch (error) {
      console.error('[CalendarApi] Health check failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed'
      };
    }
  }
}

// 싱글톤 인스턴스 생성
export const calendarApi = new CalendarApi();