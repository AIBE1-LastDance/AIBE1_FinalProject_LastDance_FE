import axios from 'axios';
import {useAuthStore} from '../store/authStore';
import toast from 'react-hot-toast';

const getApiBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;

    // 개발환경: 빈 문자열이면 프록시 사용 (상대경로)
    if (import.meta.env.DEV && !envUrl) {
        return '';  // /api/v1/auth/me 형태로 요청
    }

    // 운영환경: 절대 URL 사용
    return envUrl || 'https://woori-zip.lastdance.store';
};

export const apiClient = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true, // 쿠키로 JWT 토큰 받으려면 필수
    headers: {
        'Content-Type': 'application/json',
    },
});

// 프로필 관련 API
export const profileApi = {
    // 프로필 정보 수정
    updateProfile: async (profileData: {
        nickname?: string;
        monthlyBudget?: number;
    }) => {
        const response = await apiClient.patch('/api/v1/users/me', profileData);
        return response.data;
    },

    // 프로필 이미지 업로드
    uploadAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post('/api/v1/users//me/profile-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // 프로필 이미지 삭제
    deleteAvatar: async () => {
        const response = await apiClient.delete('/api/v1/users/me/profile-image');
        return response.data;
    },

    // 닉네임 중복 확인
    checkNickname: async (nickname: string) => {
        const encodedNickname = encodeURIComponent(nickname);
        const response = await apiClient.get(`/api/v1/users/nickname/check?nickname=${encodedNickname}`);
        return response.data;
    },

    // 계정 삭제 (비활성화)
    deleteAccount: async () => {
        const response = await apiClient.delete('/api/v1/users/me');
        return response.data;
    }
}

// 401 에러 처리 상태
let isHandling401 = false;
let authErrorShown = false;

// 401 에러 처리 함수
const handleUnauthorized = () => {
    console.log('인증 만료 감지, 로그아웃 처리');

    // 한번만 알림 표시
    if (!authErrorShown) {
        authErrorShown = true;

        // 토스트 알림 표시
        toast.error('로그인이 필요합니다. 다시 로그인해주세요.', {
            duration: 1000,
            id: 'auth-error' // 중복 방지
        });

        // 인증 상태 초기화 (로컬 스토리지 초기화)
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('app-storage-v4');
        // 추가적으로 다른 모든 auth 관련 스토리지도 확인하여 제거
        Object.keys(localStorage).forEach(key => {
            if (key.includes('auth') || key.includes('app-storage')) {
                localStorage.removeItem(key);
            }
        });

        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
            authErrorShown = false;
            window.location.href = '/login';
        }, 1000);
    }
};

// 특수 상황 체크 함수
const shouldSkipUnauthorizedHandling = (url: string, method: string) => {
    const { isProcessingAccountDeletion } = useAuthStore.getState();
    const currentPath = window.location.pathname;

    // 인증 관련 페이지
    const isAuthPage = currentPath.includes('/login') ||
        currentPath.includes('/oauth2') ||
        currentPath.includes('/auth/callback');

    // 계정삭제 API
    const isAccountDeletion = url?.includes('/api/v1/users/me') && method === 'delete';

    return isAuthPage || isAccountDeletion || isProcessingAccountDeletion;
};

// Refresh Token 처리 함수
const handleRefreshToken = async (originalRequest: any) => {
    try {
        // 한번만 refresh 시도
        await apiClient.post('/api/v1/auth/refresh');
        isHandling401 = false;
        // 성공하면 원래 요청 재시도
        return apiClient(originalRequest);
    } catch (refreshError) {
        isHandling401 = false;
        // Refresh 실패 시 로그아웃 처리
        handleUnauthorized();
        throw refreshError;
    }
};

// 인터셉터
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const url = error.config?.url;
        const method = error.config?.method;

        console.log('API 오류 발생: ', status, error.response?.data);

        if (status === 401 && !originalRequest._isRetry) {
            // 특수 상황에서는 401 에러를 그대로 반환
            if (shouldSkipUnauthorizedHandling(url, method)) {
                return Promise.reject(error);
            }

            // 이미 401 처리 중이면 중복 처리 방지
            if (isHandling401) {
                return Promise.reject(error);
            }

            isHandling401 = true;
            originalRequest._isRetry = true;

            // Refresh Token 시도
            return handleRefreshToken(originalRequest);
        }

        return Promise.reject(error);
    }

);