import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // 쿠키로 JWT 토큰 받으려면 필수
    headers: {
        'Content-Type': 'application/json',
    },
});

// 401 에러 처리 상태
let isHandling401 = false;
let authErrorShown = false;

// 401 에러시 처리
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._isRetry) {
            // 이미 401 처리 중이면 중복 처리 방지
            if (isHandling401) {
                return Promise.reject(error);
            }

            isHandling401 = true;
            originalRequest._isRetry = true;

            try {
                // 한번만 refresh 시도
                await apiClient.post('/api/v1/auth/refresh');
                isHandling401 = false;
                // 성공하면 원래 요청 재시도
                return apiClient(originalRequest);
            } catch (refreshError) {
                isHandling401 = false;
                
                // 한번만 알림 표시
                if (!authErrorShown) {
                    authErrorShown = true;
                    
                    // 토스트 알림 표시
                    toast.error('로그인이 필요합니다. 다시 로그인해주세요.', {
                        duration: 3000,
                        id: 'auth-error' // 중복 방지
                    });

                    // 인증 상태 초기화
                    localStorage.removeItem('auth-storage');
                    localStorage.removeItem('app-storage-v4');
                    
                    // 3초 후 로그인 페이지로 이동
                    setTimeout(() => {
                        authErrorShown = false;
                        window.location.href = '/login';
                    }, 3000);
                }
                
                return Promise.reject(error);
            }
        }
        
        return Promise.reject(error);
    }
)


