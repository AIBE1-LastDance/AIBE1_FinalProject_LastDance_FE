import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Save, Camera, Trash2, Upload } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { mode } = useAppStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    nickname: user?.name || '',
    avatar: user?.avatar || ''
  });
  const [notifications, setNotifications] = useState({
    expenses: true,
    tasks: true,
    events: true,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const tabs = [
    { id: 'profile', label: '프로필 정보', icon: User },
    { id: 'notifications', label: '알림', icon: Bell },
  ];

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = () => {
    if (showDeleteConfirm) {
      // 실제 계정 삭제 로직
      toast.success('계정이 삭제되었습니다.');
      // 로그아웃 처리 등
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 5000); // 5초 후 자동으로 확인 상태 해제
    }
  };

  const handleSave = () => {
    // 설정 저장 로직
    toast.success('설정이 저장되었습니다.');
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">개인정보 수정</h3>
        
        {/* 프로필 사진 */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
              {profileData.avatar ? (
                <img 
                  src={profileData.avatar} 
                  alt="프로필" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {profileData.name?.[0] || 'U'}
                </span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">프로필 사진</h4>
            <p className="text-sm text-gray-600">JPG, PNG 파일을 업로드할 수 있습니다</p>
            <button
              onClick={() => setProfileData(prev => ({ ...prev, avatar: '' }))}
              className="text-sm text-red-600 hover:text-red-700 mt-1"
            >
              사진 제거
            </button>
          </div>
        </div>

        {/* 개인정보 입력 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => handleProfileChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="실명을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">닉네임</label>
            <input
              type="text"
              value={profileData.nickname}
              onChange={(e) => handleProfileChange('nickname', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="사용할 닉네임을 입력하세요"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다</p>
          </div>
        </div>
      </div>

      {/* 계정 삭제 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">계정 관리</h3>
        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-red-900 mb-1">계정 삭제</h4>
              <p className="text-sm text-red-700 mb-4">
                계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                이 작업은 되돌릴 수 없습니다.
              </p>
              <motion.button
                onClick={handleDeleteAccount}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showDeleteConfirm
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {showDeleteConfirm ? '정말로 삭제하시겠습니까?' : '계정 삭제'}
                </span>
              </motion.button>
              {showDeleteConfirm && (
                <p className="text-xs text-red-600 mt-2">
                  5초 내에 다시 클릭하면 계정이 삭제됩니다.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">알림 설정</h3>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => {
            const settings = {
              expenses: {
                label: '지출 정산 알림',
                description: '지출 정산 요청이나 완료 시 알림을 받습니다'
              },
              tasks: {
                label: '할일 알림',
                description: '새로운 할일이나 마감일 알림을 받습니다'
              },
              events: {
                label: '일정 알림',
                description: '일정 시작 15분 전에 알림을 받습니다'
              }
            };
            
            const setting = settings[key as keyof typeof settings];
            
            return (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-medium text-gray-900">{setting.label}</h4>
                  <p className="text-sm text-gray-600">{setting.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">알림 권한 설정</h4>
          <p className="text-sm text-blue-700 mb-3">
            브라우저에서 알림을 받으려면 알림 권한을 허용해야 합니다.
          </p>
          <button
            onClick={() => {
              if ('Notification' in window) {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    toast.success('알림 권한이 허용되었습니다.');
                  } else {
                    toast.error('알림 권한이 거부되었습니다.');
                  }
                });
              }
            }}
            className="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            알림 권한 요청
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-8 text-white"
      >
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">설정</h1>
            <p className="text-primary-100">계정 및 알림 설정을 관리하세요</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-600 border border-primary-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-3 relative"
        >
          {renderContent()}
          
          {/* Save Button - 설정 영역 내 우측 하단 */}
          <div className="flex justify-end mt-8">
            <motion.button
              onClick={handleSave}
              className="flex items-center space-x-3 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="w-5 h-5" />
              <span>변경사항 저장</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;