import React, { useState } from 'react';
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
  UserX
} from 'lucide-react';

// 가상 사용자 데이터
const mockUsers = [
  {
    id: '1',
    email: 'user1@example.com',
    nickname: '김철수',
    provider: 'KAKAO',
    joinDate: '2024-01-15',
    status: 'active',
    lastLogin: '2시간 전',
    postCount: 15,
    commentCount: 32,
    groupCount: 3,
    reportCount: 0
  },
  {
    id: '2',
    email: 'user2@example.com',
    nickname: '이영희',
    provider: 'GOOGLE',
    joinDate: '2024-01-10',
    status: 'suspended',
    lastLogin: '5일 전',
    postCount: 8,
    commentCount: 12,
    groupCount: 1,
    reportCount: 3
  },
  {
    id: '3',
    email: 'user3@example.com',
    nickname: '박민수',
    provider: 'KAKAO',
    joinDate: '2024-01-20',
    status: 'active',
    lastLogin: '1일 전',
    postCount: 23,
    commentCount: 45,
    groupCount: 5,
    reportCount: 1
  },
];

type UserStatus = 'all' | 'active' | 'suspended' | 'inactive';
type OAuthProvider = 'all' | 'KAKAO' | 'GOOGLE';

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus>('all');
  const [providerFilter, setProviderFilter] = useState<OAuthProvider>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showPenaltyModal, setPenaltyModal] = useState(false);

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.nickname.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesProvider = providerFilter === 'all' || user.provider === providerFilter;
    
    return matchesSearch && matchesStatus && matchesProvider;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">활성</span>;
      case 'suspended':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">정지</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">비활성</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">알 수 없음</span>;
    }
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'KAKAO':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">카카오</span>;
      case 'GOOGLE':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">구글</span>;
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
                      <span className="ml-2 text-sm font-medium">{selectedUser.id}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">이메일:</span>
                      <span className="ml-2 text-sm font-medium">{selectedUser.email}</span>
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
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">가입일:</span>
                      <span className="ml-2 text-sm font-medium">{selectedUser.joinDate}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">상태:</span>
                      <span className="ml-2">{getStatusBadge(selectedUser.status)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">마지막 접속:</span>
                      <span className="ml-2 text-sm font-medium">{selectedUser.lastLogin}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">활동 통계</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">작성한 게시글:</span>
                      <span className="text-sm font-medium">{selectedUser.postCount}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">작성한 댓글:</span>
                      <span className="text-sm font-medium">{selectedUser.commentCount}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">참여 그룹:</span>
                      <span className="text-sm font-medium">{selectedUser.groupCount}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">신고 받은 횟수:</span>
                      <span className="text-sm font-medium text-red-600">{selectedUser.reportCount}회</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">제재 이력</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">제재 이력이 없습니다.</p>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t">
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
                <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                  <Shield className="w-4 h-4 mr-2" />
                  권한 변경
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PenaltyModal = () => {
    const [penaltyType, setPenaltyType] = useState('WARNING');
    const [reason, setReason] = useState('');
    const [duration, setDuration] = useState('1');

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
                  <option value="WARNING">경고</option>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제재 사유 *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="제재 사유를 입력하세요..."
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendNotification"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="sendNotification" className="ml-2 block text-sm text-gray-700">
                  사용자에게 알림 발송
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  // 제재 처리 로직
                  setPenaltyModal(false);
                }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                제재 적용
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
            <option value="suspended">정지</option>
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

          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
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
                  마지막 접속
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
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
                    {user.joinDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-4">
                      <span>글 {user.postCount}</span>
                      <span>댓글 {user.commentCount}</span>
                      <span>그룹 {user.groupCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetail(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {user.status === 'active' ? (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setPenaltyModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : (
                        <button className="text-green-600 hover:text-green-900">
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              이전
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              다음
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                총 <span className="font-medium">{filteredUsers.length}</span>명의 사용자
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  이전
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  다음
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showUserDetail && <UserDetailModal />}
      {showPenaltyModal && <PenaltyModal />}
    </div>
  );
};

export default UserManagement;