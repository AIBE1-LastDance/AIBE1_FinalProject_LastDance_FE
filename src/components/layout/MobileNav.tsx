import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, CheckSquare, CreditCard, Users, Gamepad2, Bot } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';

const MobileNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useAppStore();

  const navigationItems = [
    { icon: BarChart3, label: '대시보드', path: '/dashboard' },
    { icon: Calendar, label: '캘린더', path: '/calendar' },
    { icon: CheckSquare, label: '할일', path: '/tasks' },
    { icon: CreditCard, label: '가계부', path: '/expenses' },
    { icon: Gamepad2, label: '게임', path: '/games' },
    { icon: Bot, label: 'AI', path: '/ai-assistant' },
    { icon: Users, label: '커뮤니티', path: '/community' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.path}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'text-primary-600' : 'text-gray-600'}`} />
              <span className={`text-xs mt-1 ${isActive ? 'text-primary-600 font-medium' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;