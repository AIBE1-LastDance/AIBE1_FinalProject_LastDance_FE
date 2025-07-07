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
import { apiClient } from '../utils/api';

const API_PATH = '/api/v1/groups';

// Group API 서비스
export const groupsAPI = {
    // 1. 그룹 생성
    async createGroup(groupData: CreateGroupRequest): Promise<GroupResponse> {
        const response = await apiClient.post<ApiResponse<GroupResponse>>(`${API_PATH}`, groupData);
        return response.data.data;
    },

    // 2. 내 그룹 목록 조회
    async getMyGroups(): Promise<GroupResponse[]> {
        const response = await apiClient.get<ApiResponse<GroupResponse[]>>(`${API_PATH}/me`);
        return response.data.data;
    },

    // 3. 그룹 상세 조회
    async getGroup(groupId: string): Promise<GroupResponse> {
        const response = await apiClient.get<ApiResponse<GroupResponse>>(`${API_PATH}/${groupId}`);
        return response.data.data;
    },

    // 4. 그룹 정보 수정
    async updateGroup(groupId: string, updates: UpdateGroupRequest): Promise<GroupResponse> {
        console.log('🔍 API 요청 데이터:', updates);
        const response = await apiClient.patch<ApiResponse<GroupResponse>>(`${API_PATH}/${groupId}`, updates);
        return response.data.data;
    },

    // 5. 그룹 삭제
    async deleteGroup(groupId: string): Promise<void> {
        await apiClient.delete(`${API_PATH}/${groupId}`);
    },

    // 6. 그룹 멤버 목록 조회
    async getGroupMembers(groupId: string): Promise<GroupMember[]> {
        const response = await apiClient.get<ApiResponse<GroupMember[]>>(`${API_PATH}/${groupId}/members`);
        return response.data.data;
    },

    // 7. 그룹 멤버 제거
    async removeGroupMember(groupId: string, userId: string): Promise<void> {
        await apiClient.delete(`${API_PATH}/${groupId}/members/${userId}`);
    },

    // 8. 멤버를 그룹 오너로 승격
    async promoteToOwner(groupId: string, userId: string): Promise<void> {
        const response = await apiClient.patch<ApiResponse<null>>(`${API_PATH}/${groupId}/members/${userId}/promote`);
        return response.data.data;
    },

    // 9. 그룹 탈퇴
    async leaveGroup(groupId: string): Promise<void> {
        await apiClient.delete(`${API_PATH}/${groupId}/members/me`);
    },

    // 10. 그룹 참여 신청
    async applyToGroup(inviteCode: string): Promise<void> {
        const response = await apiClient.post<ApiResponse<null>>(`${API_PATH}/applications`, { inviteCode });
        return response.data.data;
    },

    // 11. 그룹 참여 신청 목록 조회
    async getGroupApplications(groupId: string): Promise<ApplicationResponse[]> {
        const response = await apiClient.get<ApiResponse<ApplicationResponse[]>>(`${API_PATH}/${groupId}/applications`);
        return response.data.data;
    },

    // 12. 그룹 참여 신청 승인
    async acceptApplication(groupId: string, userId: string): Promise<GroupResponse> {
        const response = await apiClient.patch<ApiResponse<GroupResponse>>(`${API_PATH}/applications/accept`, { groupId, userId });
        return response.data.data;
    },

    // 13. 그룹 참여 신청 거부
    async rejectApplication(groupId: string, userId: string): Promise<void> {
        await apiClient.patch(`${API_PATH}/applications/reject`, { groupId, userId });
    }
};
