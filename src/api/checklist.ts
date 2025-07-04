import { apiClient } from '../utils/api';
import { 
  ChecklistRequestDTO, 
  ChecklistResponseDTO, 
  ApiResponse 
} from '../types/checklist';

/**
 * 체크리스트 API 서비스
 * API 명세서에 따라 개인/그룹 체크리스트를 관리합니다.
 */
export class ChecklistService {
  
  /**
   * 개인 체크리스트 조회
   * GET /api/v1/checklists/me
   */
  static async getPersonalChecklists(): Promise<ChecklistResponseDTO[]> {
    try {
      const response = await apiClient.get<ApiResponse<ChecklistResponseDTO[]>>('/api/v1/checklists/me');
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('개인 체크리스트 조회 실패:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('개인 체크리스트를 불러오는데 실패했습니다.');
    }
  }

  /**
   * 개인 체크리스트 생성
   * POST /api/v1/checklists/me
   */
  static async createPersonalChecklist(data: ChecklistRequestDTO): Promise<ChecklistResponseDTO> {
    try {
      const response = await apiClient.post<ApiResponse<ChecklistResponseDTO>>(
        '/api/v1/checklists/me',
        data
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('개인 체크리스트 생성 실패:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('체크리스트 생성에 실패했습니다.');
    }
  }

  /**
   * 개인 체크리스트 수정
   * PATCH /api/v1/checklists/me/{checklistId}
   */
  static async updatePersonalChecklist(
    checklistId: number, 
    data: ChecklistRequestDTO
  ): Promise<ChecklistResponseDTO> {
    try {
      const response = await apiClient.patch<ApiResponse<ChecklistResponseDTO>>(
        `/api/v1/checklists/me/${checklistId}`,
        data
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('개인 체크리스트 수정 실패:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('체크리스트 수정에 실패했습니다.');
    }
  }

  /**
   * 그룹 체크리스트 조회
   * GET /api/v1/checklists/groups/{groupId}
   */
  static async getGroupChecklists(groupId: string): Promise<ChecklistResponseDTO[]> {
    try {
      const response = await apiClient.get<ApiResponse<ChecklistResponseDTO[]>>(
        `/api/v1/checklists/groups/${groupId}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('그룹 체크리스트 조회 실패:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('그룹 체크리스트를 불러오는데 실패했습니다.');
    }
  }

  /**
   * 그룹 체크리스트 생성
   * POST /api/v1/checklists/groups/{groupId}
   */
  static async createGroupChecklist(
    groupId: string, 
    data: ChecklistRequestDTO
  ): Promise<ChecklistResponseDTO> {
    try {
      const response = await apiClient.post<ApiResponse<ChecklistResponseDTO>>(
        `/api/v1/checklists/groups/${groupId}`,
        data
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('그룹 체크리스트 생성 실패:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('그룹 체크리스트 생성에 실패했습니다.');
    }
  }

  /**
   * 그룹 체크리스트 수정
   * PATCH /api/v1/checklists/groups/{groupId}/{checklistId}
   */
  static async updateGroupChecklist(
    groupId: string,
    checklistId: number, 
    data: ChecklistRequestDTO
  ): Promise<ChecklistResponseDTO> {
    try {
      const response = await apiClient.patch<ApiResponse<ChecklistResponseDTO>>(
        `/api/v1/checklists/groups/${groupId}/${checklistId}`,
        data
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('그룹 체크리스트 수정 실패:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('그룹 체크리스트 수정에 실패했습니다.');
    }
  }

  /**
   * 체크리스트 삭제
   * DELETE /api/v1/checklists/{checklistId}
   */
  static async deleteChecklist(checklistId: number): Promise<void> {
    try {
      const response = await apiClient.delete(`/api/v1/checklists/${checklistId}`);
      
      // 204 No Content는 성공이므로 별도 처리 불필요
      if (response.status === 204) {
        return;
      }
      
      // 다른 응답이 있다면 체크
      if (response.data && !response.data.success) {
        throw new Error(response.data.message);
      }
      
    } catch (error: any) {
      console.error('체크리스트 삭제 실패:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('체크리스트 삭제에 실패했습니다.');
    }
  }

  /**
   * 체크리스트 완료 처리
   * PATCH /api/v1/checklists/{checklistId}/complete
   */
  static async completeChecklist(checklistId: number): Promise<ChecklistResponseDTO> {
    try {
      const response = await apiClient.patch<ApiResponse<ChecklistResponseDTO>>(
        `/api/v1/checklists/${checklistId}/complete`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('체크리스트 완료 처리 실패:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('체크리스트 완료 처리에 실패했습니다.');
    }
  }

  /**
   * 체크리스트 완료 취소
   * PATCH /api/v1/checklists/{checklistId}/undo
   */
  static async undoChecklist(checklistId: number): Promise<ChecklistResponseDTO> {
    try {
      const response = await apiClient.patch<ApiResponse<ChecklistResponseDTO>>(
        `/api/v1/checklists/${checklistId}/undo`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('체크리스트 완료 취소 실패:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('체크리스트 완료 취소에 실패했습니다.');
    }
  }
}
