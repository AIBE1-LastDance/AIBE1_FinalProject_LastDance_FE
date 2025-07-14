import React from 'react';
import Header from './Header';
import MobileNav from './MobileNav';
import Footer from './Footer';
import FloatingButtons from '../common/FloatingButtons';

// ❌ useNotifications import 제거
// import { useNotifications } from '../../hooks/useNotifications';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // ❌ SSE 연결 관리 코드 제거 (App.tsx로 이동)
  // useNotifications();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 h-full">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
      <FloatingButtons />
      
    </div>
  );
};

export default Layout;