export interface User {
    id: string;
    username: string;
    nickname: string;
    email: string;
    avatar?: string;
    provider: 'google' | 'kakao' | 'naver';
    role?: 'USER' | 'ADMIN';
    monthlyBudget?: number; // 개인 한 달 예산
}

export interface Group {
    id: string;
    name: string;
    description: string;
    code: string;
    members: User[];
    createdBy: string;
    createdAt: Date;
    maxMembers: number;
    monthlyBudget?: number; // 그룹 한 달 예산
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
    category: 'general' | 'bill' | 'cleaning' | 'meeting' | 'appointment' | 'health' | 'shopping' | 'travel' | 'other';
    color: string;
    groupId?: string;
    groupName?: string; // 그룹 이름 추가
    userId: string;
    repeat?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
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
    priority: 'low' | 'medium' | 'high';
    assignedTo?: string;
    groupId?: string;
    userId: string;
    category: 'personal' | 'group';
    createdAt: Date;
}

export interface Expense {
    id: string;
    title: string;
    amount: number;
    category: 'food' | 'utilities' | 'transport' | 'shopping' | 'entertainment' | 'other';
    date: Date;
    receipt?: string;
    memo?: string;
    groupId?: string;
    userId: string;
    splitType?: 'equal' | 'custom' | 'specific';
    splitData?: { [userId: string]: number };
}

export interface Post {
    id: string;
    title: string;
    content: string;
    category: 'roommate' | 'tip' | 'free' | 'question' | 'policy' | 'recipe' | 'cleaning' | 'shopping';
    author?: User;
    userId: string;
    groupId?: string;
    createdAt: Date;
    updatedAt: Date;
    likes?: number;
    likedBy?: string[];
    bookmarkedBy?: string[];
    comments?: Comment[];
    images?: string[];
    tags?: string[];
}

export interface Comment {
    id: string;
    content: string;
    author?: User;
    userId: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface GameResult {
    id: string;
    gameType: 'roulette' | 'rps' | 'slot' | 'quiz';
    result: any;
    participants: string[];
    winner?: string;
    timestamp: Date;
}

export type AppMode = 'personal' | 'group';

export type ViewType = 'year' | 'month' | 'week' | 'day';