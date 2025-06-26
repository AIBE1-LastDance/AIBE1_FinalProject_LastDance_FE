import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminDashboard from './dashboard/AdminDashboard';
import UserManagement from './users/UserManagement';
import ReportManagement from './reports/ReportManagement';
import ContentManagement from './content/ContentManagement';
import AnalyticsPage from './analytics/AnalyticsPage';
import AISystemManagement from './ai/AISystemManagement';

const AdminRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="groups" element={<div className="p-6">그룹 관리 페이지 (개발 예정)</div>} />
        <Route path="content" element={<ContentManagement />} />
        <Route path="reports" element={<ReportManagement />} />
        <Route path="ai" element={<AISystemManagement />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="system" element={<div className="p-6">시스템 관리 페이지 (개발 예정)</div>} />
        <Route path="admins" element={<div className="p-6">관리자 계정 관리 페이지 (개발 예정)</div>} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRouter;