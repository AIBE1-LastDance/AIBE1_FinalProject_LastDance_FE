import React from 'react';
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

// 가상 데이터
const userStats = {
  total: 2847,
  active: 2654,
  suspended: 193,
  newThisWeek: 124
};

const groupStats = {
  total: 1245,
  active: 1178,
  pendingReports: 23,
  systemErrors: 5
};

const dailySignupData = [
  { date: '01/01', signups: 12 },
  { date: '01/02', signups: 19 },
  { date: '01/03', signups: 8 },
  { date: '01/04', signups: 27 },
  { date: '01/05', signups: 18 },
  { date: '01/06', signups: 23 },
  { date: '01/07', signups: 31 },
];

const monthlyActiveUsers = [
  { month: '7월', users: 2341 },
  { month: '8월', users: 2456 },
  { month: '9월', users: 2523 },
  { month: '10월', users: 2487 },
  { month: '11월', users: 2598 },
  { month: '12월', users: 2654 },
];

const reportsByCategory = [
  { name: '욕설/비방', value: 35, color: '#ef4444' },
  { name: '스팸', value: 28, color: '#f59e0b' },
  { name: '부적절한 콘텐츠', value: 22, color: '#8b5cf6' },
  { name: '기타', value: 15, color: '#6b7280' },
];

const hourlyTraffic = [
  { hour: '00', users: 45 },
  { hour: '06', users: 23 },
  { hour: '12', users: 89 },
  { hour: '18', users: 156 },
  { hour: '22', users: 134 },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
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
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <button 
            onClick={() => navigate('/admin/analytics')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:text-green-500 transition-colors"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            통계 보기
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="전체 사용자 수"
          value={userStats.total}
          change={8.2}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="활성 사용자"
          value={userStats.active}
          change={5.1}
          icon={UserCheck}
          color="bg-green-500"
        />
        <StatCard
          title="정지된 사용자"
          value={userStats.suspended}
          change={-12.3}
          icon={UserX}
          color="bg-red-500"
        />
        <StatCard
          title="주간 신규 가입"
          value={userStats.newThisWeek}
          change={15.7}
          icon={UserPlus}
          color="bg-purple-500"
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="전체 그룹"
          value={groupStats.total}
          change={3.4}
          icon={MessageSquare}
          color="bg-indigo-500"
        />
        <StatCard
          title="활성 그룹 수"
          value={groupStats.active}
          change={4.2}
          icon={MessageCircle}
          color="bg-teal-500"
        />
        <StatCard
          title="미처리 신고 수"
          value={groupStats.pendingReports}
          change={-18.5}
          icon={AlertTriangle}
          color="bg-orange-500"
        />
        <StatCard
          title="시스템 에러"
          value={groupStats.systemErrors}
          change={-25.0}
          icon={AlertCircle}
          color="bg-rose-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Signups Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">일별 신규 가입자 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySignupData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="signups" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Active Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">월별 활성 사용자 수</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyActiveUsers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports by Category */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 신고 현황</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportsByCategory}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {reportsByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Traffic */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">시간대별 접속자 수</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyTraffic}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;