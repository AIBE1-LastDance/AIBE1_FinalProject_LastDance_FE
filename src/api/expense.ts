import { apiClient } from "../utils/api";

export interface ExpenseRequest {
    title: string;
    amount: number;
    category: 'FOOD' | 'UTILITIES' | 'TRANSPORT' | 'SHOPPING' | 'ENTERTAINMENT' | 'OTHER';
    date: string; // YYYY-MM-DD 형식
    memo?: string;
    groupId?: string | null;
    splitType?: 'EQUAL' | 'CUSTOM' | 'SPECIFIC';
    splitData?: Record<string, number>;
}

export interface ExpenseResponse {
    expenseId: number;
    title: string;
    amount: number;
    category: string;
    expenseType: 'PERSONAL' | 'GROUP';
    date: string;
    memo?: string;
    userId: string;
    createdAt: string;
    groupId?: string;
    splitType?: string;
    splitData?: Record<string, number>;
}

export const expenseAPI = {
    // 지출 생성
    create: async (data: ExpenseRequest) => {
        const response = await apiClient.post('/api/v1/expenses', data);
        return response.data;
    },

    // 개인 지출 조회
    getPersonalExpenses: async (params: {
        year: number;
        month: number;
        category?: string;
        search?: string;
    }) => {
        const response = await apiClient.get('/api/v1/expenses/personal', { params });
        return response.data;
    },

    // 그룹 지출 조회
    getGroupExpenses: async (params: {
        year: number;
        month: number;
        category?: string;
        search?: string;
        groupId?: string;
    }) => {
        const response = await apiClient.get('/api/v1/expenses/group', { params });
        return response.data;
    },

    // 특정 그룹의 지출 조회
    getGroupExpensesById: async (groupId: string, params: {
        year: number;
        month: number;
        category?: string;
        search?: string;
    }) => {
      const response = await apiClient.get(`/api/v1/expenses/group/${groupId}`, { params });
      return response.data;
    },

    // 개인의 그룹 분담금 조회
    getGroupShares: async (params: {
        year: number;
        month: number;
    }) => {
        const response = await apiClient.get('/api/v1/expenses/group/shares', { params });
        return response.data;
    },

    // 지출 수정
    update: async (id: number, data: Partial<ExpenseRequest>) => {
        const response = await apiClient.patch(`/api/v1/expenses/${id}`, data);
        return response.data;
    },

    // 지출 삭제
    delete: async (id: number) => {
        const response = await apiClient.delete(`/api/v1/expenses/${id}`);
        return response.data;
    },

}