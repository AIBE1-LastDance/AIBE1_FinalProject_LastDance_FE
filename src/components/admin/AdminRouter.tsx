import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminDashboard from './dashboard/AdminDashboard';
import UserManagement from './users/UserManagement';
import ReportManagement from './reports/ReportManagement';
import AISystemManagement from './ai/AISystemManagement';
import { useAdminAuth } from '../../hooks/useAdmin';
import { AlertTriangle } from 'lucide-react';

const AdminRouter: React.FC = () => {
  const { isAdmin, adminInfo, loading, error } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-2 border-accent-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">관리자 권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h2>
          <p className="text-gray-600 mb-4">
            {error || '관리자 권한이 필요합니다. 소셜 로그인을 통해 관리자 계정으로 로그인해주세요.'}
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="reports" element={<ReportManagement />} />
        <Route path="ai" element={<AISystemManagement />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRouter;