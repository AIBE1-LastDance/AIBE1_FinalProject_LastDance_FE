import { apiClient } from "../utils/api";

export interface SplitDataItem {
    userId: string;
    amount: number;
}

export interface ExpenseRequest {
    title: string;
    amount: number;
    category: 'FOOD' | 'UTILITIES' | 'TRANSPORT' | 'SHOPPING' | 'ENTERTAINMENT' | 'OTHER';
    date: string; // YYYY-MM-DD 형식
    memo?: string;
    groupId?: string | null;
    splitType?: 'EQUAL' | 'CUSTOM' | 'SPECIFIC';
    splitData?: SplitDataItem[];

}

export interface ExpenseWithReceiptRequest extends ExpenseRequest {
    receipt?: File;
}

export const expenseAPI = {
    // 지출 생성
    create: async (data: ExpenseWithReceiptRequest) => {
        const formData = new FormData();

        // 개인 지출과 그룹 지출에 따른 데이터 구조
        let expenseData;
        let endpoint;

        if (data.groupId) {
            expenseData = {
                title: data.title,
                amount: data.amount,
                category: data.category,
                date: data.date,
                memo: data.memo,
                groupId: data.groupId,
                splitType: data.splitType,
                splitData: data.splitData,
            };
            endpoint = '/api/v1/expenses/group';
        } else {
            expenseData = {
                title: data.title,
                amount: data.amount,
                category: data.category,
                date: data.date,
                memo: data.memo,
            };
            endpoint = '/api/v1/expenses/personal';
        }

        formData.append('expense', new Blob([JSON.stringify(expenseData)], {
            type: 'application/json',
        }))

        // 영수증 파일이 있으면 추가
        if (data.receipt) {
            formData.append('receiptFile', data.receipt);
        }

        const response = await apiClient.post(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
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

    // 그룹 분담금 페이징 조회
    getGroupSharesPaginated: async (groupId: string, params: {
        year: number;
        month: number;
        page?: number;
        size?: number;
        category?: string;
        search?: string;
    }) => {
        const response = await apiClient.get(`/api/v1/expenses/group/${groupId}/shares/paging`, { params });
        return response.data;
    },

    // 통합 지출 조회 (개인 + 그룹 분담금)
    getCombinedExpenses: async (params: {
        year: number;
        month: number;
        page?: number;
        size?: number;
        category?: string;
        search?: string;
    }) => {
        const response = await apiClient.get('/api/v1/expenses/personal/combined', {params});
        return response.data;
    },

    // 그룹 지출 (통계 포함)
    getGroupExpensesWithStats: async (groupId: string, params: {
        year: number;
        month: number;
        page?: number;
        size?: number;
        category?: string;
        search?: string;
    }) => {
        const response = await apiClient.get(`/api/v1/expenses/group/${groupId}/with-stats`, {params});
        return response.data;
    },

    // 지출 수정
    update: async (id: number, data: Partial<ExpenseWithReceiptRequest>) => {
        const formData = new FormData();

        // 수정할 데이터만 포함
        const expenseData: any = {};
        if (data.title !== undefined) expenseData.title = data.title;
        if (data.amount !== undefined) expenseData.amount = data.amount;
        if (data.category !== undefined) expenseData.category = data.category;
        if (data.date !== undefined) expenseData.date = data.date;
        if (data.memo !== undefined) expenseData.memo = data.memo;
        if (data.groupId !== undefined) expenseData.groupId = data.groupId;
        if (data.splitType !== undefined) expenseData.splitType = data.splitType;
        if (data.splitData !== undefined) expenseData.splitData = data.splitData;

        formData.append('expense', new Blob([JSON.stringify(expenseData)], {
            type: 'application/json'
        }));

        if (data.receipt) {
            formData.append('receiptFile', data.receipt);
        }

        const response = await apiClient.patch(`/api/v1/expenses/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // 지출 삭제
    delete: async (id: number) => {
        const response = await apiClient.delete(`/api/v1/expenses/${id}`);
        return response.data;
    },

    // 영수증 URL 조회
    getReceiptUrl: async (id: number) => {
        const response = await apiClient.get(`/api/v1/expenses/${id}/receipt`);
        return response.data;
    },

    // 영수증만 삭제
    deleteReceipt: async (id: number) => {
        const response = await apiClient.delete(`/api/v1/expenses/${id}/receipt`);
        return response.data;
    },

    // 개인 지출 추이 조회
    getPersonalExpensesTrend: async (params: {
        year: number;
        month: number;
        months?: number;
        category?: string;
    }) => {
        const response = await apiClient.get('/api/v1/expenses/personal/trend', { params });
        return response.data;
    },

    // 그룹 지출 추이 조회
    getGroupExpensesTrend: async (groupId: string, params: {
        year: number;
        month: number;
        months?: number;
        category?: string;
    }) => {
        const response = await apiClient.get(`/api/v1/expenses/group/${groupId}/trend`, { params });
        return response.data;
    },

    // AI 지출 분석
    analyze: async (params: {
        startDate: string;
        endDate: string;
    }) => {
        const response = await apiClient.post<AnalyzeExpenseResponse>('/api/v1/expenses/analyze', params);
        return response.data;
    },

    saveAnalysis: async (requestDTO: { startDate: string; endDate: string; }, analysisResponseDTO: AnalyzeExpenseResponse) => {
        const response = await apiClient.post('/api/v1/expenses/analyze/save', {
            requestDTO,
            analysisResponseDTO
        });
        return response.data;
    },

    // 저장된 AI 분석 목록 페이징 조회
    getSavedAnalysesPaginated: async (params: {
        page?: number;
        size?: number;
        sortBy?: string;
        sortDirection?: 'asc' | 'desc';
    }) => {
        const response = await apiClient.get('/api/v1/expenses/analyze/history', { params });
        return response.data;
    }
}

export interface BudgetUsage {
    percentage: number;
    currentSpending: number;
    totalBudget: number;
}

export interface DailySpending {
    averageSoFar: number;
    estimatedEom: number;
}

export interface Suggestion {
    title: string;
    effect: string;
    difficulty: '쉬움' | '보통' | '어려움';
    description: string;
}

export interface AnalysisResult {
    mainFinding: string;
    suggestion: Suggestion;
}

export interface CategoryDetail {
    category: string;
    percentage: number;
    totalAmount: number;
    transactionCount: number;
}

export interface AnalyzeExpenseResponse {
    budgetUsage: BudgetUsage;
    dailySpending: DailySpending;
    analysisResult: AnalysisResult;
    categoryDetails: CategoryDetail[];
}