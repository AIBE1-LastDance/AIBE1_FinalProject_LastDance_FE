import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CheckSquare,
  CreditCard,
  Users,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Gamepad2,
  Bot,
  BarChart3,
  ToggleLeft,
  ToggleRight,
  Bell,
  ExternalLink,
} from "lucide-react";
import { FaGoogle, FaComment } from "react-icons/fa";
import { SiNaver } from "react-icons/si";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { useNotificationStore } from "../../store/notificationStore";
import { useSSEStore } from "../../store/sseStore";
import { useNavigate, useLocation } from "react-router-dom";
import CreateGroupModal from "../groups/CreateGroupModal";
import JoinGroupModal from "../groups/JoinGroupModal";
import GroupSettingsModal from "../groups/GroupSettingsModal";
import { useAuth } from "../../hooks/useAuth.ts";
import Avatar from "../common/Avatar";
import toast from "react-hot-toast";

const Header: React.FC = () => {
  const { user, logout: storeLogout } = useAuthStore();
  const { logout } = useAuth();
  const {
    mode,
    setMode,
    currentGroup,
    joinedGroups,
    setCurrentGroup,
    loadMyGroups,
  } = useAppStore();
  const { getUserNotifications, unreadCount, markAsRead, markAllAsRead } =
    useNotificationStore();
  const { isSSEConnected } = useSSEStore();
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

  // 현재 사용자의 알림만 가져오기
  const notifications = getUserNotifications();

  // 그룹 모드 전환 가능 여부 확인
  const canSwitchToGroup = joinedGroups.length > 0;
  const isDisabled = mode === "group" && !canSwitchToGroup;

  // 사용자가 로그인되어 있을 때 그룹 목록 로드
  useEffect(() => {
    if (isAuthenticated && joinedGroups.length === 0) {
      loadMyGroups();
    }
  }, [isAuthenticated, loadMyGroups, joinedGroups.length]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  const handleModeToggle = () => {
    // 그룹 모드 전환시 그룹 없으면 차단
    if (mode === "personal" && joinedGroups.length === 0) {
      toast.error("먼저 그룹을 만들거나 참여해 주세요!");
      return;
    }

    setMode(mode === "personal" ? "group" : "personal");
    setShowUserMenu(false);
  };

  const formatTimeAgo = (timestamp: Date | string) => {
    const now = new Date();
    const targetTime =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;

    // 유효한 Date 객체인지 확인
    if (!(targetTime instanceof Date) || isNaN(targetTime.getTime())) {
      return "시간 알 수 없음";
    }

    const diffInMs = now.getTime() - targetTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    return `${diffInDays}일 전`;
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success("모든 알림을 읽음 처리했습니다.");
  };

  const handleNotificationClick = (
    notificationId: string,
    url?: string,
    relatedId?: string,
    type?: string
  ) => {
    // 알림을 읽음 처리
    markAsRead(notificationId);

    // URL이 있으면 해당 페이지로 이동
    if (url) {
      navigate(url);
    } else if (relatedId && type) {
      // relatedId와 type을 사용해서 상세 페이지로 이동
      let detailUrl = "/dashboard";
      switch (type) {
        case "SCHEDULE":
          detailUrl = `/calendar?eventId=${relatedId}`;
          break;
        case "PAYMENT":
          detailUrl = `/expenses?splitId=${relatedId}`;
          break;
        case "CHECKLIST":
          detailUrl = `/tasks?taskId=${relatedId}`;
          break;
        default:
          // type이 있지만 relatedId만 있는 경우에도 해당 페이지로 이동
          switch (type) {
            case "SCHEDULE":
              detailUrl = "/calendar";
              break;
            case "PAYMENT":
              detailUrl = "/expenses";
              break;
            case "CHECKLIST":
              detailUrl = "/tasks";
              break;
            default:
              detailUrl = "/dashboard";
          }
      }
      navigate(detailUrl);
    } else if (type) {
      // relatedId는 없지만 type만 있는 경우 해당 페이지의 메인으로 이동
      switch (type) {
        case "SCHEDULE":
          navigate("/calendar");
          break;
        case "PAYMENT":
          navigate("/expenses");
          break;
        case "CHECKLIST":
          navigate("/tasks");
          break;
        default:
          navigate("/dashboard");
      }
    } else {
      // 아무 정보도 없으면 대시보드로 이동
      navigate("/dashboard");
    }

    // 알림 드롭다운 닫기
    setShowNotifications(false);
  };

  const getNotificationTypeConfig = (type: string) => {
    const configs = {
      SCHEDULE: {
        icon: "📅",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-500",
      },
      PAYMENT: {
        icon: "💳",
        bgColor: "bg-green-50",
        borderColor: "border-green-500",
      },
      CHECKLIST: {
        icon: "✅",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-500",
      },
    };
    return configs[type as keyof typeof configs] || configs.SCHEDULE;
  };

  const navigationItems = [
    { icon: BarChart3, label: "대시보드", path: "/dashboard" },
    { icon: Calendar, label: "캘린더", path: "/calendar" },
    { icon: CheckSquare, label: "할일", path: "/tasks" },
    { icon: CreditCard, label: "가계부", path: "/expenses" },
    ...(mode === "personal"
      ? [
          { icon: Gamepad2, label: "게임", path: "/games" },
          { icon: Bot, label: "AI 도우미", path: "/ai-assistant" },
        ]
      : [
          { icon: Gamepad2, label: "게임", path: "/games" },
          { icon: Bot, label: "AI 도우미", path: "/ai-assistant" },
        ]),
    { icon: Users, label: "커뮤니티", path: "/community" },
    { icon: ExternalLink, label: "청년정책", path: "/youth-policy" },
  ];

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "google":
        return <FaGoogle className="w-4 h-4" />;
      case "kakao":
        return <FaComment className="w-4 h-4 text-yellow-500" />;
      case "naver":
        return <SiNaver className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
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
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}
          >
            <img
              src="/image/Logo.png"
              alt="우리.zip"
              className="w-12 h-12 sm:w-16 sm:h-16"
            />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => (
              <motion.button
                key={item.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  location.pathname === item.path
                    ? "text-primary-600 bg-primary-50 shadow-sm"
                    : "text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium hidden lg:block whitespace-nowrap">
                  {item.label}
                </span>
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
                <div className="relative">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                  {/* SSE 연결 상태 표시 */}
                  <div
                    className={`absolute -top-1 -left-1 w-2 h-2 rounded-full ${
                      isSSEConnected ? "bg-green-500" : "bg-gray-400"
                    }`}
                    title={isSSEConnected ? "SSE 연결됨" : "SSE 연결 끊김"}
                  />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </motion.button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    {/* Mobile Backdrop */}
                    <div
                      className="fixed inset-0 bg-black/20 z-40 sm:hidden"
                      onClick={() => setShowNotifications(false)}
                    />

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
                          <div className="flex items-center space-x-1">
                            {unreadCount > 0 && (
                              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                                {unreadCount}개 안읽음
                              </span>
                            )}
                            {/* SSE 연결 상태 */}
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-medium ${
                                isSSEConnected
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {isSSEConnected ? "실시간" : "오프라인"}
                            </span>
                          </div>
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
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
                            <p className="text-gray-500">
                              새로운 알림이 없습니다.
                            </p>
                            {!isSSEConnected && (
                              <p className="text-xs text-gray-400 mt-2">
                                실시간 알림이 비활성화되어 있습니다.
                              </p>
                            )}
                          </div>
                        ) : (
                          notifications.map((notification) => {
                            const typeConfig = getNotificationTypeConfig(
                              notification.type
                            );

                            return (
                              <motion.div
                                key={notification.id}
                                className={`px-4 py-4 sm:py-3 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 cursor-pointer border-l-4 group ${
                                  notification.read
                                    ? "border-transparent bg-white hover:shadow-sm"
                                    : `${typeConfig.borderColor} ${typeConfig.bgColor} hover:shadow-md`
                                } ${
                                  notification.url ||
                                  notification.relatedId ||
                                  notification.type
                                    ? "hover:border-blue-300"
                                    : ""
                                }`}
                                whileHover={{ x: 4, scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() =>
                                  handleNotificationClick(
                                    notification.id,
                                    notification.url,
                                    notification.relatedId,
                                    notification.type
                                  )
                                }
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                                    {notification.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p
                                        className={`text-sm font-medium truncate ${
                                          notification.read
                                            ? "text-gray-700"
                                            : "text-gray-900"
                                        }`}
                                      >
                                        {notification.title}
                                      </p>
                                      <div className="flex items-center space-x-2">
                                        {(notification.url ||
                                          notification.relatedId ||
                                          notification.type) && (
                                          <div className="flex items-center space-x-1">
                                            <ExternalLink className="w-3 h-3 text-blue-500" />
                                            <span className="text-xs text-blue-500 font-medium">
                                              보기
                                            </span>
                                          </div>
                                        )}
                                        {!notification.read && (
                                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                        )}
                                      </div>
                                    </div>
                                    <p
                                        className={`text-sm mt-1 ${
                                            notification.read
                                                ? "text-gray-500"
                                                : "text-gray-700"
                                        } group-hover:text-gray-800 transition-colors`}
                                    >
                                      {notification.content}
                                    </p>
                                    <div className="flex items-center justify-between mt-1">
                                      <p className="text-xs text-gray-400">
                                        {formatTimeAgo(notification.timestamp)}
                                      </p>
                                      <span
                                        className={`text-xs px-2 py-1 rounded-full ${
                                          notification.type === "SCHEDULE"
                                            ? "bg-blue-100 text-blue-600"
                                            : notification.type === "PAYMENT"
                                            ? "bg-green-100 text-green-600"
                                            : notification.type === "CHECKLIST"
                                            ? "bg-purple-100 text-purple-600"
                                            : "bg-gray-100 text-gray-600"
                                        }`}
                                      >
                                        {notification.type === "SCHEDULE"
                                          ? "일정"
                                          : notification.type === "PAYMENT"
                                          ? "결제"
                                          : notification.type === "CHECKLIST"
                                          ? "할일"
                                          : "알림"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </div>
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
                {user && <Avatar user={user} size={"md"} />}
                <ChevronDown
                  className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform ml-1 sm:ml-2 ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                />
              </motion.button>

              {/* User Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <>
                    {/* Mobile Backdrop */}
                    <div
                      className="fixed inset-0 bg-black/20 z-40 sm:hidden"
                      onClick={() => setShowUserMenu(false)}
                    />

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
                          {user && <Avatar user={user} size={"md"} />}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user?.nickname}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user?.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mode Toggle */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {mode === "personal" ? (
                              <ToggleLeft className="w-5 h-5 text-primary-600" />
                            ) : (
                              <ToggleRight className="w-5 h-5 text-primary-600" />
                            )}
                            <span className="text-sm font-medium text-gray-700">
                              모드 변경
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <motion.button
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                                isDisabled
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : mode === "personal"
                                  ? "bg-white text-primary-600 border border-primary-600 hover:bg-primary-50"
                                  : "bg-primary-600 text-white hover:bg-primary-700"
                              }`}
                              whileHover={isDisabled ? {} : { scale: 1.05 }}
                              whileTap={isDisabled ? {} : { scale: 0.95 }}
                              onClick={handleModeToggle}
                              disabled={isDisabled}
                            >
                              {mode === "personal" ? "개인 모드" : "그룹 모드"}
                            </motion.button>
                            {mode === "personal" && !canSwitchToGroup && (
                              <span className="text-xs text-gray-400 mt-1">
                                그룹에 먼저 참여하세요
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Group Selector - only show in group mode */}
                      {(mode === "group" || joinedGroups.length === 0) && (
                        <div className="px-4 py-3 border-b border-gray-100">
                          {mode === "group" && joinedGroups.length > 0 && (
                            <>
                              <div className="text-xs font-medium text-gray-500 mb-2">
                                현재 그룹
                              </div>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {joinedGroups.map((group) => (
                                  <motion.div
                                    key={group.id}
                                    className={`w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors rounded-lg ${
                                      currentGroup?.id === group.id
                                        ? "bg-primary-50 border border-primary-200"
                                        : ""
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
                                        <div className="text-sm font-medium text-gray-900 truncate">
                                          {group.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {group.members.length}명
                                        </div>
                                      </div>
                                      {currentGroup?.id === group.id && (
                                        <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></div>
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
                                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                                      >
                                        <Settings className="w-4 h-4" />
                                      </motion.button>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            </>
                          )}
                          <div
                            className={`${
                              mode === "group" && joinedGroups.length > 0
                                ? "mt-3 pt-2 border-t border-gray-100"
                                : ""
                            } space-y-1`}
                          >
                            <motion.button
                              className="w-full flex items-center space-x-2 px-3 py-1.5 text-left text-primary-600 hover:bg-primary-50 transition-colors rounded-lg text-sm"
                              whileHover={{ x: 2 }}
                              onClick={() => {
                                setShowCreateGroupModal(true);
                                setShowUserMenu(false);
                              }}
                            >
                              <span>+ 새 그룹 만들기</span>
                            </motion.button>
                            <motion.button
                              className="w-full flex items-center space-x-2 px-3 py-1.5 text-left text-primary-600 hover:bg-primary-50 transition-colors rounded-lg text-sm"
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
                          navigate("/settings");
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
          onGroupUpdate={loadMyGroups}
        />
      )}
    </header>
  );
};

export default Header;
