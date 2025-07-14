import React, {useState, useEffect} from 'react';
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
import {useAdminReports} from '../../../hooks/useAdmin';
import {AdminAPI, ReportDetail} from '../../../api/admin';
import {safeNumber, safeString, safeArray} from '../../../utils/numberUtils';


type ReportStatus = 'all' | 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'REJECTED';
type ReportTypeFilter = 'all' | 'POST' | 'COMMENT';
type ReportReasonFilter =
    'all'
    | 'SPAM'
    | 'INAPPROPRIATE'
    | 'HARASSMENT'
    | 'MISINFORMATION'
    | 'COPYRIGHT'
    | 'HATE_SPEECH'
    | 'OTHER';

const ReportManagement: React.FC = () => {
    const {reports, pagination, loading, error, fetchReports} = useAdminReports();
    const {processReport} = useAdminReports(); // 함수 선언 후 모달 내에서 사용
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState<'reporter' | 'reportedUser'>('reporter'); // 검색 대상 구분
    const [statusFilter, setStatusFilter] = useState<ReportStatus>('all');
    const [typeFilter, setTypeFilter] = useState<ReportTypeFilter>('all');
    const [reasonFilter, setReasonFilter] = useState<ReportReasonFilter>('all'); // reason 필터 추가
    const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null);
    const [showReportDetail, setShowReportDetail] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // 모달 내부 상태를 부모 컴포넌트에서 관리
    const [processType, setProcessType] = useState('approve');
    const [banDuration, setBanDuration] = useState(7);

    // 디버깅을 위한 processType 상태 변경 추적
    useEffect(() => {
        console.log('processType 변경됨:', processType);
    }, [processType]);

    // 안전한 리포트 배열
    const safeReports = safeArray(reports);

    // 통계 계산 함수
    const getStatusCounts = () => {
        return {
            pending: safeReports.filter(r => r.status === 'PENDING').length,
            reviewed: safeReports.filter(r => r.status === 'REVIEWED').length,
            resolved: safeReports.filter(r => r.status === 'RESOLVED').length,
            rejected: safeReports.filter(r => r.status === 'REJECTED').length,
        };
    };

    const statusCounts = getStatusCounts();

    // 필터가 변경될 때마다 자동으로 검색 실행 (검색어 제외)
    useEffect(() => {
        if (statusFilter === 'all' && typeFilter === 'all' && reasonFilter === 'all') {
            // 모든 필터가 기본값이면 초기 로딩에서만 실행되도록 함
            return;
        }

        const params: any = {
            page: 1,
            limit: 20,
        };

        // 검색어가 있을 때 검색 타입에 따라 파라미터 설정
        if (searchTerm.trim()) {
            if (searchType === 'reporter') {
                params.reporterNicknameOrEmail = searchTerm.trim();
            } else {
                params.reportedUserNicknameOrEmail = searchTerm.trim();
            }
        }

        if (statusFilter !== 'all') {
            params.status = statusFilter;
        }

        if (typeFilter !== 'all') {
            params.reportType = typeFilter;
        }

        if (reasonFilter !== 'all') {
            params.reason = reasonFilter;
        }

        console.log('필터 변경으로 인한 자동 검색 파라미터:', params);
        fetchReports(params);
        setCurrentPage(1);
    }, [statusFilter, typeFilter, reasonFilter]);

    // 초기 데이터 로딩
    useEffect(() => {
        const params = {
            page: 1,
            limit: 20,
        };
        console.log('초기 데이터 로딩 파라미터:', params);
        fetchReports(params);
    }, []);

    const handleSearch = () => {
        setCurrentPage(1); // 검색할 때는 첫 페이지로 리셋
        const params: any = {
            page: 1,
            limit: 20,
        };

        // 검색어가 있을 때 검색 타입에 따라 파라미터 설정
        if (searchTerm.trim()) {
            if (searchType === 'reporter') {
                params.reporterNicknameOrEmail = searchTerm.trim(); // API 명세에 맞게 수정
            } else {
                params.reportedUserNicknameOrEmail = searchTerm.trim(); // API 명세에 맞게 수정
            }
        }

        // API 명세서의 정확한 파라미터명 사용
        if (statusFilter !== 'all') {
            // API 문서에서 상태 필터 파라미터명 확인 필요
            params.status = statusFilter;
        }

        if (typeFilter !== 'all') {
            params.reportType = typeFilter;
        }

        if (reasonFilter !== 'all') {
            // API 문서에서 reason 파라미터명 확인
            params.reason = reasonFilter;
        }

        console.log('검색 파라미터:', params); // 디버깅용
        fetchReports(params);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const params: any = {
            page,
            limit: 20,
        };

        // 검색어가 있을 때 검색 타입에 따라 파라미터 설정
        if (searchTerm.trim()) {
            if (searchType === 'reporter') {
                params.reporterNicknameOrEmail = searchTerm.trim();
            } else {
                params.reportedUserNicknameOrEmail = searchTerm.trim();
            }
        }

        if (statusFilter !== 'all') {
            params.status = statusFilter;
        }

        if (typeFilter !== 'all') {
            params.reportType = typeFilter;
        }

        if (reasonFilter !== 'all') {
            params.reason = reasonFilter;
        }

        fetchReports(params);
    };

    const handleReportDetail = async (reportId: number) => {
        try {
            console.log('신고 상세 조회 시작, reportId:', reportId);
            setDetailLoading(true);

            // 모달 상태 초기화 (모달이 닫혀있을 때만)
            if (!showReportDetail) {
                console.log('모달 상태 초기화');
                setProcessType('approve');
                setBanDuration(7);
            }

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
                return <span
                    className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">대기</span>;
            case 'REVIEWED':
                return <span
                    className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">검토중</span>;
            case 'RESOLVED':
                return <span
                    className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">처리완료</span>;
            case 'REJECTED':
                return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">반려</span>;
            default:
                return <span
                    className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">알 수 없음</span>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'POST':
                return <span
                    className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">게시물 신고</span>;
            case 'COMMENT':
                return <span
                    className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">댓글 신고</span>;
            default:
                return <span
                    className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{type}</span>;
        }
    };

    const getReasonBadge = (reason: string) => {
        const reasonLabels: { [key: string]: { label: string; color: string } } = {
            'SPAM': {label: '스팸', color: 'bg-red-100 text-red-800'},
            'INAPPROPRIATE': {label: '부적절한 콘텐츠', color: 'bg-primary-100 text-primary-800'},
            'HARASSMENT': {label: '괴롭힘', color: 'bg-purple-100 text-purple-800'},
            'MISINFORMATION': {label: '허위정보', color: 'bg-yellow-100 text-yellow-800'},
            'COPYRIGHT': {label: '저작권 침해', color: 'bg-blue-100 text-blue-800'},
            'HATE_SPEECH': {label: '혐오 발언', color: 'bg-red-100 text-red-800'},
            'OTHER': {label: '기타', color: 'bg-gray-100 text-gray-800'}
        };

        if (!reason || reason.trim() === '') {
            return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">사유 없음</span>;
        }

        const reasonInfo = reasonLabels[reason] || {label: reason, color: 'bg-gray-100 text-gray-800'};

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${reasonInfo.color}`} title={reason}>
        {reasonInfo.label}
      </span>
        );
    };

    const ReportDetailModal = React.memo(() => {
        if (!selectedReport) return null;

        const scrollContainerRef = React.useRef<HTMLDivElement>(null);
        const scrollTopRef = React.useRef<number>(0);

        // 입력 중인 값을 별도로 관리하여 리렌더링 최소화
        const [inputValue, setInputValue] = React.useState(banDuration.toString());

        // banDuration이 외부에서 변경될 때만 inputValue 업데이트
        React.useEffect(() => {
            setInputValue(banDuration.toString());
        }, [banDuration]);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setInputValue(value);

            // 유효한 숫자일 때만 실제 상태 업데이트
            const numValue = parseInt(value);
            if (!isNaN(numValue) && numValue >= 1 && numValue <= 365) {
                setBanDuration(numValue);
            }
        };

        const handleInputBlur = () => {
            // 포커스를 잃을 때 유효하지 않은 값 수정
            const numValue = parseInt(inputValue);
            if (isNaN(numValue) || numValue < 1 || numValue > 365) {
                setInputValue(banDuration.toString());
            }
        };

        const handleProcessTypeChange = (type: string) => {
            if (scrollContainerRef.current) {
                scrollTopRef.current = scrollContainerRef.current.scrollTop;
            }
            setProcessType(type);
        };

        React.useLayoutEffect(() => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = scrollTopRef.current;
            }
        });

        return (
            <div 
                ref={scrollContainerRef}
                className="p-6 overflow-y-auto max-h-[90vh]"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">신고 상세 처리</h2>
                    <button
                        onClick={() => {
                            setShowReportDetail(false);
                            setSelectedReport(null);
                            setProcessType('approve');
                            setBanDuration(7);
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
                                    <div
                                        className="text-sm font-medium">{selectedReport.reporter?.nickname || selectedReport.reporter?.username || 'N/A'}</div>
                                    <div
                                        className="text-xs text-gray-500">{selectedReport.reporter?.email || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">피신고자:</span>
                                <div className="text-right">
                                    <div
                                        className="text-sm font-medium">{selectedReport.reportedUser?.nickname || selectedReport.reportedUser?.username || 'N/A'}</div>
                                    <div
                                        className="text-xs text-gray-500">{selectedReport.reportedUser?.email || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">신고 유형:</span>
                                {getTypeBadge(selectedReport.reportType)}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">신고 사유:</span>
                                {getReasonBadge(selectedReport.reason)}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">신고일:</span>
                                <span
                                    className="text-sm font-medium">{new Date(selectedReport.createdAt).toLocaleDateString('ko-KR')}</span>
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
                                                    <div
                                                        className="bg-gray-50 p-3 rounded text-sm text-gray-800 whitespace-pre-wrap">
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
                                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
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
                                <span
                                    className="text-sm">{selectedReport.reporter?.createdAt ? new Date(selectedReport.reporter.createdAt).toLocaleDateString('ko-KR') : 'N/A'}</span>
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
                                <span
                                    className="text-sm text-red-600">{selectedReport.reporter?.stats?.reportCount || 0}회</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">피신고자 정보</h3>
                        <div className="bg-red-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">가입일:</span>
                                <span
                                    className="text-sm">{selectedReport.reportedUser?.createdAt ? new Date(selectedReport.reportedUser.createdAt).toLocaleDateString('ko-KR') : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">작성 게시글:</span>
                                <span className="text-sm">{selectedReport.reportedUser?.stats?.postCount || 0}개</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">작성 댓글:</span>
                                <span
                                    className="text-sm">{selectedReport.reportedUser?.stats?.commentCount || 0}개</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">신고당한 횟수:</span>
                                <span
                                    className="text-sm text-red-600">{selectedReport.reportedUser?.stats?.reportCount || 0}회</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">계정 상태:</span>
                                <span
                                    className={`text-sm ${selectedReport.reportedUser?.isBanned ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedReport.reportedUser?.isBanned ? '정지됨' : '정상'}
                    </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 처리 옵션 */}
                {selectedReport.status === 'PENDING' || selectedReport.status === 'REVIEWED' ? (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">처리 옵션</h3>

                        {/* 현재 선택된 처리 방법 요약 */}
                        <div className={`p-4 rounded-lg border-l-4 ${
                            processType === 'approve'
                                ? 'bg-red-50 border-red-500'
                                : processType === 'deleteOnly'
                                    ? 'bg-primary-50 border-primary-500'
                                    : processType === 'reject'
                                        ? 'bg-gray-50 border-gray-500'
                                        : 'bg-blue-50 border-blue-500'
                        }`}>
                            <div className="flex items-center space-x-2">
                                {processType === 'approve' && <XCircle className="w-5 h-5 text-red-600"/>}
                                {processType === 'deleteOnly' && <AlertTriangle className="w-5 h-5 text-primary-600"/>}
                                {processType === 'reject' && <XCircle className="w-5 h-5 text-gray-600"/>}
                                {processType === 'review' && <Eye className="w-5 h-5 text-blue-600"/>}
                                <h4 className={`font-medium ${
                                    processType === 'approve' ? 'text-red-800' :
                                        processType === 'deleteOnly' ? 'text-primary-800' :
                                            processType === 'reject' ? 'text-gray-800' : 'text-blue-800'
                                }`}>
                                    선택된 처리 방법: {
                                    processType === 'approve' ? '신고 승인 (삭제 + 제재)' :
                                        processType === 'deleteOnly' ? '콘텐츠 삭제' :
                                            processType === 'reject' ? '신고 반려' : '검토 진행'
                                }
                                </h4>
                                <span className="text-xs text-gray-500 ml-auto">
                                    (현재: {processType})
                                </span>
                            </div>
                            {processType === 'approve' && (
                                <p className="text-sm text-red-700 mt-2">
                                    콘텐츠를 삭제하고 사용자를 {banDuration}일간 정지시킵니다.
                                </p>
                            )}
                        </div>

                        <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    처리 방법
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* 신고 승인 및 제재 */}
                                    <div
                                        onClick={() => handleProcessTypeChange('approve')}
                                        className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                                            processType === 'approve'
                                                ? 'border-red-500 bg-red-50 shadow-sm'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div
                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                                    processType === 'approve'
                                                        ? 'border-red-500 bg-red-500'
                                                        : 'border-gray-300'
                                                }`}>
                                                {processType === 'approve' && (
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <XCircle
                                                        className={`w-4 h-4 ${processType === 'approve' ? 'text-red-600' : 'text-gray-400'}`}/>
                                                    <h4 className={`font-medium ${processType === 'approve' ? 'text-red-900' : 'text-gray-900'}`}>
                                                        신고 승인 (삭제 + 제재)
                                                    </h4>
                                                </div>
                                                <p className={`text-sm mt-1 ${processType === 'approve' ? 'text-red-700' : 'text-gray-600'}`}>
                                                    콘텐츠 삭제 및 사용자 계정 정지
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 콘텐츠만 삭제 */}
                                    <div
                                        onClick={() => handleProcessTypeChange('deleteOnly')}
                                        className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                                            processType === 'deleteOnly'
                                                ? 'border-primary-500 bg-primary-50 shadow-sm'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div
                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                                    processType === 'deleteOnly'
                                                        ? 'border-primary-500 bg-primary-500'
                                                        : 'border-gray-300'
                                                }`}>
                                                {processType === 'deleteOnly' && (
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <AlertTriangle
                                                        className={`w-4 h-4 ${processType === 'deleteOnly' ? 'text-primary-600' : 'text-gray-400'}`}/>
                                                    <h4 className={`font-medium ${processType === 'deleteOnly' ? 'text-primary-900' : 'text-gray-900'}`}>
                                                        콘텐츠 삭제
                                                    </h4>
                                                </div>
                                                <p className={`text-sm mt-1 ${processType === 'deleteOnly' ? 'text-primary-700' : 'text-gray-600'}`}>
                                                    콘텐츠만 삭제 (사용자 제재 없음)
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 신고 반려 */}
                                    <div
                                        onClick={() => handleProcessTypeChange('reject')}
                                        className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                                            processType === 'reject'
                                                ? 'border-gray-500 bg-gray-50 shadow-sm'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div
                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                                    processType === 'reject'
                                                        ? 'border-gray-500 bg-gray-500'
                                                        : 'border-gray-300'
                                                }`}>
                                                {processType === 'reject' && (
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <XCircle
                                                        className={`w-4 h-4 ${processType === 'reject' ? 'text-gray-600' : 'text-gray-400'}`}/>
                                                    <h4 className={`font-medium ${processType === 'reject' ? 'text-gray-900' : 'text-gray-900'}`}>
                                                        신고 반려
                                                    </h4>
                                                </div>
                                                <p className={`text-sm mt-1 ${processType === 'reject' ? 'text-gray-700' : 'text-gray-600'}`}>
                                                    신고를 부당하다고 판단하여 반려
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 검토 상태로 변경 */}
                                    <div
                                        onClick={() => handleProcessTypeChange('review')}
                                        className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                                            processType === 'review'
                                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div
                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                                    processType === 'review'
                                                        ? 'border-blue-500 bg-blue-500'
                                                        : 'border-gray-300'
                                                }`}>
                                                {processType === 'review' && (
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <Eye
                                                        className={`w-4 h-4 ${processType === 'review' ? 'text-blue-600' : 'text-gray-400'}`}/>
                                                    <h4 className={`font-medium ${processType === 'review' ? 'text-blue-900' : 'text-gray-900'}`}>
                                                        검토 진행
                                                    </h4>
                                                </div>
                                                <p className={`text-sm mt-1 ${processType === 'review' ? 'text-blue-700' : 'text-gray-600'}`}>
                                                    추가 검토가 필요한 경우
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {processType === 'approve' && (
                                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                                    <label className="block text-sm font-medium text-red-800 mb-3">
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-4 h-4"/>
                                            <span>제재 기간 설정</span>
                                        </div>
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="number"
                                            value={banDuration}
                                            onChange={(e) => setBanDuration(parseInt(e.target.value) || 7)}
                                            className="w-20 px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center"
                                            min="1"
                                            max="365"
                                        />
                                        <span className="text-sm text-red-700">일</span>
                                        <div className="flex-1 text-xs text-red-600">
                                            <p>• 제재 기간 동안 모든 활동이 제한됩니다</p>
                                        </div>
                                    </div>

                                    {/* 빠른 선택 버튼들 */}
                                    <div className="mt-3 flex space-x-2">
                                        <span className="text-xs text-red-700 mr-2">빠른 선택:</span>
                                        {[1, 3, 7, 14, 30].map((days) => (
                                            <button
                                                key={days}
                                                onClick={() => {
                                                    if (scrollContainerRef.current) {
                                                        scrollTopRef.current = scrollContainerRef.current.scrollTop;
                                                    }
                                                    setBanDuration(days);
                                                }}
                                                className={`px-2 py-1 text-xs rounded border transition-colors ${
                                                    banDuration === days
                                                        ? 'bg-red-500 text-white border-red-500'
                                                        : 'bg-white text-red-600 border-red-300 hover:bg-red-50'
                                                }`}
                                            >
                                                {days}일
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={async () => {
                                        try {
                                            const requestData: any = {
                                                sendNotification: true
                                            };

                                            // 처리 타입에 따른 분기
                                            if (processType === 'approve') {
                                                // 신고 글 삭제 및 사용자 제재
                                                requestData.status = 'RESOLVED';
                                                requestData.banUser = true;
                                                const banEndDate = new Date();
                                                banEndDate.setDate(banEndDate.getDate() + (banDuration || 7));
                                                requestData.banEndDate = banEndDate.toISOString();
                                            } else if (processType === 'deleteOnly') {
                                                // 신고 글만 삭제 (사용자 제재 없음)
                                                requestData.status = 'RESOLVED';
                                                requestData.banUser = false;
                                            } else if (processType === 'reject') {
                                                // 신고 반려
                                                requestData.status = 'REJECTED';
                                                requestData.banUser = false;
                                            } else if (processType === 'review') {
                                                // 신고 검토
                                                requestData.status = 'REVIEWED';
                                                requestData.banUser = false;
                                            }

                                            await processReport(selectedReport.reportId, requestData);

                                            const messages = {
                                                approve: '신고가 승인되어 글이 삭제되고 사용자가 제재되었습니다.',
                                                deleteOnly: '신고 글이 삭제되었습니다.',
                                                reject: '신고가 반려되었습니다.',
                                                review: '신고가 검토 상태로 변경되었습니다.'
                                            };

                                            alert(messages[processType as keyof typeof messages] || '신고 처리가 완료되었습니다.');
                                            setShowReportDetail(false);
                                            setSelectedReport(null);
                                            setProcessType('approve');
                                            setBanDuration(7);
                                        } catch (error) {
                                            console.error('신고 처리 오류:', error);
                                            alert('신고 처리 중 오류가 발생했습니다.');
                                        }
                                    }}
                                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                                        processType === 'approve'
                                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl'
                                            : processType === 'deleteOnly'
                                                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
                                                : processType === 'reject'
                                                    ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-lg hover:shadow-xl'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                                    }`}
                                >
                                    {processType === 'approve' && <XCircle className="w-5 h-5"/>}
                                    {processType === 'deleteOnly' && <AlertTriangle className="w-5 h-5"/>}
                                    {processType === 'reject' && <XCircle className="w-5 h-5"/>}
                                    {processType === 'review' && <Eye className="w-5 h-5"/>}
                                    <span>
                        {processType === 'approve' && '신고 승인 및 제재'}
                                        {processType === 'deleteOnly' && '콘텐츠 삭제'}
                                        {processType === 'reject' && '신고 반려'}
                                        {processType === 'review' && '검토 진행'}
                      </span>
                                </button>

                                <button
                                    onClick={() => {
                                        setShowReportDetail(false);
                                        setSelectedReport(null);
                                        setProcessType('approve');
                                        setBanDuration(7);
                                    }}
                                    className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center space-x-2"
                                >
                                    <XCircle className="w-5 h-5"/>
                                    <span>취소</span>
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
    });

    // 오류 발생 시에도 기본 화면을 보여주고, 테이블에서 오류 메시지 표시

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
                        <AlertTriangle className="w-5 h-5 text-red-500"/>
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
                            <Clock className="w-6 h-6 text-yellow-600"/>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">대기</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {safeString(statusCounts.pending)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-6">
                    <div className="flex items-center">
                        <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
                            <Eye className="w-4 h-4 md:w-6 md:h-6 text-blue-600"/>
                        </div>
                        <div className="ml-2 md:ml-4">
                            <p className="text-xs md:text-sm font-medium text-gray-600">검토중</p>
                            <p className="text-lg md:text-2xl font-bold text-gray-900">
                                {safeString(statusCounts.reviewed)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-6">
                    <div className="flex items-center">
                        <div className="p-1.5 md:p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-4 h-4 md:w-6 md:h-6 text-green-600"/>
                        </div>
                        <div className="ml-2 md:ml-4">
                            <p className="text-xs md:text-sm font-medium text-gray-600">처리완료</p>
                            <p className="text-lg md:text-2xl font-bold text-gray-900">
                                {safeString(statusCounts.resolved)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-6">
                    <div className="flex items-center">
                        <div className="p-1.5 md:p-2 bg-red-100 rounded-lg">
                            <XCircle className="w-4 h-4 md:w-6 md:h-6 text-red-600"/>
                        </div>
                        <div className="ml-2 md:ml-4">
                            <p className="text-xs md:text-sm font-medium text-gray-600">반려</p>
                            <p className="text-lg md:text-2xl font-bold text-gray-900">
                                {safeString(statusCounts.rejected)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {/* 검색 타입 선택 */}
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value as 'reporter' | 'reportedUser')}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="reporter">신고자 검색</option>
                        <option value="reportedUser">피신고자 검색</option>
                    </select>

                    {/* 검색 입력 */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
                        <input
                            type="text"
                            placeholder={searchType === 'reporter' ? "신고자 닉네임/이메일 검색" : "피신고자 닉네임/이메일 검색"}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    // 검색어 초기화 후 자동으로 검색 실행
                                    setTimeout(() => {
                                        const params: any = {page: 1, limit: 20};
                                        if (statusFilter !== 'all') params.status = statusFilter;
                                        if (typeFilter !== 'all') {
                                            params.reportType = typeFilter;
                                        }
                                        if (reasonFilter !== 'all') params.reason = reasonFilter;
                                        fetchReports(params);
                                    }, 0);
                                }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as ReportStatus)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">모든 상태</option>
                        <option value="PENDING">대기</option>
                        <option value="REVIEWED">검토중</option>
                        <option value="RESOLVED">처리완료</option>
                        <option value="REJECTED">반려</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as ReportTypeFilter)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">모든 유형</option>
                        <option value="POST">게시물 신고</option>
                        <option value="COMMENT">댓글 신고</option>
                    </select>

                    <select
                        value={reasonFilter}
                        onChange={(e) => setReasonFilter(e.target.value as ReportReasonFilter)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">모든 사유</option>
                        <option value="SPAM">스팸</option>
                        <option value="INAPPROPRIATE">부적절한 콘텐츠</option>
                        <option value="HARASSMENT">괴롭힘</option>
                        <option value="MISINFORMATION">허위정보</option>
                        <option value="COPYRIGHT">저작권 침해</option>
                        <option value="HATE_SPEECH">혐오 발언</option>
                        <option value="OTHER">기타</option>
                    </select>

                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <Search className="w-4 h-4 mr-2"/>
                        {loading ? '로딩...' : '검색'}
                    </button>
                </div>
            </div>

            {/* Reports Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Desktop View - Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                신고 정보
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                                유형/사유
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                상태
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                액션
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center">
                                        <div
                                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        <span className="ml-2">로딩 중...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                    오류가 발생했습니다.
                                </td>
                            </tr>
                        ) : safeReports.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                    신고가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            safeReports.map((report) => (
                                <tr key={report.reportId} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{report.reportId}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-sm">
                                                <span className="font-medium text-gray-900">
                                                    {report.reporter?.nickname || 'N/A'}
                                                </span>
                                                <span className="mx-2 text-gray-400">→</span>
                                                <span className="font-medium text-gray-900">
                                                    {report.reportedUser?.nickname || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                                                {report.processedAt && (
                                                    <span className="ml-2">
                                                        처리: {new Date(report.processedAt).toLocaleDateString('ko-KR')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="space-y-1">
                                            <div className="w-full">
                                                {getTypeBadge(report.reportType)}
                                            </div>
                                            <div className="w-full">
                                                {getReasonBadge(report.reason)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {getStatusBadge(report.status)}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleReportDetail(report.reportId)}
                                            className="text-blue-600 hover:text-blue-900 flex items-center"
                                        >
                                            <Eye className="w-4 h-4 mr-1"/>
                                            보기
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View - Cards */}
                <div className="lg:hidden">
                    {loading ? (
                        <div className="p-6 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-500 mt-2">로딩 중...</p>
                        </div>
                    ) : error ? (
                        <div className="p-6 text-center text-gray-500">
                            오류가 발생했습니다.
                        </div>
                    ) : safeReports.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            신고가 없습니다.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {safeReports.map((report) => (
                                <div key={report.reportId} className="p-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900">
                                                신고 #{report.reportId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getTypeBadge(report.reportType)}
                                            {getStatusBadge(report.status)}
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-3">
                                        <div className="text-xs">
                                            <span className="text-gray-600">신고자:</span>
                                            <span className="ml-1 font-medium text-gray-900">
                                                {report.reporter?.nickname || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="text-xs">
                                            <span className="text-gray-600">피신고자:</span>
                                            <span className="ml-1 font-medium text-gray-900">
                                                {report.reportedUser?.nickname || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-gray-600">사유:</span>
                                            {getReasonBadge(report.reason)}
                                        </div>
                                        <div className="text-xs">
                                            <span className="text-gray-600">처리일:</span>
                                            <span className="ml-1">
                                                {report.processedAt
                                                    ? new Date(report.processedAt).toLocaleDateString('ko-KR')
                                                    : '미처리'
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleReportDetail(report.reportId)}
                                        className="w-full text-blue-600 hover:text-blue-900 flex items-center justify-center text-sm py-2 border border-blue-200 rounded-md hover:bg-blue-50"
                                    >
                                        <Eye className="w-4 h-4 mr-1"/>
                                        상세보기
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination && (
                    <div
                        className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                                    총 <span className="font-medium">{safeString(pagination?.totalItems)}</span>건의 신고
                                    중{' '}
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
                                        <ChevronLeft className="w-5 h-5"/>
                                    </button>

                                    {/* Page Numbers */}
                                    {Array.from({length: Math.min(5, pagination.totalPages)}, (_, i) => {
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
                                        <ChevronRight className="w-5 h-5"/>
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
                    <div className="bg-white rounded-lg max-w-4xl w-full h-[90vh] flex flex-col">
                        {detailLoading && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <span className="ml-2">상세 정보를 불러오는 중...</span>
                                </div>
                            </div>
                        )}
                        <ReportDetailModal/>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportManagement;