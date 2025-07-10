import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  User, 
  Shield, 
  Ban, 
  Eye,
  AlertTriangle,
  Calendar,
  Mail,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAdminUsers } from '../../../hooks/useAdmin';
import { AdminAPI, AdminUser, AdminUserDetail } from '../../../api/admin';
import { safeNumber, safeString, formatNumber } from '../../../utils/numberUtils';

type UserStatus = 'all' | 'active' | 'banned';
type OAuthProvider = 'all' | 'KAKAO' | 'GOOGLE';

const UserManagement: React.FC = () => {
  const { users, pagination, loading, error, fetchUsers, banUser, unbanUser } = useAdminUsers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus>('all');
  const [providerFilter, setProviderFilter] = useState<OAuthProvider>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showPenaltyModal, setPenaltyModal] = useState(false);
  const [showUnbanModal, setShowUnbanModal] = useState(false);
  const [userToUnban, setUserToUnban] = useState<AdminUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 초기 데이터 로딩
  useEffect(() => {
    const params = {
      page: 1, // 초기 로딩 시 첫 페이지
      limit: 20,
    };
    fetchUsers(params);
  }, []);

  const handleSearch = () => {
    setCurrentPage(1); // 검색할 때는 첫 페이지로 리셋
    const params: any = {
      page: 1, // 검색 시 첫 페이지부터
      limit: 20,
    };

    if (searchTerm) {
      params.search = searchTerm;
    }

    if (statusFilter === 'active') {
      params.isBanned = false;
    } else if (statusFilter === 'banned') {
      params.isBanned = true;
    }

    if (providerFilter !== 'all') {
      params.provider = providerFilter;
    }

    fetchUsers(params);
  };

  const handlePageChange = (page: number) => {
    console.log('페이지 변경 요청:', page, '현재 페이지:', currentPage, '총 페이지:', pagination?.totalPages);
    
    if (page < 1 || (pagination && page > pagination.totalPages)) {
      console.log('유효하지 않은 페이지 번호:', page);
      return; // 유효하지 않은 페이지
    }

    setCurrentPage(page);
    
    const params: any = {
      page,
      limit: 20,
    };

    if (searchTerm) {
      params.search = searchTerm;
    }

    if (statusFilter === 'active') {
      params.isBanned = false;
    } else if (statusFilter === 'banned') {
      params.isBanned = true;
    }

    if (providerFilter !== 'all') {
      params.provider = providerFilter;
    }

    console.log('API 호출 파라미터:', params);
    fetchUsers(params);
  };

  const handleUnbanUser = async (user: AdminUser) => {
    setUserToUnban(user);
    setShowUnbanModal(true);
  };

  const handleUserDetail = async (userId: string) => {
    try {
      const userDetail = await AdminAPI.getUserDetail(userId);
      setSelectedUser(userDetail);
      setShowUserDetail(true);
    } catch (err) {
      console.error('사용자 상세 정보 조회 실패:', err);
    }
  };

  const getStatusBadge = (user: AdminUser) => {
    if (user.isBanned) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">정지</span>;
    } else if (user.isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">활성</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">비활성</span>;
    }
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'KAKAO':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">카카오</span>;
      case 'GOOGLE':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">구글</span>;
      case 'NAVER':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">네이버</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{provider}</span>;
    }
  };

  const UserDetailModal = () => {
    if (!selectedUser) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">사용자 상세 정보</h2>
              <button
                onClick={() => setShowUserDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">기본 정보</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">사용자 ID:</span>
                      <span className="ml-2 text-sm font-medium">{selectedUser.userId}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">이메일:</span>
                      <span className="ml-2 text-sm font-medium">{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">사용자명:</span>
                      <span className="ml-2 text-sm font-medium">{selectedUser.username || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">닉네임:</span>
                      <span className="ml-2 text-sm font-medium">{selectedUser.nickname}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">제공자:</span>
                      <span className="ml-2">{getProviderBadge(selectedUser.provider)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">역할:</span>
                      <span className="ml-2 text-sm font-medium">{selectedUser.role}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">가입일:</span>
                      <span className="ml-2 text-sm font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">상태:</span>
                      <span className="ml-2">{getStatusBadge(selectedUser)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">활동 통계</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">작성한 게시글:</span>
                      <span className="text-sm font-medium">{selectedUser.stats?.postCount || 0}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">작성한 댓글:</span>
                      <span className="text-sm font-medium">{selectedUser.stats?.commentCount || 0}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">참여 그룹:</span>
                      <span className="text-sm font-medium">{selectedUser.stats?.groupCount || 0}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">신고 받은 횟수:</span>
                      <span className="text-sm font-medium text-red-600">{selectedUser.stats?.reportCount || 0}회</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">사용자 예산:</span>
                      <span className="text-sm font-medium">₩{selectedUser.userBudget?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 최근 신고 내역 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">최근 신고 내역</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedUser.recentReports && selectedUser.recentReports.length > 0 ? (
                    <div className="space-y-3">
                      {selectedUser.recentReports.map((report) => (
                        <div key={report.reportId} className="bg-white p-3 rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              신고 #{report.reportId}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              report.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {report.status === 'PENDING' ? '대기중' :
                               report.status === 'RESOLVED' ? '처리완료' : '반려됨'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">유형:</span> {report.reportType}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">사유:</span> {report.reason}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(report.createdAt).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">신고 내역이 없습니다.</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                {!selectedUser.isBanned ? (
                  <button
                    onClick={() => {
                      setShowUserDetail(false);
                      setPenaltyModal(true);
                    }}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    제재하기
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnbanUser(selectedUser)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    제재 해제
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const UnbanModal = () => {
    const [sendNotification, setSendNotification] = useState(true);
    const [unbanLoading, setUnbanLoading] = useState(false);

    const handleUnban = async () => {
      if (!userToUnban) {
        alert('사용자 정보가 없습니다.');
        return;
      }

      try {
        setUnbanLoading(true);

        await unbanUser(userToUnban.userId, {
          reason: '관리자에 의한 제재 해제',
          sendNotification
        });

        alert('사용자 제재가 해제되었습니다.');
        setShowUnbanModal(false);
        setUserToUnban(null);
        setShowUserDetail(false);
      } catch (error: any) {
        console.error('제재 해제 실패:', error);
        alert('제재 해제에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
      } finally {
        setUnbanLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">제재 해제</h2>
              <button
                onClick={() => {
                  setShowUnbanModal(false);
                  setUserToUnban(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      제재 해제 확인
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        <strong>{userToUnban?.nickname}</strong> ({userToUnban?.email}) 사용자의 제재를 해제하시겠습니까?
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendUnbanNotification"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="sendUnbanNotification" className="ml-2 block text-sm text-gray-700">
                  사용자에게 알림 발송
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleUnban}
                disabled={unbanLoading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {unbanLoading ? '처리 중...' : '제재 해제'}
              </button>
              <button
                onClick={() => {
                  setShowUnbanModal(false);
                  setUserToUnban(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const PenaltyModal = () => {
    const [penaltyType, setPenaltyType] = useState('TEMP_BAN');
    const [duration, setDuration] = useState('7');
    const [sendNotification, setSendNotification] = useState(true);
    const [penaltyLoading, setPenaltyLoading] = useState(false);

    const handleBanUser = async () => {
      if (!selectedUser) {
        alert('사용자 정보가 없습니다.');
        return;
      }

      try {
        setPenaltyLoading(true);
        
        let banEndDate: string;
        if (penaltyType === 'PERMANENT_BAN') {
          // 영구 정지는 100년 후로 설정
          const date = new Date();
          date.setFullYear(date.getFullYear() + 100);
          banEndDate = date.toISOString();
        } else {
          // 임시 정지는 지정된 일수만큼
          const date = new Date();
          date.setDate(date.getDate() + parseInt(duration));
          banEndDate = date.toISOString();
        }

        await banUser(selectedUser.userId, {
          banEndDate,
          sendNotification
        });

        alert('사용자가 제재되었습니다.');
        setPenaltyModal(false);
        setSelectedUser(null);
      } catch (error: any) {
        console.error('제재 처리 실패:', error);
        alert('제재 처리에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
      } finally {
        setPenaltyLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">사용자 제재</h2>
              <button
                onClick={() => setPenaltyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제재 유형
                </label>
                <select
                  value={penaltyType}
                  onChange={(e) => setPenaltyType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TEMP_BAN">임시 정지</option>
                  <option value="PERMANENT_BAN">영구 정지</option>
                </select>
              </div>

              {penaltyType === 'TEMP_BAN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    정지 기간 (일)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="365"
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendNotification"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="sendNotification" className="ml-2 block text-sm text-gray-700">
                  사용자에게 알림 발송
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleBanUser}
                disabled={penaltyLoading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {penaltyLoading ? '처리 중...' : '제재 적용'}
              </button>
              <button
                onClick={() => setPenaltyModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
          <p className="text-gray-600 mt-1">사용자 정보 조회 및 관리</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="이메일/닉네임 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatus)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">모든 상태</option>
            <option value="active">활성</option>
            <option value="banned">정지</option>
            <option value="inactive">비활성</option>
          </select>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value as OAuthProvider)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">모든 제공자</option>
            <option value="KAKAO">카카오</option>
            <option value="GOOGLE">구글</option>
          </select>

          <button
            onClick={handleSearch}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            필터 적용
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사용자 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제공자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가입일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  활동
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">로딩 중...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    사용자가 없습니다.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.nickname}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getProviderBadge(user.provider)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-4">
                        <span>역할: {user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUserDetail(user.userId)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          상세보기
                        </button>
                        {!user.isBanned ? (
                          <button
                            onClick={() => {
                              setSelectedUser(user as any);
                              setPenaltyModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 flex items-center ml-3"
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            제재
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUnbanUser(user)}
                            className="text-green-600 hover:text-green-900 flex items-center ml-3"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            해제
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevious}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <button 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  총 <span className="font-medium">{safeString(pagination?.totalItems)}</span>명의 사용자 중{' '}
                  <span className="font-medium">
                    {safeString(pagination ? ((safeNumber(pagination.currentPage, 1) - 1) * safeNumber(pagination.itemsPerPage, 20)) + 1 : 0)}
                  </span>
                  -{' '}
                  <span className="font-medium">
                    {safeString(pagination ? Math.min(safeNumber(pagination.currentPage, 1) * safeNumber(pagination.itemsPerPage, 20), safeNumber(pagination.totalItems)) : 0)}
                  </span>
                  명 표시
                  <span className="text-xs text-gray-500 ml-2">
                    (페이지 {currentPage}/{pagination?.totalPages || 0})
                  </span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button 
                    onClick={() => handlePageChange(safeNumber(pagination?.currentPage, 1) - 1)}
                    disabled={!pagination?.hasPrevious}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, safeNumber(pagination?.totalPages, 1)) }, (_, i) => {
                    const pageNumber = Math.max(1, safeNumber(pagination?.currentPage, 1) - 2) + i;
                    if (pageNumber > safeNumber(pagination?.totalPages, 1)) return null;
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNumber === safeNumber(pagination?.currentPage, 1)
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {safeString(pageNumber)}
                      </button>
                    );
                  })}
                  
                  <button 
                    onClick={() => handlePageChange(safeNumber(pagination?.currentPage, 1) + 1)}
                    disabled={!pagination?.hasNext}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showUserDetail && <UserDetailModal />}
      {showPenaltyModal && <PenaltyModal />}
      {showUnbanModal && <UnbanModal />}
    </div>
  );
};

export default UserManagement;