import { 
    GroupResponse, 
    CreateGroupRequest, 
    UpdateGroupRequest, 
    JoinGroupRequest, 
    ApplicationResponse, 
    AcceptRejectApplicationRequest,
    ApiResponse,
    GroupMember
} from '../types';

// 환경별 Base URL 설정
const BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://api.woori-zip.lastdance.store' 
    : 'http://localhost:8080';

const API_PATH = '/api/v1/groups';

// API 호출 헬퍼 함수
async function apiCall<T>(
    endpoint: string, 
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = `${BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include', // 쿠키 자동 전송
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
        throw new Error(result.message || '요청에 실패했습니다.');
    }
    
    return result;
}

// Group API 서비스
export const groupsAPI = {
    // 1. 그룹 생성
    async createGroup(groupData: CreateGroupRequest): Promise<GroupResponse> {
        const result = await apiCall<GroupResponse>(`${API_PATH}`, {
            method: 'POST',
            body: JSON.stringify(groupData)
        });
        return result.data;
    },

    // 2. 내 그룹 목록 조회
    async getMyGroups(): Promise<GroupResponse[]> {
        const result = await apiCall<GroupResponse[]>(`${API_PATH}/me`);
        return result.data;
    },

    // 3. 그룹 상세 조회
    async getGroup(groupId: string): Promise<GroupResponse> {
        const result = await apiCall<GroupResponse>(`${API_PATH}/${groupId}`);
        return result.data;
    },

    // 4. 그룹 정보 수정
    async updateGroup(groupId: string, updates: UpdateGroupRequest): Promise<GroupResponse> {
        console.log('🔍 API 요청 데이터:', updates);
        
        const result = await apiCall<GroupResponse>(`${API_PATH}/${groupId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
        return result.data;
    },

    // 5. 그룹 삭제
    async deleteGroup(groupId: string): Promise<void> {
        await fetch(`${BASE_URL}${API_PATH}/${groupId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
    },

    // 6. 그룹 멤버 목록 조회
    async getGroupMembers(groupId: string): Promise<GroupMember[]> {
        const result = await apiCall<GroupMember[]>(`${API_PATH}/${groupId}/members`);
        return result.data;
    },

    // 7. 그룹 멤버 제거
    async removeGroupMember(groupId: string, userId: string): Promise<void> {
        await fetch(`${BASE_URL}${API_PATH}/${groupId}/members/${userId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
    },

    // 8. 멤버를 그룹 오너로 승격
    async promoteToOwner(groupId: string, userId: string): Promise<void> {
        const result = await apiCall<null>(`${API_PATH}/${groupId}/members/${userId}/promote`, {
            method: 'PATCH'
        });
        return result.data;
    },

    // 9. 그룹 탈퇴
    async leaveGroup(groupId: string): Promise<void> {
        await fetch(`${BASE_URL}${API_PATH}/${groupId}/members/me`, {
            method: 'DELETE',
            credentials: 'include'
        });
    },

    // 10. 그룹 참여 신청
    async applyToGroup(inviteCode: string): Promise<void> {
        const result = await apiCall<null>(`${API_PATH}/applications`, {
            method: 'POST',
            body: JSON.stringify({ inviteCode })
        });
        return result.data;
    },

    // 11. 그룹 참여 신청 목록 조회
    async getGroupApplications(groupId: string): Promise<ApplicationResponse[]> {
        const result = await apiCall<ApplicationResponse[]>(`${API_PATH}/${groupId}/applications`);
        return result.data;
    },

    // 12. 그룹 참여 신청 승인
    async acceptApplication(groupId: string, userId: string): Promise<GroupResponse> {
        const result = await apiCall<GroupResponse>(`${API_PATH}/applications/accept`, {
            method: 'PATCH',
            body: JSON.stringify({ groupId, userId })
        });
        return result.data;
    },

    // 13. 그룹 참여 신청 거부
    async rejectApplication(groupId: string, userId: string): Promise<void> {
        await fetch(`${BASE_URL}${API_PATH}/applications/reject`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ groupId, userId })
        });
    }
};
