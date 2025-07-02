import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserPlus,
  MessageSquare,
  MessageCircle,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAdminDashboard } from '../../../hooks/useAdmin';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardStats, signupTrend, loading, error, refetch, fetchSignupTrend } = useAdminDashboard();
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly'>('weekly');

  // 차트 데이터 변환
  const chartData = signupTrend.map(item => {
    const date = new Date(item.date);
    let formattedDate = '';
    
    switch (selectedPeriod) {
      case 'weekly':
        formattedDate = date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
        break;
      case 'monthly':
        formattedDate = date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
        break;
    }
    
    return {
      date: formattedDate,
      signups: item.signups || 0
    };
  });

  const handlePeriodChange = (period: 'weekly' | 'monthly') => {
    setSelectedPeriod(period);
    fetchSignupTrend(period);
  };

  const getPeriodText = (period: string) => {
    switch (period) {
      case 'weekly': return '주간';
      case 'monthly': return '월간';
      default: return period;
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color, isLoading }: any) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-20 mt-1"></div>
            </div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1">{value?.toLocaleString() || 0}</p>
          )}
          {change && !isLoading && (
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
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
          <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-gray-600 mt-1">시스템 전체 현황을 확인하세요</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Activity className="w-4 h-4" />
          <span>실시간 업데이트</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/admin/users')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors"
          >
            <Users className="w-5 h-5 mr-2" />
            사용자 관리
          </button>
          <button 
            onClick={() => navigate('/admin/reports')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:text-orange-500 transition-colors"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            신고 처리
          </button>
          <button 
            onClick={() => navigate('/admin/ai')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:text-purple-500 transition-colors"
          >
            <Activity className="w-5 h-5 mr-2" />
            AI 시스템
          </button>
        </div>
      </div>

      {/* Main Stats Grid - 사용자 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="전체 사용자 수"
          value={dashboardStats?.dashboardUserStats.total}
          icon={Users}
          color="bg-blue-500"
          isLoading={loading}
        />
        <StatCard
          title="활성 사용자"
          value={dashboardStats?.dashboardUserStats.active}
          icon={UserCheck}
          color="bg-green-500"
          isLoading={loading}
        />
        <StatCard
          title="정지된 사용자"
          value={dashboardStats?.dashboardUserStats.suspended}
          icon={UserX}
          color="bg-red-500"
          isLoading={loading}
        />
        <StatCard
          title="이번 주 신규 가입"
          value={dashboardStats?.dashboardUserStats.newThisWeek}
          icon={UserPlus}
          color="bg-purple-500"
          isLoading={loading}
        />
      </div>

      {/* Secondary Stats Grid - 콘텐츠 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="전체 게시글"
          value={dashboardStats?.dashboardContentStats.totalPosts}
          icon={MessageSquare}
          color="bg-indigo-500"
          isLoading={loading}
        />
        <StatCard
          title="전체 댓글"
          value={dashboardStats?.dashboardContentStats.totalComments}
          icon={MessageCircle}
          color="bg-teal-500"
          isLoading={loading}
        />
        <StatCard
          title="오늘 게시글"
          value={dashboardStats?.dashboardContentStats.todayPosts}
          icon={MessageSquare}
          color="bg-cyan-500"
          isLoading={loading}
        />
        <StatCard
          title="오늘 댓글"
          value={dashboardStats?.dashboardContentStats.todayComments}
          icon={MessageCircle}
          color="bg-emerald-500"
          isLoading={loading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Signup Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">신규 가입자 추이</h3>
              <p className="text-sm text-gray-500 mt-1">기간별 신규 가입자 현황을 확인하세요</p>
            </div>
            <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
              {(['weekly', 'monthly'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedPeriod === period
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {getPeriodText(period)}
                </button>
              ))}
            </div>
          </div>
          
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">데이터를 불러오는 중...</p>
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">데이터가 없습니다</p>
                <p className="text-sm text-gray-400 mt-1">선택한 기간에 가입자가 없습니다</p>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart 
                  data={chartData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tick={{ fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: 'medium' }}
                    formatter={(value: any) => [
                      `${value.toLocaleString()}명`, 
                      '신규 가입자'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="signups" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ 
                      fill: '#3b82f6', 
                      strokeWidth: 2, 
                      r: 5,
                      fillOpacity: 1
                    }}
                    activeDot={{ 
                      r: 7, 
                      fill: '#1d4ed8',
                      strokeWidth: 2,
                      stroke: '#fff'
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
              
              {/* Chart Summary */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {chartData.reduce((sum, item) => sum + item.signups, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">총 가입자</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {chartData.length > 0 ? Math.round(chartData.reduce((sum, item) => sum + item.signups, 0) / chartData.length) : 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">평균 가입자</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.max(...chartData.map(item => item.signups), 0)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">최대 가입자</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
