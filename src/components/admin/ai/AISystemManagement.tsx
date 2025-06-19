import React, { useState } from 'react';
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
  User
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

// 가상 AI 판단 데이터
const mockAIJudgments = [
  {
    id: '1',
    user: '김철수',
    group: '우리집',
    type: 'GROUP',
    situation: '안녕하세요. 저희 집에서 청소 분담 때문에 갈등이 생겼어요. 룸메이트가 본인 방만 청소하고 공용 공간은 안 치운다고 하는데, 저는 공용 공간도 같이 청소해야 한다고 생각해요. 어떻게 해야 할까요?',
    judgmentResult: '안녕하세요! 공용 공간 청소 분담에 대한 갈등이군요. 이런 상황에서는 명확한 규칙을 정하는 것이 중요합니다.\n\n제안드리는 해결책:\n1. 공용 공간을 구역별로 나누어 책임지기\n2. 주 단위로 순번을 정해서 전체 공용공간 청소 담당하기\n3. 청소 일정표를 만들어 벽에 붙여두기\n\n각자의 생활 패턴과 시간을 고려해서 상의해보시길 권합니다. 대화를 통해 서로가 수긍할 수 있는 방안을 찾으시기 바랍니다.',
    feedback: 'up',
    downReason: null,
    createdAt: '2024-01-21 14:30',
    category: '생활갈등'
  },
  {
    id: '2',
    user: '이영희',
    group: '룸메이트',
    type: 'GROUP',
    situation: '룸메이트와 공과금 분담을 어떻게 할지 정하려고 하는데 의견이 달라요. 룸메이트는 50:50으로 하자고 하는데, 저는 제가 전기를 많이 쓰니까 6:4로 하는 게 맞다고 생각해요. 어떻게 정하는 게 공정한지 판단해주세요.',
    judgmentResult: '공과금 분담에 대한 고민이시군요. 공정한 분담을 위한 몇 가지 기준을 제안드립니다.\n\n고려해볼 요소들:\n• 실제 사용량 (전기, 가스, 수도)\n• 거주 기간 및 시간\n• 개인 소득 수준\n• 공용 시설 이용 빈도\n\n일반적으로는 실제 사용량을 기준으로 하되, 정확한 측정이 어려우면 생활 패턴을 고려한 비율 조정이 합리적입니다. 전기 사용량이 확실히 많다면 6:4 비율도 고려해볼 만합니다.\n\n서로 납득할 수 있는 기준을 정해 한 달 간 시범 운영 후 조정하시는 것을 권합니다.',
    feedback: 'down',
    downReason: '소득 수준을 고려하라고 하셨는데, 이건 개인적인 부분이라 공과금 분담 기준으로는 부적절한 것 같아요. 오직 사용량과 거주 시간만 고려해야 한다고 생각합니다. AI가 너무 많은 요소를 제시해서 오히려 혼란스러워요.',
    createdAt: '2024-01-20 16:45',
    category: '금전문제'
  },
  {
    id: '3',
    user: '박민수',
    group: null,
    type: 'PERSONAL',
    situation: '요즘 새로운 회사에 적응하느라 스트레스가 많고, 개인적인 고민도 있어서 마음이 복잡해요. 업무도 잘 안 풀리고 인간관계도 어렵고... 어떻게 하면 이 상황을 잘 헤쳐나갈 수 있을까요?',
    judgmentResult: '새로운 환경 적응은 누구에게나 어려운 과정입니다. 지금 겪고 계신 어려움이 충분히 이해됩니다.\n\n단계별 접근 방법을 제안드립니다:\n\n1단계 - 우선순위 정리\n• 가장 시급한 문제부터 차례대로 해결\n• 한 번에 모든 것을 해결하려 하지 말기\n\n2단계 - 작은 성공 경험 쌓기\n• 업무에서 작은 목표부터 달성\n• 동료와의 관계에서 한 명씩 친해지기\n\n3단계 - 스트레스 관리\n• 규칙적인 운동이나 취미 활동\n• 충분한 수면과 휴식\n\n시간이 해결해줄 부분도 있으니 너무 조급해하지 마시고, 필요하면 주변에 도움을 요청하는 것도 좋습니다.',
    feedback: 'up',
    downReason: null,
    createdAt: '2024-01-19 11:20',
    category: '개인상담'
  }
];

// 가상 통계 데이터
const aiUsageStats = [
  { date: '01/15', requests: 23, satisfaction: 78 },
  { date: '01/16', requests: 31, satisfaction: 82 },
  { date: '01/17', requests: 18, satisfaction: 75 },
  { date: '01/18', requests: 45, satisfaction: 88 },
  { date: '01/19', requests: 52, satisfaction: 85 },
  { date: '01/20', requests: 38, satisfaction: 79 },
  { date: '01/21', requests: 41, satisfaction: 91 },
];

const categoryDistribution = [
  { name: '생활갈등', value: 35, color: '#3b82f6' },
  { name: '금전문제', value: 28, color: '#ef4444' },
  { name: '개인상담', value: 22, color: '#10b981' },
  { name: '기타', value: 15, color: '#f59e0b' },
];

const satisfactionTrend = [
  { month: '9월', satisfaction: 72 },
  { month: '10월', satisfaction: 78 },
  { month: '11월', satisfaction: 81 },
  { month: '12월', satisfaction: 85 },
  { month: '1월', satisfaction: 83 },
];

type FeedbackFilter = 'all' | 'up' | 'down';
type TypeFilter = 'all' | 'GROUP' | 'PERSONAL';

const AISystemManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackFilter, setFeedbackFilter] = useState<FeedbackFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedJudgment, setSelectedJudgment] = useState<any>(null);
  const [showJudgmentDetail, setShowJudgmentDetail] = useState(false);

  const filteredJudgments = mockAIJudgments.filter(judgment => {
    const matchesSearch = judgment.situation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         judgment.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFeedback = feedbackFilter === 'all' || judgment.feedback === feedbackFilter;
    const matchesType = typeFilter === 'all' || judgment.type === typeFilter;
    
    return matchesSearch && matchesFeedback && matchesType;
  });

  const getFeedbackBadge = (feedback: string) => {
    switch (feedback) {
      case 'up':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center">
            <ThumbsUp className="w-3 h-3 mr-1" />
            만족
          </span>
        );
      case 'down':
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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'GROUP':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">그룹</span>;
      case 'PERSONAL':
        return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">개인</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{type}</span>;
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
                className="text-gray-400 hover:text-gray-600"
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
                      <span className="text-sm font-medium">#{selectedJudgment.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">요청자:</span>
                      <span className="text-sm font-medium">{selectedJudgment.user}</span>
                    </div>
                    {selectedJudgment.group && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">그룹:</span>
                        <span className="text-sm font-medium">{selectedJudgment.group}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">유형:</span>
                      {getTypeBadge(selectedJudgment.type)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">카테고리:</span>
                      <span className="text-sm font-medium">{selectedJudgment.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">요청일시:</span>
                      <span className="text-sm font-medium">{selectedJudgment.createdAt}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">사용자 평가:</span>
                      {getFeedbackBadge(selectedJudgment.feedback)}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">AI 분석</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">정확도 점수:</span>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">85%</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">응답 속도:</span>
                      <p className="text-sm font-medium">1.2초</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">사용된 모델:</span>
                      <p className="text-sm font-medium">GPT-4</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">토큰 사용량:</span>
                      <p className="text-sm font-medium">245 tokens</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 판단 요청 사항 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">판단 요청 사항</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedJudgment.situation}</p>
                </div>
              </div>

              {/* AI 판단 결과 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI 판단 결과</h3>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedJudgment.judgmentResult}</p>
                </div>
              </div>

              {/* 불만족 사유 */}
              {selectedJudgment.feedback === 'down' && selectedJudgment.downReason && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">불만족 사유</h3>
                  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedJudgment.downReason}</p>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      개선 사항 적용
                    </button>
                    <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">
                      AI 모델 재학습 요청
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(change)}% vs 지난주
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI 시스템 관리</h1>
          <p className="text-gray-600 mt-1">AI 판단 로그 및 성능 분석</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="총 판단 요청"
          value="1,247"
          change={12.5}
          icon={Brain}
          color="bg-purple-500"
        />
        <StatCard
          title="만족도"
          value="83%"
          change={5.2}
          icon={ThumbsUp}
          color="bg-green-500"
        />
        <StatCard
          title="불만족 건수"
          value="42"
          change={-8.1}
          icon={ThumbsDown}
          color="bg-red-500"
        />
        <StatCard
          title="평균 응답 시간"
          value="1.4초"
          change={-15.3}
          icon={AlertCircle}
          color="bg-blue-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Usage Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 사용량 및 만족도 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={aiUsageStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="requests" fill="#8884d8" name="요청 수" />
              <Line yAxisId="right" type="monotone" dataKey="satisfaction" stroke="#82ca9d" name="만족도(%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 요청 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="판단 요청 사항/사용자 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={feedbackFilter}
            onChange={(e) => setFeedbackFilter(e.target.value as FeedbackFilter)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">모든 평가</option>
            <option value="up">만족</option>
            <option value="down">불만족</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">모든 유형</option>
            <option value="GROUP">그룹</option>
            <option value="PERSONAL">개인</option>
          </select>

          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            필터 적용
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  판단 ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  요청자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  유형
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  판단 요청 사항 (요약)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사용자 평가
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  요청일시
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJudgments.map((judgment) => (
                <tr key={judgment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{judgment.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{judgment.user}</div>
                      {judgment.group && (
                        <div className="text-sm text-gray-500">{judgment.group}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(judgment.type)}
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-sm text-gray-900 truncate">
                      {judgment.situation.substring(0, 50)}...
                    </div>
                    <div className="text-xs text-gray-500">{judgment.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getFeedbackBadge(judgment.feedback)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {judgment.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedJudgment(judgment);
                        setShowJudgmentDetail(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      상세
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showJudgmentDetail && <JudgmentDetailModal />}
    </div>
  );
};

export default AISystemManagement;