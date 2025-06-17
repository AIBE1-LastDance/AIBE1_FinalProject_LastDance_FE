import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckSquare, CreditCard, Users, Gamepad2, Bot, ArrowRight, ChevronDown, BarChart3, User, ChevronDown as ChevronDownIcon, Settings, LogOut, Bell } from 'lucide-react';
import { FaGoogle, FaComment } from 'react-icons/fa';
import { SiNaver } from 'react-icons/si';
import { useAuthStore } from '../../store/authStore';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeSection, setActiveSection] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleLogin = () => {
    navigate('/login');
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google': return <FaGoogle className="w-4 h-4" />;
      case 'kakao': return <FaComment className="w-4 h-4 text-yellow-500" />;
      case 'naver': return <SiNaver className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  // Scroll progress
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Hero section refs and animations
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(heroProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 0.8]);
  const logoScale = useTransform(heroProgress, [0, 0.5, 1], [1, 1.2, 0.8]);

  // Feature sections
  const features = [
    {
      title: "대시보드",
      subtitle: "한눈에 보는 현황",
      description: "개인과 그룹의 모든 활동을 분석하고 시각화합니다. 할일 완료율, 지출 패턴, 일정 현황을 한 곳에서 확인하세요.",
      icon: BarChart3,
      color: "from-primary-500 to-primary-600",
      image: "/image/Logo.png",
      path: "/dashboard"
    },
    {
      title: "스마트 캘린더",
      subtitle: "일정을 더 스마트하게",
      description: "개인과 그룹 일정을 하나의 캘린더에서 관리하세요. 월간, 주간, 일간 뷰로 일정을 효율적으로 계획할 수 있습니다.",
      icon: Calendar,
      color: "from-primary-500 to-primary-600",
      image: "/image/Logo.png",
      path: "/calendar"
    },
    {
      title: "할일 관리",
      subtitle: "효율적인 작업 분배",
      description: "집안일을 공평하게 분배하고, 진행 상황을 실시간으로 추적하세요. 우선순위 설정과 마감일 알림으로 놓치는 일이 없습니다.",
      icon: CheckSquare,
      color: "from-primary-500 to-primary-600",
      image: "/image/Logo.png",
      path: "/tasks"
    },
    {
      title: "스마트 가계부",
      subtitle: "지출을 투명하게",
      description: "공동 지출을 자동으로 분할하고, 카테고리별 분석을 제공합니다. 월별 지출 패턴과 절약 팁도 확인할 수 있어요.",
      icon: CreditCard,
      color: "from-primary-500 to-primary-600",
      image: "/image/Logo.png",
      path: "/expenses"
    },
    {
      title: "미니게임",
      subtitle: "재미있는 당번 정하기",
      description: "룰렛, 가위바위보, 주사위 등 8가지 다양한 게임으로 당번을 공정하게 정하세요. 게임 결과는 자동으로 기록됩니다.",
      icon: Gamepad2,
      color: "from-primary-500 to-primary-600",
      image: "/image/Logo.png",
      path: "/games"
    },
    {
      title: "AI 도우미",
      subtitle: "똑똑한 생활 조언",
      description: "AI가 여러분의 생활 패턴을 분석하여 맞춤형 조언을 제공합니다. 효율적인 일정 관리와 절약 팁을 받아보세요.",
      icon: Bot,
      color: "from-primary-500 to-primary-600",
      image: "/image/Logo.png",
      path: "/ai-assistant"
    },
    {
      title: "커뮤니티",
      subtitle: "정보 공유와 소통",
      description: "생활팁, 레시피, 청소법 등을 공유하고 다른 사용자들과 소통하세요. 카테고리별로 정리된 유용한 정보들을 만나보세요.",
      icon: Users,
      color: "from-primary-500 to-primary-600",
      image: "/image/Logo.png",
      path: "/community"
    }
  ];

  // Intersection observer for section detection
  useEffect(() => {
    const sections = document.querySelectorAll('.section-observer');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-section') || '0');
            setActiveSection(index);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Section navigation
  const scrollToSection = (index: number) => {
    const section = document.querySelector(`[data-section="${index}"]`);
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  const navigationItems = [
    { icon: BarChart3, label: '대시보드', path: '/dashboard' },
    { icon: Calendar, label: '캘린더', path: '/calendar' },
    { icon: CheckSquare, label: '할일', path: '/tasks' },
    { icon: CreditCard, label: '가계부', path: '/expenses' },
    { icon: Gamepad2, label: '게임', path: '/games' },
    { icon: Bot, label: 'AI 도우미', path: '/ai-assistant' },
    { icon: Users, label: '커뮤니티', path: '/community' },
  ];

  return (
    <div className="bg-white text-gray-900 overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/20 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              className="flex items-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/')}
            >
              <img src="/image/Logo.png" alt="우리.zip" className="w-16 h-16" />
            </motion.div>

            {/* Navigation - 메인페이지에서는 스크롤 네비게이션 */}
            <nav className="hidden lg:flex items-center space-x-2">
              {[
                { label: '대시보드', section: 1, icon: BarChart3 },
                { label: '캘린더', section: 2, icon: Calendar },
                { label: '할일', section: 3, icon: CheckSquare },
                { label: '가계부', section: 4, icon: CreditCard },
                { label: '게임', section: 5, icon: Gamepad2 },
                { label: 'AI 도우미', section: 6, icon: Bot },
                { label: '커뮤니티', section: 7, icon: Users },
              ].map((item) => (
                <motion.button
                  key={item.label}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 text-gray-600 hover:text-[#df6d14] hover:bg-gray-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection(item.section)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </nav>

            {/* User Controls */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Notification Bell */}
                  <div className="relative" ref={notificationRef}>
                    <motion.button
                      className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowNotifications(!showNotifications)}
                    >
                      <Bell className="w-6 h-6 text-gray-600" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </motion.button>

                    {/* Notification Dropdown */}
                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 max-h-96 overflow-hidden z-50"
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
                          <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="text-center py-8">
                                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">새로운 알림이 없습니다.</p>
                              </div>
                            ) : (
                              notifications.map((notification) => (
                                <motion.div
                                  key={notification.id}
                                  className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
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
                      )}
                    </AnimatePresence>
                  </div>

                  {/* User Menu */}
                  <div className="relative" ref={userMenuRef}>
                  <motion.button
                    className="flex items-center p-2 rounded-xl hover:bg-gray-50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      {getProviderIcon(user?.provider || '')}
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ml-2 ${showUserMenu ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                              {getProviderIcon(user?.provider || '')}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                              <div className="text-xs text-gray-500">{user?.email}</div>
                            </div>
                          </div>
                        </div>

                        <motion.button
                          className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                          whileHover={{ x: 4 }}
                          onClick={() => {
                            navigate('/dashboard');
                            setShowUserMenu(false);
                          }}
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>대시보드로 이동</span>
                        </motion.button>
                        <motion.button
                          className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
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
                          className="w-full flex items-center space-x-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                          whileHover={{ x: 4 }}
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>로그아웃</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </div>
                </>
              ) : (
                <motion.button
                  className="bg-primary-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-primary-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogin}
                >
                  로그인
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Side Navigation Indicator */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:flex flex-col space-y-4">
        {[
          { index: 0, label: '홈' },
          { index: 1, label: '대시보드' },
          { index: 2, label: '캘린더' },
          { index: 3, label: '할일' },
          { index: 4, label: '가계부' },
          { index: 5, label: '게임' },
          { index: 6, label: 'AI' },
          { index: 7, label: '커뮤니티' },
          { index: 8, label: '시작하기' }
        ].map((section) => (
          <motion.div
            key={section.index}
            className="flex items-center justify-end group cursor-pointer"
            whileHover={{ x: -10 }}
            onClick={() => scrollToSection(section.index)}
          >
            <motion.div
              className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mr-3"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              {section.label}
            </motion.div>
            <div
              className={`w-3 h-3 rounded-full border-2 transition-all flex-shrink-0 ${
                activeSection === section.index
                  ? 'bg-primary-500 border-primary-500'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            />
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="section-observer min-h-screen flex items-center justify-center relative overflow-hidden pt-20"
        data-section="0"
        style={{ opacity: heroOpacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-100" />
        
        {/* Animated background particles */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary-400 rounded-full opacity-30"
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
              style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
              }}
            />
          ))}
        </div>

        <motion.div 
          className="text-center z-10 px-6 max-w-6xl mx-auto"
          style={{ scale: heroScale }}
        >
          <motion.div
            style={{ scale: logoScale }}
            className="mb-8"
          >
            <img src="/image/Logo.png" alt="우리.zip" className="w-64 h-64 mx-auto mb-8 drop-shadow-2xl" />
          </motion.div>

          <motion.p 
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            개인과 그룹 생활을 하나로 묶어주는 스마트 라이프 플랫폼
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex justify-center items-center"
          >
            <motion.button
              className="group bg-primary-500 hover:bg-primary-600 text-white px-12 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
            >
              시작하기
              <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-16"
          >
            <ChevronDown className="w-6 h-6 mx-auto text-gray-400 animate-bounce" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Feature Sections */}
      {features.map((feature, index) => (
        <FeatureSection
          key={index}
          feature={feature}
          index={index + 1}
          isEven={index % 2 === 0}
        />
      ))}

      {/* CTA Section */}
      <section className="section-observer min-h-screen flex items-center justify-center relative bg-gray-50" data-section="8">
        <div className="text-center z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-light mb-8 text-gray-900">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              더 나은 공동생활을 위한 새로운 경험을 만나보세요
            </p>
            
            <motion.button
              className="bg-primary-500 hover:bg-primary-600 text-white px-12 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
            >
              무료로 시작하기
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-8">
            <img src="/image/Logo.png" alt="우리.zip" className="w-16 h-16" />
          </div>
          <p className="text-gray-500">&copy; 2024 우리.zip. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// Feature Section Component
const FeatureSection: React.FC<{
  feature: any;
  index: number;
  isEven: boolean;
}> = ({ feature, index, isEven }) => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.section
      ref={ref}
      className="section-observer min-h-screen flex items-center justify-center py-20"
      data-section={index.toString()}
      style={{ opacity }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${
          isEven ? '' : 'lg:grid-flow-col-dense'
        }`}>
          {/* Text Content */}
          <motion.div
            className={isEven ? '' : 'lg:col-start-2'}
            initial={{ opacity: 0, x: isEven ? -50 : 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} mb-8`}>
              <feature.icon className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-sm font-medium text-primary-600 mb-4 uppercase tracking-wider">
              {feature.subtitle}
            </h3>
            <h2 className="text-4xl md:text-6xl font-light mb-8 text-gray-900">
              {feature.title}
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              {feature.description}
            </p>

            <motion.button
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
              whileHover={{ x: 10 }}
              onClick={() => navigate(feature.path)}
            >
              <span>자세히 보기</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>

          {/* Visual Content */}
          <motion.div
            className={isEven ? 'lg:col-start-2' : ''}
            style={{ y }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent rounded-3xl" />
              <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full max-w-lg mx-auto"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default HomePage;
