import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  ThumbsUp, 
  ThumbsDown, 
  Brain, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  MessageSquare,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAdminAI } from '../../../hooks/useAdmin';
import { AdminAPI, AIJudgment, AIJudgmentDetail } from '../../../api/admin';
import { safeNumber, safeString, formatNumber, formatPercentage, safeArray } from '../../../utils/numberUtils';

const AISystemManagement: React.FC = () => {
  const { judgments, pagination, stats, overallStats, loading, error, fetchJudgments, fetchStats, fetchOverallStats } = useAdminAI();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | 'UP' | 'DOWN'>('all');
  const [selectedJudgment, setSelectedJudgment] = useState<AIJudgmentDetail | null>(null);
  const [showJudgmentDetail, setShowJudgmentDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // 초기 데이터 로딩
  useEffect(() => {
    handleSearch();
    fetchStats('weekly');
    fetchOverallStats(); // 전체 통계 가져오기
  }, []);

  const handleSearch = () => {
    const params: any = {
      page: currentPage,
      limit: 20,
    };

    if (searchTerm) {
      params.search = searchTerm;
    }

    if (ratingFilter !== 'all') {
      params.rating = ratingFilter;
    }

    fetchJudgments(params);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params: any = {
      page,
      limit: 20,
    };

    if (searchTerm) {
      params.search = searchTerm;
    }

    if (ratingFilter !== 'all') {
      params.rating = ratingFilter;
    }

    fetchJudgments(params);
  };

  const handleJudgmentDetail = async (judgmentId: string) => {
    try {
      // 현재 목록에서 해당 judgment를 찾아서 표시
      const foundJudgment = judgments.find(j => j.judgmentId === judgmentId);
      if (foundJudgment) {
        setSelectedJudgment(foundJudgment as any);
        setShowJudgmentDetail(true);
      } else {
        console.error('해당 AI 판단을 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('AI 판단 상세 정보 조회 실패:', err);
    }
  };

  const getFeedbackBadge = (rating: string | null) => {
    switch (rating) {
      case 'UP':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center">
            <ThumbsUp className="w-3 h-3 mr-1" />
            만족
          </span>
        );
      case 'DOWN':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center">
            <ThumbsDown className="w-3 h-3 mr-1" />
            불만족
          </span>
        );
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">미평가</span>;
    }
  };

  const JudgmentDetailModal = () => {
    if (!selectedJudgment) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">AI 판단 상세</h2>
              <button
                onClick={() => setShowJudgmentDetail(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">판단 정보</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">판단 ID:</span>
                      <span className="text-sm font-medium">#{selectedJudgment.judgmentId.slice(0, 8)}...</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">요청자:</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{selectedJudgment.user?.nickname || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{selectedJudgment.user?.email || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">요청일시:</span>
                      <span className="text-sm font-medium">{new Date(selectedJudgment.createdAt).toLocaleString('ko-KR')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">사용자 평가:</span>
                      {getFeedbackBadge(selectedJudgment.userRating)}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">AI 분석</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">응답 길이:</span>
                      <p className="text-sm font-medium">{selectedJudgment.aiResponse?.length || 0} 문자</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">처리 상태:</span>
                      <p className="text-sm font-medium">완료</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 판단 요청 사항 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">판단 요청 사항</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedJudgment.requestSummary || 'N/A'}</p>
                </div>
              </div>

              {/* AI 판단 결과 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI 판단 결과</h3>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedJudgment.aiResponse || 'N/A'}</p>
                </div>
              </div>

              {/* 사용자 피드백 */}
              {selectedJudgment.judgmentComment && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">사용자 피드백</h3>
                  <div className={`p-4 rounded-lg border-l-4 ${
                    selectedJudgment.userRating === 'DOWN' 
                      ? 'bg-red-50 border-red-500' 
                      : 'bg-green-50 border-green-500'
                  }`}>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedJudgment.judgmentComment}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => {
    // 디버깅을 위한 로그
    if (title === "만족도") {
      console.log('만족도 StatCard 값:', {
        title,
        value,
        overallStats,
        stats
      });
    }
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value || '0'}</p>
            {change && (
              <div className={`flex items-center mt-2 text-sm ${
                safeNumber(change) > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {safeNumber(change) > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {safeString(Math.abs(safeNumber(change)))}% vs 지난주
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              handleSearch();
              fetchStats('weekly');
              fetchOverallStats();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI 시스템 관리</h1>
          <p className="text-gray-600 mt-1">AI 판단 로그 및 성능 분석</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fetchStats('daily')}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
          >
            일별
          </button>
          <button
            onClick={() => fetchStats('weekly')}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
          >
            주별
          </button>
          <button
            onClick={() => fetchStats('monthly')}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
          >
            월별
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="총 판단 요청"
          value={formatNumber(overallStats?.totalJudgments || stats?.totalJudgments || 0)}
          icon={Brain}
          color="bg-purple-500"
        />
        <StatCard
          title="만족 건수"
          value={formatNumber(overallStats?.satisfactionCount || stats?.satisfactionCount || 0)}
          icon={ThumbsUp}
          color="bg-green-500"
        />
        <StatCard
          title="불만족 건수"
          value={formatNumber(overallStats?.dissatisfactionCount || stats?.dissatisfactionCount || 0)}
          icon={ThumbsDown}
          color="bg-red-500"
        />
        <StatCard
          title="만족도"
          value={
            overallStats?.satisfactionRate !== undefined ? 
              formatPercentage(overallStats.satisfactionRate) : 
              (stats?.satisfactionRate !== undefined ? formatPercentage(stats.satisfactionRate) : '0%')
          }
          icon={TrendingUp}
          color="bg-blue-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* AI Usage Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 만족도 추이</h3>
          {stats?.trends && stats.trends.length > 0 ? (
            <div className="w-full overflow-hidden">
              <ResponsiveContainer width="100%" height={250} className="min-w-0">
                <LineChart data={stats.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="judgmentCount" fill="#8884d8" name="요청 수" />
                  <Line yAxisId="right" type="monotone" dataKey="satisfactionRate" stroke="#82ca9d" name="만족도(%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              통계 데이터가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="사용자 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value as 'all' | 'UP' | 'DOWN')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">모든 평가</option>
            <option value="UP">만족</option>
            <option value="DOWN">불만족</option>
          </select>

          <button 
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
          >
            <Filter className="w-4 h-4 mr-2" />
            {loading ? '로딩...' : '필터 적용'}
          </button>
        </div>
      </div>

      {/* AI Judgments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">AI 판단 로그</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  판단 ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  요청자
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px] max-w-[250px]">
                  요청 내용
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px] max-w-[250px]">
                  AI 응답
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  사용자 평가
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  요청일시
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
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
              ) : judgments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    AI 판단 기록이 없습니다.
                  </td>
                </tr>
              ) : (
                safeArray(judgments).map((judgment) => (
                  <tr key={judgment.judgmentId} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className="hidden sm:inline">#{judgment.judgmentId.slice(0, 8)}...</span>
                      <span className="sm:hidden">#{judgment.judgmentId.slice(0, 6)}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[100px]">{judgment.user?.nickname || 'N/A'}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[100px] hidden sm:block">{judgment.user?.email || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 max-w-[200px] truncate">
                      <div className="text-sm text-gray-900 truncate" title={judgment.requestSummary}>
                        {judgment.requestSummary || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-[200px] truncate">
                      <div className="text-sm text-gray-900 truncate" title={judgment.aiResponse}>
                        {judgment.aiResponse || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getFeedbackBadge(judgment.userRating)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="hidden sm:block">{new Date(judgment.createdAt).toLocaleDateString('ko-KR')}</div>
                      <div className="sm:hidden">{new Date(judgment.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleJudgmentDetail(judgment.judgmentId)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">상세</span>
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
                  총 <span className="font-medium">{safeString(pagination?.totalItems)}</span>건의 AI 판단 중{' '}
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

      {/* Modal */}
      {showJudgmentDetail && <JudgmentDetailModal />}
    </div>
  );
};

export default AISystemManagement;
