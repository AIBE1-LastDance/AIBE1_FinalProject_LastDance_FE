export interface User {
  id: string;
  username: string;
  nickname: string;
  email: string;
  avatar?: string;
  provider: "google" | "kakao" | "naver";
  role?: "USER" | "ADMIN";
  monthlyBudget?: number; // 개인 한 달 예산
}

export interface Group {
  id: string;
  name: string;
  description: string;
  code: string;
  members: GroupMember[];
  createdBy: string;
  createdAt: Date;
  maxMembers: number;
  monthlyBudget?: number; // 그룹 한 달 예산
}

// Group API를 위한 타입들
export interface GroupMember {
  userId: string;
  nickname: string;
  profileImagePath?: string;
  role: "OWNER" | "MEMBER";
}

export interface GroupResponse {
  groupId: string;
  groupName: string;
  inviteCode: string;
  maxMembers: number;
  groupBudget: number;
  ownerId: string;
  members: GroupMember[];
}

export interface CreateGroupRequest {
  groupName: string;
  maxMembers: number;
  groupBudget: number;
}

export interface UpdateGroupRequest {
  groupName: string; // 필수로 변경
  maxMembers: number; // 필수로 변경
  groupBudget: number; // 필수로 변경
}

export interface JoinGroupRequest {
  inviteCode: string;
}

export interface ApplicationResponse {
  userId: string;
  groupId: string;
  nickname: string;
  email: string;
  profileImagePath?: string;
  updatedAt: string; // ISO 8601 형식
}

export interface AcceptRejectApplicationRequest {
  groupId: string;
  userId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode: string | null;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  category:
    | "general"
    | "bill"
    | "cleaning"
    | "meeting"
    | "appointment"
    | "health"
    | "shopping"
    | "travel"
    | "other";
  color: string;
  groupId?: string;
  groupName?: string; // 그룹 이름 추가
  userId: string;
  repeat?: "none" | "daily" | "weekly" | "monthly" | "yearly";
  repeatEndDate?: Date;
  exceptionDates?: string[] | Date[]; // 반복 일정에서 제외할 날짜들
  originalEventId?: string; // 반복 일정의 원본 이벤트 ID
  isRepeated?: boolean; // 반복 생성된 일정인지 표시
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority: "low" | "medium" | "high";
  assignedTo?: string;
  groupId?: string;
  userId: string;
  category: "personal" | "group";
  createdAt: Date;
}

export interface Expense {
  id: number; // string → number 변경
  title: string;
  amount: number;
  category:
    | "FOOD"
    | "UTILITIES"
    | "TRANSPORT"
    | "SHOPPING"
    | "ENTERTAINMENT"
    | "OTHER"; // 대문자로 변경
  date: string; // Date → string 변경 (YYYY-MM-DD 형식)
  receipt?: string;
  memo?: string;
  groupId?: string;
  userId: string;
  splitType?: "EQUAL" | "CUSTOM" | "SPECIFIC";
  splitData?: { [userId: string]: number };
  // 백엔드 응답에 포함되는 추가 필드들
  expenseType?: "PERSONAL" | "GROUP";
  createdAt?: string;
}

export interface GameResult {
  id: string;
  gameType: "roulette" | "rps" | "slot" | "quiz";
  result: any;
  participants: string[];
  winner?: string;
  timestamp: Date;
}

export type AppMode = "personal" | "group";

export type ViewType = "year" | "month" | "week" | "day";
