import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAdminReports } from '../../../hooks/useAdmin';
import { AdminAPI, ReportDetail } from '../../../api/admin';
import { safeNumber, safeString, safeArray } from '../../../utils/numberUtils';


type ReportStatus = 'all' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
type ReportTypeFilter = 'all' | 'SPAM' | 'INAPPROPRIATE' | 'HARASSMENT' | 'COPYRIGHT';

const ReportManagement: React.FC = () => {
  const { reports, pagination, loading, error, fetchReports } = useAdminReports();
  const { processReport } = useAdminReports(); // 함수 선언 후 모달 내에서 사용
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus>('all');
  const [typeFilter, setTypeFilter] = useState<ReportTypeFilter>('all');
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null);
  const [showReportDetail, setShowReportDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // 안전한 리포트 배열
  const safeReports = safeArray(reports);

  // 통계 계산 함수
  const getStatusCounts = () => {
    return {
      pending: safeReports.filter(r => r.status === 'PENDING').length,
      inProgress: safeReports.filter(r => r.status === 'IN_PROGRESS').length,
      resolved: safeReports.filter(r => r.status === 'RESOLVED').length,
      rejected: safeReports.filter(r => r.status === 'REJECTED').length,
    };
  };

  const statusCounts = getStatusCounts();

  // 초기 데이터 로딩
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = () => {
    const params: any = {
      page: currentPage,
      limit: 20,
    };

    if (searchTerm) {
      // API 명세서에 따르면 search 파라미터는 없으므로 다른 필터로 대체
    }

    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }

    if (typeFilter !== 'all') {
      params.reportType = typeFilter;
    }

    fetchReports(params);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params: any = {
      page,
      limit: 20,
    };

    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }

    if (typeFilter !== 'all') {
      params.reportType = typeFilter;
    }

    fetchReports(params);
  };

  const handleReportDetail = async (reportId: number) => {
    try {
      console.log('신고 상세 조회 시작, reportId:', reportId);
      setDetailLoading(true);
      
      // 먼저 현재 목록에서 해당 신고를 찾아봅니다
      const currentReport = reports.find(r => r.reportId === reportId);
      if (currentReport) {
        console.log('목록에서 찾은 신고 데이터:', currentReport);
        
        // 기본 구조로 변환
        const basicReportDetail: ReportDetail = {
          ...currentReport,
          reporter: {
            userId: currentReport.reporter?.userId || '',
            email: currentReport.reporter?.email || '',
            username: currentReport.reporter?.nickname || 'N/A',
            nickname: currentReport.reporter?.nickname || 'N/A',
            provider: 'N/A',
            role: 'USER',
            isActive: true,
            isBanned: false,
            banEndDate: null,
            userBudget: 0,
            createdAt: currentReport.createdAt,
            updatedAt: currentReport.createdAt,
            stats: {
              postCount: 0,
              commentCount: 0,
              groupCount: 0,
              reportCount: 0
            }
          },
          reportedUser: {
            userId: currentReport.reportedUser?.userId || '',
            email: currentReport.reportedUser?.email || '',
            username: currentReport.reportedUser?.nickname || 'N/A',
            nickname: currentReport.reportedUser?.nickname || 'N/A',
            provider: 'N/A',
            role: 'USER',
            isActive: true,
            isBanned: false,
            banEndDate: null,
            userBudget: 0,
            createdAt: currentReport.createdAt,
            updatedAt: currentReport.createdAt,
            stats: {
              postCount: 0,
              commentCount: 0,
              groupCount: 0,
              reportCount: 0
            }
          },
          targetContent: null,
          adminNote: null
        };
        
        setSelectedReport(basicReportDetail);
        setShowReportDetail(true);
        
        // 상세 정보를 API로 불러와서 업데이트 (백그라운드에서)
        try {
          const reportDetail = await AdminAPI.getReportDetail(reportId);
          console.log('신고 상세 API 응답:', reportDetail);
          
          // 원본 콘텐츠 조회
          let targetContent = null;
          if (reportDetail.targetId) {
            if (reportDetail.reportType === 'COMMENT') {
              console.log('댓글 상세 조회 시작, commentId:', reportDetail.targetId);
              const commentDetail = await AdminAPI.getCommentDetail(reportDetail.targetId);
              if (commentDetail) {
                targetContent = {
                  type: 'COMMENT',
                  id: commentDetail.commentId,
                  content: commentDetail.content,
                  author: commentDetail.username,
                  createdAt: commentDetail.createdAt,
                  postId: commentDetail.postId
                };
              }
            } else if (reportDetail.reportType === 'POST') {
              console.log('게시글 상세 조회 시작, postId:', reportDetail.targetId);
              const postDetail = await AdminAPI.getPostDetail(reportDetail.targetId);
              if (postDetail) {
                targetContent = {
                  type: 'POST',
                  id: postDetail.postId,
                  title: postDetail.title,
                  content: postDetail.content,
                  category: postDetail.category,
                  author: postDetail.username,
                  createdAt: postDetail.createdAt,
                  likeCount: postDetail.likeCount
                };
              }
            }
          }
          
          // 모달이 여전히 열려있을 때만 업데이트
          setSelectedReport(prev => {
            if (prev && prev.reportId === reportId) {
              return {
                ...reportDetail,
                targetContent: targetContent
              };
            }
            return prev;
          });
        } catch (detailError) {
          console.warn('상세 정보 조회 실패, 목록 데이터 사용:', detailError);
          // API 실패해도 기본 데이터로 계속 진행
        }
      } else {
        // 목록에 없으면 API로 직접 조회
        const reportDetail = await AdminAPI.getReportDetail(reportId);
        console.log('신고 상세 API 응답:', reportDetail);
        
        // 원본 콘텐츠 조회
        let targetContent = null;
        if (reportDetail.targetId) {
          if (reportDetail.reportType === 'COMMENT') {
            const commentDetail = await AdminAPI.getCommentDetail(reportDetail.targetId);
            if (commentDetail) {
              targetContent = {
                type: 'COMMENT',
                id: commentDetail.commentId,
                content: commentDetail.content,
                author: commentDetail.username,
                createdAt: commentDetail.createdAt,
                postId: commentDetail.postId
              };
            }
          } else if (reportDetail.reportType === 'POST') {
            const postDetail = await AdminAPI.getPostDetail(reportDetail.targetId);
            if (postDetail) {
              targetContent = {
                type: 'POST',
                id: postDetail.postId,
                title: postDetail.title,
                content: postDetail.content,
                category: postDetail.category,
                author: postDetail.username,
                createdAt: postDetail.createdAt,
                likeCount: postDetail.likeCount
              };
            }
          }
        }
        
        setSelectedReport({
          ...reportDetail,
          targetContent: targetContent
        });
        setShowReportDetail(true);
      }
    } catch (err) {
      console.error('신고 상세 정보 조회 실패:', err);
      alert('신고 상세 정보를 불러올 수 없습니다.');
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">대기</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">처리중</span>;
      case 'RESOLVED':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">처리완료</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">반려</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">알 수 없음</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'SPAM':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">스팸</span>;
      case 'INAPPROPRIATE':
        return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">부적절한 콘텐츠</span>;
      case 'HARASSMENT':
        return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">괴롭힘</span>;
      case 'COPYRIGHT':
        return <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">저작권 침해</span>;
      case 'POST':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">게시물 신고</span>;
      case 'COMMENT':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">댓글 신고</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{type}</span>;
    }
  };

  const ReportDetailModal = () => {
    if (!selectedReport) return null;

    const [processType, setProcessType] = useState('approve');
    const [banDuration, setBanDuration] = useState(7);

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">신고 상세 처리</h2>
          <button
            onClick={() => {
              setShowReportDetail(false);
              setSelectedReport(null);
            }}
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
                    <span className="text-sm font-medium">#{selectedReport.reportId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">신고자:</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">{selectedReport.reporter?.nickname || selectedReport.reporter?.username || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{selectedReport.reporter?.email || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">피신고자:</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">{selectedReport.reportedUser?.nickname || selectedReport.reportedUser?.username || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{selectedReport.reportedUser?.email || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">신고 유형:</span>
                    {getTypeBadge(selectedReport.reportType)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">신고 사유:</span>
                    <span className="text-sm font-medium">{selectedReport.reason || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">신고일:</span>
                    <span className="text-sm font-medium">{new Date(selectedReport.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">상태:</span>
                    {getStatusBadge(selectedReport.status)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">신고 대상 콘텐츠</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">대상 유형:</span>
                    <span className="ml-2 text-sm font-medium">{selectedReport.reportType}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">대상 ID:</span>
                    <span className="ml-2 text-sm font-medium">{selectedReport.targetId || 'N/A'}</span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">상세 신고 내용:</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded mb-4">
                    <p className="text-sm text-gray-800">{selectedReport.reason || 'N/A'}</p>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">원본 콘텐츠:</span>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    {selectedReport.targetContent ? (
                      <div className="space-y-3">
                        {/* 콘텐츠 타입 헤더 */}
                        <div className="flex items-center justify-between pb-2 border-b">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            selectedReport.targetContent.type === 'POST' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {selectedReport.targetContent.type === 'POST' ? '게시글' : '댓글'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(selectedReport.targetContent.createdAt).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {/* 콘텐츠 내용 */}
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <span className="text-xs text-gray-500 min-w-12">작성자:</span>
                            <span className="text-sm font-medium text-gray-900">
                              {selectedReport.targetContent.author}
                            </span>
                          </div>

                          {selectedReport.targetContent.type === 'POST' && selectedReport.targetContent.title && (
                            <div className="flex items-start space-x-2">
                              <span className="text-xs text-gray-500 min-w-12">제목:</span>
                              <span className="text-sm font-medium text-gray-900">
                                {selectedReport.targetContent.title}
                              </span>
                            </div>
                          )}

                          {selectedReport.targetContent.type === 'POST' && selectedReport.targetContent.category && (
                            <div className="flex items-start space-x-2">
                              <span className="text-xs text-gray-500 min-w-12">카테고리:</span>
                              <span className="text-sm text-gray-700">
                                {selectedReport.targetContent.category}
                              </span>
                            </div>
                          )}

                          <div className="flex items-start space-x-2">
                            <span className="text-xs text-gray-500 min-w-12">내용:</span>
                            <div className="flex-1">
                              <div className="bg-gray-50 p-3 rounded text-sm text-gray-800 whitespace-pre-wrap">
                                {selectedReport.targetContent.content}
                              </div>
                            </div>
                          </div>

                          {selectedReport.targetContent.type === 'POST' && selectedReport.targetContent.likeCount !== undefined && (
                            <div className="flex items-start space-x-2">
                              <span className="text-xs text-gray-500 min-w-12">좋아요:</span>
                              <span className="text-sm text-gray-700">
                                {selectedReport.targetContent.likeCount}개
                              </span>
                            </div>
                          )}

                          {selectedReport.targetContent.type === 'COMMENT' && selectedReport.targetContent.postId && (
                            <div className="flex items-start space-x-2">
                              <span className="text-xs text-gray-500 min-w-12">게시글 ID:</span>
                              <span className="text-xs text-gray-600 font-mono">
                                {selectedReport.targetContent.postId}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="text-gray-400 mb-3">
                          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          원본 콘텐츠를 불러올 수 없습니다
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          • 콘텐츠가 삭제되었을 수 있습니다<br/>
                          • 접근 권한이 없을 수 있습니다<br/>
                          • 지원하지 않는 콘텐츠 유형일 수 있습니다
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 추가 정보 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">신고자 정보</h3>
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">가입일:</span>
                    <span className="text-sm">{selectedReport.reporter?.createdAt ? new Date(selectedReport.reporter.createdAt).toLocaleDateString('ko-KR') : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">작성 게시글:</span>
                    <span className="text-sm">{selectedReport.reporter?.stats?.postCount || 0}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">작성 댓글:</span>
                    <span className="text-sm">{selectedReport.reporter?.stats?.commentCount || 0}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">신고 횟수:</span>
                    <span className="text-sm text-red-600">{selectedReport.reporter?.stats?.reportCount || 0}회</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">피신고자 정보</h3>
                <div className="bg-red-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">가입일:</span>
                    <span className="text-sm">{selectedReport.reportedUser?.createdAt ? new Date(selectedReport.reportedUser.createdAt).toLocaleDateString('ko-KR') : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">작성 게시글:</span>
                    <span className="text-sm">{selectedReport.reportedUser?.stats?.postCount || 0}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">작성 댓글:</span>
                    <span className="text-sm">{selectedReport.reportedUser?.stats?.commentCount || 0}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">신고당한 횟수:</span>
                    <span className="text-sm text-red-600">{selectedReport.reportedUser?.stats?.reportCount || 0}회</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">계정 상태:</span>
                    <span className={`text-sm ${selectedReport.reportedUser?.isBanned ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedReport.reportedUser?.isBanned ? '정지됨' : '정상'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 처리 옵션 */}
            {selectedReport.status === 'PENDING' || selectedReport.status === 'IN_PROGRESS' ? (
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
                        <span className="text-sm">신고 승인 (사용자 제재)</span>
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

                  {processType === 'approve' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        제재 기간 (일)
                      </label>
                      <input
                        type="number"
                        value={banDuration}
                        onChange={(e) => setBanDuration(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="365"
                        placeholder="제재 기간을 입력하세요"
                      />
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                        onClick={async () => {
                          try {
                            const requestData: any = {
                              status: processType === 'approve' ? 'RESOLVED' : 
                                      processType === 'reject' ? 'REJECTED' : 'IN_PROGRESS',
                              sendNotification: true
                            };

                            // 승인인 경우 사용자 제재 추가
                            if (processType === 'approve') {
                              requestData.banUser = true;
                              const banEndDate = new Date();
                              banEndDate.setDate(banEndDate.getDate() + (banDuration || 7));
                              requestData.banEndDate = banEndDate.toISOString();
                            }

                            await processReport(selectedReport.reportId, requestData);

                            alert('신고 처리가 완료되었습니다.');
                            setShowReportDetail(false);
                            setSelectedReport(null);
                          } catch (error) {
                            console.error('신고 처리 오류:', error);
                            alert('신고 처리 중 오류가 발생했습니다.');
                          }
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      처리 완료
                    </button>
                    <button
                      onClick={() => {
                        setShowReportDetail(false);
                        setSelectedReport(null);
                      }}
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
    );
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

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
              처리 대기: {safeString(statusCounts.pending)}건
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
                {safeString(statusCounts.pending)}
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
              <p className="text-sm font-medium text-gray-600">처리중</p>
              <p className="text-2xl font-bold text-gray-900">
                {safeString(statusCounts.inProgress)}
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
                {safeString(statusCounts.resolved)}
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
              <p className="text-2xl font-bold text-gray-900">
                {safeString(statusCounts.rejected)}
              </p>
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
              placeholder="검색 기능 (추후 구현)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">모든 상태</option>
            <option value="PENDING">대기</option>
            <option value="IN_PROGRESS">처리중</option>
            <option value="RESOLVED">처리완료</option>
            <option value="REJECTED">반려</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ReportTypeFilter)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">모든 유형</option>
            <option value="SPAM">스팸</option>
            <option value="INAPPROPRIATE">부적절한 콘텐츠</option>
            <option value="HARASSMENT">괴롭힘</option>
            <option value="COPYRIGHT">저작권 침해</option>
          </select>

          <button 
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            {loading ? '로딩...' : '필터 적용'}
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
                  신고일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  처리일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2">로딩 중...</span>
                    </div>
                  </td>
                </tr>
              ) : safeReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    신고가 없습니다.
                  </td>
                </tr>
              ) : (
                safeReports.map((report) => (
                  <tr key={report.reportId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{report.reportId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.reporter?.email || 'N/A'}</div>
                        <div className="text-sm text-gray-500">→ {report.reportedUser?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(report.reportType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.processedAt 
                        ? new Date(report.processedAt).toLocaleDateString('ko-KR')
                        : '미처리'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleReportDetail(report.reportId)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        상세보기
                      </button>
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
                  총 <span className="font-medium">{safeString(pagination?.totalItems)}</span>건의 신고 중{' '}
                  <span className="font-medium">
                    {safeString(pagination ? ((safeNumber(pagination.currentPage, 1) - 1) * safeNumber(pagination.itemsPerPage, 20)) + 1 : 0)}
                  </span>
                  -{' '}
                  <span className="font-medium">
                    {safeString(pagination ? Math.min(safeNumber(pagination.currentPage, 1) * safeNumber(pagination.itemsPerPage, 20), safeNumber(pagination.totalItems)) : 0)}
                  </span>
                  건 표시
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button 
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevious}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNumber = Math.max(1, pagination.currentPage - 2) + i;
                    if (pageNumber > pagination.totalPages) return null;
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNumber === pagination.currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button 
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
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

      {/* Modal */}
      {showReportDetail && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {detailLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2">상세 정보를 불러오는 중...</span>
                </div>
              </div>
            )}
            <ReportDetailModal />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;