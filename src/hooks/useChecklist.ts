import { useState, useEffect } from 'react';
import { ChecklistService } from '../api/checklist';
import { ChecklistResponseDTO } from '../types/checklist';
import { useAppStore } from '../store/appStore';
import toast from 'react-hot-toast';

/**
 * 체크리스트 관련 커스텀 훅
 * 개인/그룹 모드에 따라 적절한 API를 호출합니다.
 */
export const useChecklist = () => {
  const { mode, currentGroup } = useAppStore();
  const [checklists, setChecklists] = useState<ChecklistResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 체크리스트 목록 조회
   */
  const fetchChecklists = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: ChecklistResponseDTO[];

      if (mode === 'personal') {
        // 개인 체크리스트 조회
        data = await ChecklistService.getPersonalChecklists();
        console.log('개인 체크리스트 조회 결과:', data);
      } else if (mode === 'group' && currentGroup) {
        // 그룹 체크리스트 조회
        data = await ChecklistService.getGroupChecklists(currentGroup.id);
        console.log('그룹 체크리스트 조회 결과:', data);
        console.log('현재 그룹 정보:', currentGroup);
        
        // 각 체크리스트의 담당자 정보 로깅
        data.forEach((checklist, index) => {
          console.log(`체크리스트 ${index + 1}:`, {
            id: checklist.checklistId,
            title: checklist.title,
            assignee: checklist.assignee,
            type: checklist.type
          });
        });
      } else {
        // 그룹 모드인데 currentGroup이 없는 경우
        setChecklists([]);
        return;
      }

      setChecklists(data);
    } catch (err: any) {
      const errorMessage = err.message || '체크리스트를 불러오는데 실패했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('체크리스트 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 체크리스트 완료/완료취소 토글
   */
  const toggleChecklist = async (checklistId: number, isCompleted: boolean) => {
    try {
      let updatedChecklist: ChecklistResponseDTO;

      if (isCompleted) {
        // 완료 취소
        updatedChecklist = await ChecklistService.undoChecklist(checklistId);
        toast.success('체크리스트 완료를 취소했습니다');
      } else {
        // 완료 처리
        updatedChecklist = await ChecklistService.completeChecklist(checklistId);
        toast.success('체크리스트를 완료했습니다!');
      }

      // 로컬 상태 업데이트
      setChecklists(prev => 
        prev.map(item => 
          item.checklistId === checklistId ? updatedChecklist : item
        )
      );

    } catch (err: any) {
      const errorMessage = err.message || '체크리스트 상태 변경에 실패했습니다.';
      toast.error(errorMessage);
      console.error('체크리스트 토글 오류:', err);
    }
  };

  /**
   * 체크리스트 삭제
   */
  const deleteChecklist = async (checklistId: number) => {
    try {
      await ChecklistService.deleteChecklist(checklistId);
      
      // 로컬 상태에서 제거
      setChecklists(prev => prev.filter(item => item.checklistId !== checklistId));
      
      toast.success('체크리스트가 삭제되었습니다');
    } catch (err: any) {
      const errorMessage = err.message || '체크리스트 삭제에 실패했습니다.';
      toast.error(errorMessage);
      console.error('체크리스트 삭제 오류:', err);
    }
  };

  /**
   * 모드나 그룹이 변경될 때 체크리스트 다시 로드
   */
  useEffect(() => {
    fetchChecklists();
  }, [mode, currentGroup?.id]);

  return {
    checklists,
    loading,
    error,
    fetchChecklists,
    toggleChecklist,
    deleteChecklist,
  };
};
