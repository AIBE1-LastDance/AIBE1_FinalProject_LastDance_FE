// API 클라이언트 설정 (인증 제거 버전)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // 기본 fetch 래퍼
  private async request<T>(
      endpoint: string,
      options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // 기본 헤더 설정
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      console.log(`[API] ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`[API] Response status: ${response.status}`);

      // HTTP 에러 체크
      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('[API] Error response:', errorData);
        } catch (parseError) {
          console.error('[API] Failed to parse error response');
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      // 응답 파싱
      let data;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      console.log('[API] Response data:', data);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('[API] Request Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.',
      };
    }
  }

  // HTTP 메서드들
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // 파일 업로드
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // FormData에서는 Content-Type 헤더를 자동 설정하므로 비워둠
    });
  }

  // API 상태 확인
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.get('/api/health');
  }
}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient(API_BASE_URL);

// 개발 환경에서 디버깅을 위한 전역 객체 노출
if (import.meta.env.DEV) {
  (window as any).apiClient = apiClient;
}