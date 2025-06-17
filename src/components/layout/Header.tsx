import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, CheckSquare, CreditCard, Users, Settings, LogOut, User, ChevronDown, Gamepad2, Bot, BarChart3, ToggleLeft, ToggleRight, Bell } from 'lucide-react';
import { FaGoogle, FaComment } from 'react-icons/fa';
import { SiNaver } from 'react-icons/si';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { useNavigate, useLocation } from 'react-router-dom';
import CreateGroupModal from '../groups/CreateGroupModal';
import JoinGroupModal from '../groups/JoinGroupModal';
import GroupSettingsModal from '../groups/GroupSettingsModal';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { mode, setMode, currentGroup, joinedGroups, setCurrentGroup } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);
  const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 로그인 상태 확인
  const isAuthenticated = !!user;

  // 임시 알림 데이터
  const [notifications] = useState([
    {
      id: '1',
      type: 'task',
      title: '할일 마감 알림',
      message: '설거지 할일이 내일 마감입니다.',
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10분 전
      read: false,
      icon: '📋'
    },
    {
      id: '2',
      type: 'expense',
      title: '지출 정산 요청',
      message: '김철수님이 전기요금 정산을 요청했습니다.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
      read: false,
      icon: '💰'
    },
    {
      id: '3',
      type: 'event',
      title: '일정 알림',
      message: '30분 후 "대청소" 일정이 시작됩니다.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30분 전
      read: true,
      icon: '📅'
    },
    {
      id: '4',
      type: 'group',
      title: '그룹 알림',
      message: '이영희님이 그룹에 참여했습니다.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5시간 전
      read: true,
      icon: '👥'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const handleModeToggle = () => {
    setMode(mode === 'personal' ? 'group' : 'personal');
    setShowUserMenu(false);
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - timestamp.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    return `${diffInDays}일 전`;
  };

  const markAllAsRead = () => {
    // 실제로는 서버에 요청을 보내서 모든 알림을 읽음 처리
    console.log('모든 알림을 읽음 처리');
  };

  const navigationItems = [
    { icon: BarChart3, label: '대시보드', path: '/dashboard' },
    { icon: Calendar, label: '캘린더', path: '/calendar' },
    { icon: CheckSquare, label: '할일', path: '/tasks' },
    { icon: CreditCard, label: '가계부', path: '/expenses' },
    ...(mode === 'personal' ? [
      { icon: Gamepad2, label: '게임', path: '/games' },
      { icon: Bot, label: 'AI 도우미', path: '/ai-assistant' }
    ] : [
      { icon: Gamepad2, label: '게임', path: '/games' },
      { icon: Bot, label: 'AI 도우미', path: '/ai-assistant' }
    ]),
    { icon: Users, label: '커뮤니티', path: '/community' },
  ];

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google': return <FaGoogle className="w-4 h-4" />;
      case 'kakao': return <FaComment className="w-4 h-4 text-yellow-500" />;
      case 'naver': return <SiNaver className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/20 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
          >
            <img src="/image/Logo.png" alt="우리.zip" className="w-12 h-12 sm:w-16 sm:h-16" />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navigationItems.map((item) => (
              <motion.button
                key={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'text-[#df6d14] bg-[#df6d14]/10 shadow-sm'
                    : 'text-gray-600 hover:text-[#df6d14] hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            ))}
          </nav>

          {/* User Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <motion.button
                className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors active:bg-gray-100 sm:hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </motion.button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    {/* Mobile Backdrop */}
                    <div className="fixed inset-0 bg-black/20 z-40 sm:hidden" onClick={() => setShowNotifications(false)} />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 sm:w-80 w-[calc(100vw-1rem)] sm:right-0 -right-4 bg-white rounded-xl shadow-lg border border-gray-200 py-2 max-h-96 overflow-hidden z-50 sm:max-h-96 max-h-[80vh]"
                    >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">알림</h3>
                        {unreadCount > 0 && (
                          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                            {unreadCount}개 안읽음
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          모두 읽음
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 sm:max-h-80 max-h-[60vh] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8">
                          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">새로운 알림이 없습니다.</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            className={`px-4 py-4 sm:py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer border-l-4 ${
                              notification.read 
                                ? 'border-transparent bg-white' 
                                : 'border-blue-500 bg-blue-50'
                            }`}
                            whileHover={{ x: 2 }}
                            onClick={() => {
                              // 알림 클릭 시 해당 페이지로 이동하거나 상세 보기
                              console.log('Notification clicked:', notification.id);
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                                {notification.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className={`text-sm font-medium truncate ${
                                    notification.read ? 'text-gray-700' : 'text-gray-900'
                                  }`}>
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                                  )}
                                </div>
                                <p className={`text-sm mt-1 ${
                                  notification.read ? 'text-gray-500' : 'text-gray-700'
                                }`}>
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatTimeAgo(notification.timestamp)}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="border-t border-gray-100 px-4 py-3">
                        <button
                          onClick={() => {
                            navigate('/notifications');
                            setShowNotifications(false);
                          }}
                          className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium text-center"
                        >
                          모든 알림 보기
                        </button>
                      </div>
                    )}
                  </motion.div>
                </>
              )}
              </AnimatePresence>
            </div>
            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                className="flex items-center p-1.5 sm:p-2 rounded-xl hover:bg-gray-50 transition-colors active:bg-gray-100"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#df6d14] to-[#df6d14]/80 rounded-full flex items-center justify-center">
                  {getProviderIcon(user?.provider || '')}
                </div>
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform ml-1 sm:ml-2 ${showUserMenu ? 'rotate-180' : ''}`} />
              </motion.button>

              {/* User Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <>
                    {/* Mobile Backdrop */}
                    <div className="fixed inset-0 bg-black/20 z-40 sm:hidden" onClick={() => setShowUserMenu(false)} />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-72 sm:w-72 w-[calc(100vw-1rem)] sm:right-0 -right-4 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 sm:max-h-auto max-h-[80vh] overflow-y-auto"
                    >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#df6d14] to-[#df6d14]/80 rounded-full flex items-center justify-center">
                          {getProviderIcon(user?.provider || '')}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                          <div className="text-xs text-gray-500">{user?.email}</div>
                        </div>
                      </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {mode === 'personal' ? (
                            <ToggleLeft className="w-5 h-5 text-[#df6d14]" />
                          ) : (
                            <ToggleRight className="w-5 h-5 text-purple-600" />
                          )}
                          <span className="text-sm font-medium text-gray-700">모드 변경</span>
                        </div>
                        <motion.button
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                            mode === 'personal'
                              ? 'bg-[#df6d14] text-white'
                              : 'bg-purple-600 text-white'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleModeToggle}
                        >
                          {mode === 'personal' ? '개인 모드' : '그룹 모드'}
                        </motion.button>
                      </div>
                    </div>

                    {/* Group Selector - only show in group mode */}
                    {mode === 'group' && (
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-xs font-medium text-gray-500 mb-2">현재 그룹</div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {joinedGroups.map((group) => (
                            <motion.div
                              key={group.id}
                              className={`w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors rounded-lg ${
                                currentGroup?.id === group.id ? 'bg-[#df6d14]/10 border border-[#df6d14]/20' : ''
                              }`}
                            >
                              <motion.button
                                className="flex items-center space-x-3 flex-1 text-left"
                                whileHover={{ x: 2 }}
                                onClick={() => {
                                  setCurrentGroup(group);
                                  setShowUserMenu(false);
                                }}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">{group.name}</div>
                                  <div className="text-xs text-gray-500">{group.members.length}명</div>
                                </div>
                                {currentGroup?.id === group.id && (
                                  <div className="w-2 h-2 bg-[#df6d14] rounded-full flex-shrink-0"></div>
                                )}
                              </motion.button>
                              
                              {currentGroup?.id === group.id && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setShowGroupSettingsModal(true);
                                    setShowUserMenu(false);
                                  }}
                                  className="p-1 text-gray-400 hover:text-[#df6d14] transition-colors"
                                >
                                  <Settings className="w-4 h-4" />
                                </motion.button>
                              )}
                            </motion.div>
                          ))}
                        </div>
                        <div className="mt-3 pt-2 border-t border-gray-100 space-y-1">
                          <motion.button
                            className="w-full flex items-center space-x-2 px-3 py-1.5 text-left text-[#df6d14] hover:bg-[#df6d14]/5 transition-colors rounded-lg text-sm"
                            whileHover={{ x: 2 }}
                            onClick={() => {
                              setShowCreateGroupModal(true);
                              setShowUserMenu(false);
                            }}
                          >
                            <span>+ 새 그룹 만들기</span>
                          </motion.button>
                          <motion.button
                            className="w-full flex items-center space-x-2 px-3 py-1.5 text-left text-[#df6d14] hover:bg-[#df6d14]/5 transition-colors rounded-lg text-sm"
                            whileHover={{ x: 2 }}
                            onClick={() => {
                              setShowJoinGroupModal(true);
                              setShowUserMenu(false);
                            }}
                          >
                            <span>+ 그룹 참여하기</span>
                          </motion.button>
                        </div>
                      </div>
                    )}

                    {/* Menu Items */}
                    <motion.button
                      className="w-full flex items-center space-x-3 px-4 py-3 sm:py-2 text-left text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      whileHover={{ x: 4 }}
                      onClick={() => {
                        navigate('/settings');
                        setShowUserMenu(false);
                      }}
                    >
                      <Settings className="w-4 h-4" />
                      <span>설정</span>
                    </motion.button>
                    <motion.button
                      className="w-full flex items-center space-x-3 px-4 py-3 sm:py-2 text-left text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
                      whileHover={{ x: 4 }}
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>로그아웃</span>
                    </motion.button>
                  </motion.div>
                </>
              )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
      />
      <JoinGroupModal
        isOpen={showJoinGroupModal}
        onClose={() => setShowJoinGroupModal(false)}
      />
      {currentGroup && (
        <GroupSettingsModal
          isOpen={showGroupSettingsModal}
          onClose={() => setShowGroupSettingsModal(false)}
          group={currentGroup}
        />
      )}
    </header>
  );
};

export default Header;