import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle
} from 'lucide-react';

// 가상 신고 데이터
const mockReports = [
  {
    id: 1,
    reporter: '신고자A',
    reportedUser: '사용자B',
    type: '게시글',
    reason: '욕설',
    content: '부적절한 언어 사용으로 인한 신고',
    reportDate: '2024-01-21',
    status: 'pending',
    assignee: null,
    targetContent: '이건 정말 ****** 게시글이다...'
  },
  {
    id: 2,
    reporter: '신고자C',
    reportedUser: '사용자D',
    type: '댓글',
    reason: '스팸',
    content: '반복적인 광고성 댓글 작성',
    reportDate: '2024-01-20',
    status: 'reviewing',
    assignee: '관리자1',
    targetContent: '최고의 할인! 지금 바로 클릭하세요! www.spam.com'
  },
  {
    id: 3,
    reporter: '신고자E',
    reportedUser: '사용자F',
    type: '게시글',
    reason: '부적절한 콘텐츠',
    content: '선정적이고 부적절한 이미지 게시',
    reportDate: '2024-01-19',
    status: 'resolved',
    assignee: '관리자2',
    targetContent: '해당 게시글이 삭제되었습니다.'
  }
];

type ReportStatus = 'all' | 'pending' | 'reviewing' | 'resolved' | 'rejected';
type ReportType = 'all' | '게시글' | '댓글';

const ReportManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus>('all');
  const [typeFilter, setTypeFilter] = useState<ReportType>('all');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showReportDetail, setShowReportDetail] = useState(false);

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportedUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">대기</span>;
      case 'reviewing':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">검토중</span>;
      case 'resolved':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">처리완료</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">반려</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">알 수 없음</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case '게시글':
        return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">게시글</span>;
      case '댓글':
        return <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">댓글</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{type}</span>;
    }
  };

  const ReportDetailModal = () => {
    if (!selectedReport) return null;

    const [processType, setProcessType] = useState('approve');
    const [adminComment, setAdminComment] = useState('');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">신고 상세 처리</h2>
              <button
                onClick={() => setShowReportDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* 신고 정보 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">신고 정보</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">신고 ID:</span>
                    <span className="text-sm font-medium">#{selectedReport.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">신고자:</span>
                    <span className="text-sm font-medium">{selectedReport.reporter}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">피신고자:</span>
                    <span className="text-sm font-medium">{selectedReport.reportedUser}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">신고 유형:</span>
                    {getTypeBadge(selectedReport.type)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">신고 사유:</span>
                    <span className="text-sm font-medium">{selectedReport.reason}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">신고일:</span>
                    <span className="text-sm font-medium">{selectedReport.reportDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">상태:</span>
                    {getStatusBadge(selectedReport.status)}
                  </div>
                  {selectedReport.assignee && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">담당자:</span>
                      <span className="text-sm font-medium">{selectedReport.assignee}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">신고 대상 콘텐츠</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">상세 신고 내용:</span>
                  </div>
                  <p className="text-sm text-gray-800 mb-4">{selectedReport.content}</p>
                  
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">원본 콘텐츠:</span>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-800">{selectedReport.targetContent}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 처리 옵션 */}
            {selectedReport.status === 'pending' || selectedReport.status === 'reviewing' ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">처리 옵션</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      처리 방법
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="processType"
                          value="approve"
                          checked={processType === 'approve'}
                          onChange={(e) => setProcessType(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">신고 승인 (콘텐츠 삭제/숨김 및 사용자 제재)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="processType"
                          value="reject"
                          checked={processType === 'reject'}
                          onChange={(e) => setProcessType(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">신고 반려</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="processType"
                          value="review"
                          checked={processType === 'review'}
                          onChange={(e) => setProcessType(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">추가 검토 필요</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      처리 의견 *
                    </label>
                    <textarea
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="처리 의견을 입력하세요..."
                      required
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        // 처리 로직
                        setShowReportDetail(false);
                      }}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      처리 완료
                    </button>
                    <button
                      onClick={() => setShowReportDetail(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">이미 처리된 신고입니다.</p>
              </div>
            )}
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
          <h1 className="text-2xl font-bold text-gray-900">신고 관리</h1>
          <p className="text-gray-600 mt-1">사용자 신고 처리 및 관리</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-600">
              처리 대기: {mockReports.filter(r => r.status === 'pending').length}건
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">대기</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockReports.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">검토중</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockReports.filter(r => r.status === 'reviewing').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">처리완료</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockReports.filter(r => r.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">반려</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="신고자/피신고자/사유 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">모든 상태</option>
            <option value="pending">대기</option>
            <option value="reviewing">검토중</option>
            <option value="resolved">처리완료</option>
            <option value="rejected">반려</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ReportType)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">모든 유형</option>
            <option value="게시글">게시글</option>
            <option value="댓글">댓글</option>
          </select>

          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            필터 적용
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  신고 ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  신고자/피신고자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  유형
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사유
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  신고일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  담당자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{report.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{report.reporter}</div>
                      <div className="text-sm text-gray-500">→ {report.reportedUser}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(report.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.reportDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(report.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.assignee || '미배정'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setShowReportDetail(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      처리
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showReportDetail && <ReportDetailModal />}
    </div>
  );
};

export default ReportManagement;