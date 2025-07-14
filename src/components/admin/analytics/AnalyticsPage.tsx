import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  MessageSquare,
  Download
} from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('1month');

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className={`flex items-center mt-2 text-sm ${
            change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {change > 0 ? '+' : ''}{change}% vs 지난 기간
          </div>
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
          <h1 className="text-2xl font-bold text-gray-900">통계 및 분석</h1>
          <p className="text-gray-600 mt-1">서비스 사용 현황 및 분석</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1week">최근 1주</option>
            <option value="1month">최근 1개월</option>
            <option value="3months">최근 3개월</option>
            <option value="1year">최근 1년</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            리포트 다운로드
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="총 사용자 수"
          value="2,654"
          change={8.2}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="일간 활성 사용자"
          value="456"
          change={12.5}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="월 평균 지출"
          value="₩130,000"
          change={-5.2}
          icon={DollarSign}
          color="bg-purple-500"
        />
        <StatCard
          title="커뮤니티 활동"
          value="734"
          change={15.7}
          icon={MessageSquare}
          color="bg-primary-500"
        />
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">사용자 증가 추이</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">차트 컴포넌트 (Recharts 활용)</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">일간 활성 사용자</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">차트 컴포넌트 (Recharts 활용)</p>
          </div>
        </div>
      </div>

      {/* Financial Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">금융 데이터 분석</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">₩130,000</div>
            <div className="text-sm text-gray-600 mt-1">평균 월 지출</div>
            <div className="text-xs text-green-600 mt-1">-5.2% vs 지난달</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">₩45,000</div>
            <div className="text-sm text-gray-600 mt-1">평균 식비</div>
            <div className="text-xs text-red-600 mt-1">+3.1% vs 지난달</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">78%</div>
            <div className="text-sm text-gray-600 mt-1">예산 준수율</div>
            <div className="text-xs text-green-600 mt-1">+12% vs 지난달</div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">데이터 내보내기</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors">
            <Download className="w-5 h-5 mr-2" />
            사용자 통계 (CSV)
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:text-green-500 transition-colors">
            <Download className="w-5 h-5 mr-2" />
            지출 데이터 (Excel)
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:text-purple-500 transition-colors">
            <Download className="w-5 h-5 mr-2" />
            전체 리포트 (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;