import { useState, useEffect } from 'react';
import { AdminAPI, DashboardStats, AdminUser, ReportManagement, AIJudgment, SignupTrend, AIJudgmentStats, PaginationResponse } from '../api/admin';
import { useAuthStore } from '../store/authStore';

// 관리자 권한 확인 훅
export const useAdminAuth = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!isAuthenticated) {
        setIsAdmin(false);
        setAdminInfo(null);
        setLoading(false);
        setError('로그인이 필요합니다.');
        return;
      }

      try {
        setLoading(true);
        const response = await AdminAPI.verifyAdmin();
        setIsAdmin(true);
        setAdminInfo(response.data);
        setError(null);
      } catch (err: any) {
        console.error('관리자 권한 확인 실패:', err);
        setIsAdmin(false);
        setAdminInfo(null);
        if (err.response?.status === 403) {
          setError('관리자 권한이 없습니다.');
        } else if (err.response?.status === 404) {
          setError('사용자를 찾을 수 없습니다.');
        } else {
          setError(err.response?.data?.message || '관리자 권한을 확인할 수 없습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [isAuthenticated, user]);

  return { isAdmin, adminInfo, loading, error };
};

// 대시보드 데이터 훅
export const useAdminDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [signupTrend, setSignupTrend] = useState<SignupTrend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const stats = await AdminAPI.getDashboardStats();
      setDashboardStats(stats);
      setError(null);
    } catch (err: any) {
      console.error('대시보드 통계 조회 실패:', err);
      setError(err.response?.data?.message || '대시보드 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSignupTrend = async (period?: 'weekly' | 'monthly') => {
    try {
      const trend = await AdminAPI.getSignupTrend(period);
      setSignupTrend(trend);
    } catch (err: any) {
      console.error('가입 추세 조회 실패:', err);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchSignupTrend('weekly');
  }, []);

  return {
    dashboardStats,
    signupTrend,
    loading,
    error,
    refetch: fetchDashboardStats,
    fetchSignupTrend
  };
};

// 사용자 관리 훅
export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    isBanned?: boolean;
    provider?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) => {
    try {
      setLoading(true);
      console.log('사용자 목록 API 호출 파라미터:', params);
      const response = await AdminAPI.getUsers(params);
      console.log('사용자 목록 API 응답:', response);
      setUsers(response.users);
      setPagination(response.pagination);
      setError(null);
    } catch (err: any) {
      console.error('사용자 목록 조회 실패:', err);
      setError(err.response?.data?.message || '사용자 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const banUser = async (userId: string, data: {
    banEndDate: string;
    sendNotification?: boolean;
  }) => {
    try {
      await AdminAPI.banUser(userId, data);
      // 목록 새로고침
      await fetchUsers();
    } catch (err: any) {
      console.error('사용자 정지 실패:', err);
      throw new Error(err.response?.data?.message || '사용자 정지에 실패했습니다.');
    }
  };

  const unbanUser = async (userId: string, data: {
    reason: string;
    sendNotification: boolean;
  }) => {
    try {
      await AdminAPI.unbanUser(userId, data);
      // 목록 새로고침
      await fetchUsers();
    } catch (err: any) {
      console.error('사용자 정지 해제 실패:', err);
      throw new Error(err.response?.data?.message || '사용자 정지 해제에 실패했습니다.');
    }
  };

  return {
    users,
    pagination,
    loading,
    error,
    fetchUsers,
    banUser,
    unbanUser
  };
};

// 신고 관리 훅
export const useAdminReports = () => {
  const [reports, setReports] = useState<ReportManagement[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async (params: {
    page?: number;
    limit?: number;
    status?: string;
    reportType?: string;
    reason?: string;
    reporterNicknameOrEmail?: string;
    reportedUserNicknameOrEmail?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}) => {
    try {
      setLoading(true);
      console.log('신고 목록 API 호출 파라미터:', params);
      const response = await AdminAPI.getReports(params);
      console.log('신고 목록 API 응답:', response);
      setReports(response.reportManagements || []);
      setPagination(response.pagination);
      setError(null);
    } catch (err: any) {
      console.error('신고 목록 조회 실패:', err);
      setError(err.response?.data?.message || '신고 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const processReport = async (reportId: number, data: {
    status: string;
    banUser?: boolean;
    banEndDate?: string;
    sendNotification: boolean;
  }) => {
    try {
      await AdminAPI.processReport(reportId, data);
      // 목록 새로고침
      await fetchReports();
    } catch (err: any) {
      console.error('신고 처리 실패:', err);
      throw new Error(err.response?.data?.message || '신고 처리에 실패했습니다.');
    }
  };

  return {
    reports,
    pagination,
    loading,
    error,
    fetchReports,
    processReport
  };
};

// AI 판단 관리 훅
export const useAdminAI = () => {
  const [judgments, setJudgments] = useState<AIJudgment[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [stats, setStats] = useState<AIJudgmentStats | null>(null);
  const [overallStats, setOverallStats] = useState<any>(null); // 전체 통계용
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJudgments = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    rating?: string;
    category?: string;
    requestType?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}) => {
    try {
      setLoading(true);
      const response = await AdminAPI.getAIJudgments(params);
      console.log('AI Judgments API Response:', response); // 디버그용
      setJudgments(response.aiJudgments || []);
      setPagination(response.pagination);
      setError(null);
    } catch (err: any) {
      console.error('AI 판단 목록 조회 실패:', err);
      setError(err.response?.data?.message || 'AI 판단 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (period: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
    try {
      const statsData = await AdminAPI.getAIJudgmentStats(period);
      setStats(statsData);
    } catch (err: any) {
      console.error('AI 판단 통계 조회 실패:', err);
      // 기본 통계 설정
      setStats({
        totalJudgments: 0,
        satisfactionCount: 0,
        dissatisfactionCount: 0,
        satisfactionRate: 0,
        categoryStats: [],
        trends: []
      });
    }
  };

  const fetchOverallStats = async () => {
    try {
      // 전체 데이터를 가져와서 통계 계산
      const allJudgmentsResponse = await AdminAPI.getAIJudgments({ 
        page: 1, 
        limit: 10000 // 충분히 큰 수로 전체 데이터 가져오기
      });
      
      const allJudgments = allJudgmentsResponse.aiJudgments || [];
      
      const totalJudgments = allJudgments.length;
      const satisfiedCount = allJudgments.filter(j => j.userRating === 'UP').length;
      const dissatisfiedCount = allJudgments.filter(j => j.userRating === 'DOWN').length;
      
      let satisfactionRate = 0;
      if ((satisfiedCount + dissatisfiedCount) > 0) {
        satisfactionRate = (satisfiedCount / (satisfiedCount + dissatisfiedCount)) * 100;
      }

      setOverallStats({
        totalJudgments,
        satisfactionCount: satisfiedCount,
        dissatisfactionCount: dissatisfiedCount,
        satisfactionRate: Math.round(satisfactionRate * 10) / 10 // 소수점 1자리로 반올림
      });
    } catch (err: any) {
      console.error('전체 AI 판단 통계 조회 실패:', err);
      setOverallStats({
        totalJudgments: 0,
        satisfactionCount: 0,
        dissatisfactionCount: 0,
        satisfactionRate: 0
      });
    }
  };

  return {
    judgments,
    pagination,
    stats,
    overallStats,
    loading,
    error,
    fetchJudgments,
    fetchStats,
    fetchOverallStats
  };
};

// LLM 지출 분석 관리 훅
export const useAdminExpenseAnalyzer = () => {
  const [stats, setStats] = useState<ExpenseAnalyzerFeedbackStats | null>(null);
  const [histories, setHistories] = useState<AdminExpenseAnalyzerHistory[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (period: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
    try {
      const statsData = await AdminAPI.getExpenseAnalyzerFeedbackStats(period);
      
      // Calculate satisfactionRate for each trend item
      const processedTrends = statsData.trends.map(trend => {
        const totalRated = (trend.upCount || 0) + (trend.downCount || 0);
        const satisfactionRate = totalRated > 0 ? ((trend.upCount || 0) / totalRated) * 100 : 0;
        return { ...trend, satisfactionRate: parseFloat(satisfactionRate.toFixed(1)) };
      });

      setStats({ ...statsData, trends: processedTrends });
    } catch (err: any) {
      console.error('LLM 지출 분석 통계 조회 실패:', err);
      setStats(null);
    }
  };

  const fetchHistories = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    rating?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}) => {
    try {
      setLoading(true);
      const response = await AdminAPI.getExpenseAnalyzerHistory(params);
      setHistories(response.histories || []);
      setPagination(response.pagination);
      setError(null);
    } catch (err: any) {
      console.error('LLM 지출 분석 내역 조회 실패:', err);
      setError(err.response?.data?.message || 'LLM 지출 분석 내역을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    histories,
    pagination,
    loading,
    error,
    fetchStats,
    fetchHistories
  };
};
