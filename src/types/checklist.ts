// 체크리스트 관련 타입 정의

export interface ChecklistRequestDTO {
  title: string;                // 체크리스트 제목 (필수)
  description?: string;         // 체크리스트 설명 (선택)
  assigneeId?: string;          // 담당자 UUID (선택, 그룹의 경우만)
  dueDate?: string;            // 마감일 (ISO 8601 형식: "2025-06-28T07:38:22.036Z")
  priority: "HIGH" | "MEDIUM" | "LOW";  // 우선순위 (필수)
}

export interface GroupMemberDTO {
  userId: string;              // 사용자 UUID
  nickname: string;            // 닉네임
  profileImagePath?: string;   // 프로필 이미지 경로
  role: "OWNER" | "MEMBER";   // 그룹 내 역할
}

export interface ChecklistResponseDTO {
  checklistId: number;         // 체크리스트 ID
  title: string;               // 제목
  description: string;         // 설명
  type: "PERSONAL" | "GROUP";  // 체크리스트 타입
  groupId?: string;            // 그룹 ID (그룹 체크리스트인 경우)
  assignee: GroupMemberDTO;    // 담당자 정보
  isCompleted: boolean;        // 완료 여부
  completedAt?: string;        // 완료 시간 (ISO 8601 형식)
  dueDate?: string;           // 마감일 (ISO 8601 형식)
  priority: string;           // 우선순위
}

export interface ApiResponse<T> {
  success: boolean;           // 성공 여부
  data: T;                   // 응답 데이터
  message: string;           // 응답 메시지
  errorCode?: string;        // 에러 코드 (실패시)
}

export interface ErrorResponse {
  success: false;
  data: null;
  message: string;           // 에러 메시지
  errorCode?: string;        // 에러 코드
}
