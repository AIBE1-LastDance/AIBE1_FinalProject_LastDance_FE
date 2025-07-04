import { apiClient } from '../utils/api';

// Admin API Types
export interface AdminUser {
  userId: string;
  email: string;
  nickname: string;
  role: 'USER' | 'ADMIN';
  provider: string;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface AdminUserDetail extends AdminUser {
  username: string;
  providerId: string;
  userBudget: number;
  profileImageFileId: string | null;
  updatedAt: string;
  inactivedAt: string | null;
  stats: {
    postCount: number;
    commentCount: number;
    groupCount: number;
    reportCount: number;
  };
  recentReports: RecentReport[];
}

export interface RecentReport {
  reportId: number;
  reportType: string;
  reason: string;
  status: string;
  createdAt: string;
}

export interface DashboardUserStats {
  total: number;
  active: number;
  suspended: number;
  newThisWeek: number;
}

export interface DashboardContentStats {
  totalPosts: number;
  totalComments: number;
  todayPosts: number;
  todayComments: number;
}

export interface DashboardStats {
  dashboardUserStats: DashboardUserStats;
  dashboardContentStats: DashboardContentStats;
}

export interface SignupTrend {
  date: string;
  signups: number;
}

export interface ReportManagement {
  reportId: number;
  reporter: {
    userId: string;
    email: string;
    nickname: string;
  };
  reportedUser: {
    userId: string;
    email: string;
    nickname: string;
  };
  reportType: string;
  targetId: string;
  reason: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportDetail extends ReportManagement {
  reporter: {
    userId: string;
    email: string;
    username: string;
    nickname: string;
    provider: string;
    role: string;
    isActive: boolean;
    isBanned: boolean;
    banEndDate: string | null;
    userBudget: number;
    createdAt: string;
    updatedAt: string;
    stats: {
      postCount: number;
      commentCount: number;
      groupCount: number;
      reportCount: number;
    };
  };
  reportedUser: {
    userId: string;
    email: string;
    username: string;
    nickname: string;
    provider: string;
    role: string;
    isActive: boolean;
    isBanned: boolean;
    banEndDate: string | null;
    userBudget: number;
    createdAt: string;
    updatedAt: string;
    stats: {
      postCount: number;
      commentCount: number;
      groupCount: number;
      reportCount: number;
    };
  };
  targetContent: any | null;
  adminNote: string | null;
}

export interface AIJudgment {
  judgmentId: string;
  user: {
    userId: string;
    email: string;
    nickname: string;
  };
  group: any | null;
  requestSummary: string;
  aiResponse: string;
  userRating: 'UP' | 'DOWN' | null;
  judgmentComment: string | null;
  createdAt: string;
}

export interface AIJudgmentDetail extends AIJudgment {
  userInfo: {
    userId: string;
    email: string;
    nickname: string;
  };
  requestContent: string;
  userFeedback: string;
}

export interface AIJudgmentStats {
  totalJudgments: number;
  satisfactionCount: number;
  dissatisfactionCount: number;
  satisfactionRate: number;
  categoryStats: {
    category: string;
    count: number;
    satisfactionRate: number;
  }[];
  trends: {
    date: string;
    judgmentCount: number;
    satisfactionRate: number;
  }[];
}

export interface PaginationResponse<T> {
  [key: string]: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Admin API Service
export class AdminAPI {
  // 관리자 인증 확인
  static async verifyAdmin() {
    const response = await apiClient.get('/api/v1/admin/auth/verify');
    return response.data;
  }

  // 대시보드 통계 조회
  static async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/api/v1/admin/dashboard/stats');
    return response.data.data;
  }

  // 회원 가입 추세 조회
  static async getSignupTrend(period?: 'weekly' | 'monthly'): Promise<SignupTrend[]> {
    const params = period ? { period } : {};
    const response = await apiClient.get('/api/v1/admin/dashboard/signup-trend', { params });
    return response.data.data;
  }

  // 사용자 목록 조회
  static async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    isBanned?: boolean;
    provider?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<PaginationResponse<AdminUser>> {
    const response = await apiClient.get('/api/v1/admin/users', { params });
    return response.data.data;
  }

  // 사용자 상세 조회
  static async getUserDetail(userId: string): Promise<AdminUserDetail> {
    const response = await apiClient.get(`/api/v1/admin/users/${userId}`);
    return response.data.data;
  }

  // 사용자 정지
  static async banUser(userId: string, data: {
    banEndDate: string;
    sendNotification?: boolean;
  }) {
    const response = await apiClient.patch(`/api/v1/admin/users/${userId}/ban`, {
      banEndDate: data.banEndDate,
      sendNotification: data.sendNotification
    });
    return response.data.data;
  }

  // 사용자 정지 해제
  static async unbanUser(userId: string, data: {
    reason: string;
    sendNotification: boolean;
  }) {
    const response = await apiClient.patch(`/api/v1/admin/users/${userId}/unban`, data);
    return response.data.data;
  }

  // 신고 목록 조회
  static async getReports(params: {
    page?: number;
    limit?: number;
    status?: string;
    reportType?: string;
    reporterId?: string;
    reportedUserId?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<PaginationResponse<ReportManagement>> {
    const response = await apiClient.get('/api/v1/admin/reports', { params });
    // 실제 응답이 배열 형태라면 페이지네이션 정보 추가
    if (Array.isArray(response.data)) {
      return {
        reportManagements: response.data,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: response.data.length,
          itemsPerPage: response.data.length,
          hasNext: false,
          hasPrevious: false
        }
      };
    }
    // 기존 구조 유지
    return response.data.data || response.data;
  }

  // 신고 상세 조회
  static async getReportDetail(reportId: number): Promise<ReportDetail> {
    const response = await apiClient.get(`/api/v1/admin/reports/${reportId}`);
    console.log('신고 상세 Raw API Response:', response); // 디버그용
    
    // 응답 데이터 추출 및 처리
    let data = response.data;
    
    // 응답 구조 확인 및 처리
    if (data && data.data) {
      data = data.data;
    }
    
    // 필수 필드 검증 및 기본값 설정
    if (!data || !data.reportId) {
      throw new Error('신고 상세 정보를 찾을 수 없습니다.');
    }
    
    // 안전한 데이터 구조 생성
    const safeReportDetail: ReportDetail = {
      reportId: data.reportId,
      reportType: data.reportType || 'UNKNOWN',
      targetId: data.targetId || null,
      reason: data.reason || '',
      status: data.status || 'PENDING',
      processedAt: data.processedAt || null,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      targetContent: data.targetContent || null, // null이면 UI에서 "불러올 수 없음" 표시
      adminNote: data.adminNote || null,
      reporter: {
        userId: data.reporter?.userId || '',
        email: data.reporter?.email || '',
        username: data.reporter?.username || data.reporter?.nickname || '',
        nickname: data.reporter?.nickname || data.reporter?.username || '',
        provider: data.reporter?.provider || 'UNKNOWN',
        role: data.reporter?.role || 'USER',
        isActive: data.reporter?.isActive ?? true,
        isBanned: data.reporter?.isBanned ?? false,
        banEndDate: data.reporter?.banEndDate || null,
        userBudget: data.reporter?.userBudget || 0,
        createdAt: data.reporter?.createdAt || data.createdAt || new Date().toISOString(),
        updatedAt: data.reporter?.updatedAt || data.updatedAt || new Date().toISOString(),
        stats: {
          postCount: data.reporter?.stats?.postCount || 0,
          commentCount: data.reporter?.stats?.commentCount || 0,
          groupCount: data.reporter?.stats?.groupCount || 0,
          reportCount: data.reporter?.stats?.reportCount || 0
        }
      },
      reportedUser: {
        userId: data.reportedUser?.userId || '',
        email: data.reportedUser?.email || '',
        username: data.reportedUser?.username || data.reportedUser?.nickname || '',
        nickname: data.reportedUser?.nickname || data.reportedUser?.username || '',
        provider: data.reportedUser?.provider || 'UNKNOWN',
        role: data.reportedUser?.role || 'USER',
        isActive: data.reportedUser?.isActive ?? true,
        isBanned: data.reportedUser?.isBanned ?? false,
        banEndDate: data.reportedUser?.banEndDate || null,
        userBudget: data.reportedUser?.userBudget || 0,
        createdAt: data.reportedUser?.createdAt || data.createdAt || new Date().toISOString(),
        updatedAt: data.reportedUser?.updatedAt || data.updatedAt || new Date().toISOString(),
        stats: {
          postCount: data.reportedUser?.stats?.postCount || 0,
          commentCount: data.reportedUser?.stats?.commentCount || 0,
          groupCount: data.reportedUser?.stats?.groupCount || 0,
          reportCount: data.reportedUser?.stats?.reportCount || 0
        }
      }
    };
    
    console.log('신고 상세 Processed Data:', safeReportDetail); // 디버그용
    return safeReportDetail;
  }

  // 신고 처리
  static async processReport(reportId: number, data: {
    status: string;
    banUser?: boolean;
    banEndDate?: string;
    sendNotification: boolean;
  }) {
    const response = await apiClient.patch(`/api/v1/admin/reports/${reportId}/process`, data);
    return response.data.data;
  }

  // AI 판단 목록 조회
  static async getAIJudgments(params: {
    page?: number;
    limit?: number;
    search?: string;
    rating?: string;
    category?: string;
    requestType?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<PaginationResponse<AIJudgment>> {
    const response = await apiClient.get('/api/v1/admin/ai/judgment', { params });
    // 실제 응답이 배열 형태라면 페이지네이션 정보 추가
    if (Array.isArray(response.data)) {
      return {
        aiJudgments: response.data,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: response.data.length,
          itemsPerPage: response.data.length,
          hasNext: false,
          hasPrevious: false
        }
      };
    }
    // 기존 구조 유지
    return response.data.data || response.data;
  }

  // AI 판단 상세 조회
  static async getAIJudgmentDetail(judgmentId: string): Promise<AIJudgment> {
    const response = await apiClient.get(`/api/v1/admin/ai/judgment/${judgmentId}`);
    return response.data.data || response.data;
  }

  // AI 판단 통계 조회
  static async getAIJudgmentStats(period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<AIJudgmentStats> {
    const response = await apiClient.get('/api/v1/admin/ai/judgment/stats', { params: { period } });
    return response.data.data;
  }

  // 댓글 상세 조회 (신고 처리용)
  static async getCommentDetail(commentId: string) {
    try {
      const response = await apiClient.get(`/api/v1/comments/${commentId}`);
      return response.data; // 댓글 API는 data 래핑 없이 직접 반환
    } catch (error) {
      console.error('댓글 상세 조회 실패:', error);
      return null;
    }
  }

  // 게시글 상세 조회 (신고 처리용)  
  static async getPostDetail(postId: string) {
    try {
      const response = await apiClient.get(`/api/v1/community/${postId}`);
      return response.data.data; // 게시글 API는 data로 래핑됨
    } catch (error) {
      console.error('게시글 상세 조회 실패:', error);
      return null;
    }
  }
}
