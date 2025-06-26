import axios from 'axios';

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
        const response = await apiClient.get(`/api/v1/users/nickname/check?nickname=${nickname}`);
        return response.data;
    },

    // 계정 삭제 (비활성화)
    deleteAccount: async () => {
        const response = await apiClient.delete('/api/v1/users/me');
        return response.data;
    }
}

// 401 에러 처리 함수
const handleUnauthorized = () => {
    console.log('인증 만료 감지, 로그아웃 처리');

    // 로컬스토리지 정리
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('app-storage-v4');

    // 추가적으로 다른 모든 auth 관련 스토리지도 확인하여 제거
    Object.keys(localStorage).forEach(key => {
        if (key.includes('auth') || key.includes('app-storage')) {
            localStorage.removeItem(key);
        }
    });

    // 로그인 페이지로 리다이렉트
    window.location.href = '/login?expired=true';
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        console.log('API 오류 발생: ', status, error.response?.data);

        // 401 Unauthorized 에러 처리
        if (status === 401) {
            // 로그인 페이지나 OAuth 콜백 페이지가 아닌 경우에만 로그아웃 처리
            const currentPath = window.location.pathname;
            const isAuthPage = currentPath.includes('/login') ||
                currentPath.includes('/oauth2') ||
                currentPath.includes('/auth/callback');

            if (!isAuthPage) {
                handleUnauthorized();
            }
        }

        return Promise.reject(error);
    }
);