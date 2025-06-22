import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // 쿠키로 JWT 토큰 받으려면 필수
    headers: {
        'Content-Type': 'application/json',
    },
});

// 401 에러시 토큰 갱신
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            try {
                await apiClient.post('/api/v1/auth/refresh');
                return apiClient(error.config);
            } catch (refreshError) {
                // 리프레시 토큰 갱신 실패시 로그인 페이지로
                console.error('Refresh token failed:', refreshError);
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
)


