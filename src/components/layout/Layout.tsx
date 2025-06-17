import React from 'react';
import Header from './Header';
import MobileNav from './MobileNav';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
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
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#374151',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
    </div>
  );
};

export default Layout;