import axios from 'axios';
import {useAuthStore} from "../store/authStore.ts";

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

// 임시로 interceptor 비활성화 - 무한호출 방지
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log('API 오류 발생: ', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
)
