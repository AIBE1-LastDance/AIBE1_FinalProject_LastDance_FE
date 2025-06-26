import {apiClient} from '../utils/api';

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
