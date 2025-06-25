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
        const response = await apiClient.get(`/api/v1/users//nickname/check?nickname=${nickname}`);
        return response.data;
    },
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log('API 오류 발생: ', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
)
