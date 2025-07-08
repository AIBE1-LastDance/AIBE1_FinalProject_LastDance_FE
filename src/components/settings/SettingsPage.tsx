import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {Settings, User, Bell, Save, Camera, Trash2, Wifi, WifiOff, Smartphone, TestTube, ArrowRight} from 'lucide-react';
import {useAuthStore} from '../../store/authStore';
import toast from 'react-hot-toast';
import {profileApi} from "../../api/profile";
import {notificationApi, NotificationSettingRequest} from "../../api/notifications";
import Avatar from "../common/Avatar";
import {useSSEStore} from "../../store/sseStore";

const SettingsPage: React.FC = () => {
    const {user, setProcessingAccountDeletion} = useAuthStore();
    const {
        isSSEConnected,
        isWebPushSupported,
        isWebPushSubscribed,
        notificationPermission,
        requestNotificationPermission,
        subscribeToWebPush,
        unsubscribeFromWebPush,
        connectSSE,
        disconnectSSE
    } = useSSEStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState({
        name: user?.username || '',
        nickname: user?.nickname || '',
        avatar: user?.avatar || '',
        monthlyBudget: user?.monthlyBudget || 0
    });
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [hasImageChange, setHasImageChange] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isNotificationSaving, setIsNotificationSaving] = useState(false);


    // user가 변경될 때마다 profileData 업데이트
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.username || '',
                nickname: user.nickname || '',
                avatar: user.avatar || '',
                monthlyBudget: user.monthlyBudget || 0
            });
        }
    }, [user]);

    // 알림 설정 로드
    useEffect(() => {
        const loadNotificationSettings = async () => {
            try {
                setNotificationLoading(true);
                console.log('Loading started, notificationLoading:', true);

                const data = await notificationApi.getMySettings();
                console.log('API Response:', data);

                setNotifications({
                    emailEnabled: data.emailEnabled || false,
                    scheduleReminder: data.scheduleReminder || false,
                    paymentReminder: data.paymentReminder || false,
                    checklistReminder: data.checklistReminder || false,
                    webpushEnabled: data.webpushEnabled ?? true,
                    sseEnabled: data.sseEnabled ?? true,
                });

                console.log('Notifications set, setting loading to false');
            } catch (error) {
                console.error('Failed to load notification settings:', error);
                // 에러 시 기본값 유지
                setNotifications({
                    emailEnabled: false,
                    scheduleReminder: false,
                    paymentReminder: false,
                    checklistReminder: false,
                    webpushEnabled: true,
                    sseEnabled: true
                });
            } finally {
                setNotificationLoading(false);
                console.log('Loading finished, notificationLoading:', false);
            }
        };

        if (user) {
            loadNotificationSettings();
        }
    }, [user]);

    // 닉네임 상태
    const [nicknameState, setNicknameState] = useState<{
        checking: boolean;
        available: boolean;
        message: string;
    }>({
        checking: false,
        available: false,
        message: ''
    });

    // 닉네임 체크 함수
    const checkNicknameAvailability = async (nickname: string) => {
        if (!nickname || nickname.length < 2) {
            setNicknameState({
                checking: false,
                available: false,
                message: ''
            });
            return;
        }

        // 현재 닉네임과 같으면 체크하지 않음
        if (nickname === user?.nickname) {
            setNicknameState({
                checking: false,
                available: true,
                message: ''
            });
            return;
        }

        setNicknameState({
            checking: true,
            available: false,
            message: '확인 중...'
        });

        try {
            const result = await profileApi.checkNickname(nickname);

            // data: true = 사용 가능, data: false = 사용 불가능
            const isAvailable = result.data === true;
            setNicknameState({
                checking: false,
                available: isAvailable,
                message: isAvailable ? '사용 가능한 닉네임입니다' : '이미 사중 중인 닉네임입니다'
            });
        } catch (error) {
            console.error('Nickname check error:', error);
            setNicknameState({
                checking: false,
                available: false,
                message: '닉네임 확인에 실패했습니다.'
            })
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (profileData.nickname) {  // 닉네임이 있으면 항상 체크
                checkNicknameAvailability(profileData.nickname);
            } else {
                setNicknameState({
                    checking: false,
                    available: false,
                    message: ''
                });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [profileData.nickname, user?.nickname]);

    const [notifications, setNotifications] = useState({
        emailEnabled: true,
        scheduleReminder: true,
        paymentReminder: true,
        checklistReminder: true,
        webpushEnabled: true,
        sseEnabled: true,
    });
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // SSE/웹푸시 특별 처리 함수
    const handleSpecialMethodToggle = async (methodKey: string, enabled: boolean) => {
        try {
            if (methodKey === 'sseEnabled') {
                setNotifications(prev => ({ ...prev, sseEnabled: enabled }));

                const currentSettings = await notificationApi.getMySettings();
                await notificationApi.updateMySettings({
                    ...currentSettings,
                    sseEnabled: enabled
                });

                if (enabled) {
                    connectSSE?.();
                    toast.success('실시간 알림이 활성화되었습니다.');
                } else {
                    disconnectSSE?.();
                    toast.success('실시간 알림이 비활성화되었습니다.');
                }
            } else if (methodKey === 'webpushEnabled') {
                if (enabled) {
                    const success = await subscribeToWebPush?.();
                    if (success) {
                        setNotifications(prev => ({ ...prev, webpushEnabled: true }));
                    }
                } else {
                    const success = await unsubscribeFromWebPush?.();
                    if (success) {
                        setNotifications(prev => ({ ...prev, webpushEnabled: false }));
                    }
                }
            }
        } catch (error) {
            console.error('특별 메서드 토글 실패:', error);
            toast.error('설정 변경에 실패했습니다.');
        }
    };

    const tabs = [
        {id: 'profile', label: '프로필 정보', icon: User},
        {id: 'notifications', label: '알림', icon: Bell},
    ];

    const handleProfileChange = (field: string, value: string) => {
        if (field === 'monthlyBudget') {
            const numericValue = parseNumber(value) || 0;
            const MAX_BUDGET = 1000000000; // 10억원

            if (numericValue > MAX_BUDGET) {
                toast.error(`예산은 최대 ${formatNumber(MAX_BUDGET)}원까지 설정 가능합니다.`);
                return;
            }

            if (numericValue < 0) {
                toast.error('예산은 0원 이상이어야 합니다.');
                return;
            }

            setProfileData(prev => ({...prev, [field]: numericValue}));
        } else {
            setProfileData(prev => ({...prev, [field]: value}));
        }
    };

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // 파일 형식 체크
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('JPG, PNG, GIF 파일만 업로드 가능합니다.');
            event.target.value = ''; // 파일 선택 초기화
            return;
        }

        // 파일 크기 체크
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error('파일 크기는 5MB 이하여야 합니다.');
            event.target.value = '';
            return;
        }

        setSelectedFile(file);
        setHasImageChange(true);

        // 미리보기 이미지 생성
        const render = new FileReader();
        render.onload = (e) => {
            if (e.target?.result) {
                setPreviewImage(e.target.result as string);
            }
        };
        render.readAsDataURL(file);
    };

    const handleDeleteAccount = async () => {
        if (showDeleteConfirm) {
            try {
                setProcessingAccountDeletion(true);

                await profileApi.deleteAccount(); // 200응답

                // 로그아웃 처리 후 이동
                const {logout} = useAuthStore.getState();
                toast.success('계정이 삭제되었습니다.');
                logout();
                window.location.href = '/';

            } catch (error) {
                toast.error('계정 삭제에 실패했습니다');
            } finally {
                setProcessingAccountDeletion(false);
            }
        } else {
            setShowDeleteConfirm(true);
            setTimeout(() => setShowDeleteConfirm(false), 5000); // 5초 후 자동으로 확인 상태 해제
        }
    };

    const handleSave = async () => {
        if (isSaving) return;

        // 닉네임 체크
        if (profileData.nickname !== user?.nickname && !nicknameState.available) {
            toast.error('사용할 수 없는 닉네임입니다.');
            return;
        }

        setIsSaving(true);

        try {
            let updatedAvatar = profileData.avatar;
            // 이미지 변경되었으면 업로드
            if (hasImageChange && selectedFile) {
                const response = await profileApi.uploadAvatar(selectedFile);
                updatedAvatar = response.data.profileImageUrl;

                // 로컬 상태 업데이트
                setProfileData(prev => ({...prev, avatar: updatedAvatar}));
            }

            // 프로필 정보 업데이트
            await profileApi.updateProfile({
                nickname: profileData.nickname,
                monthlyBudget: profileData.monthlyBudget
            });

            // 알림 설정 업데이트
            await notificationApi.updateMySettings({
                emailEnabled: notifications.emailEnabled,
                scheduleReminder: notifications.scheduleReminder,
                paymentReminder: notifications.paymentReminder,
                checklistReminder: notifications.checklistReminder,
                webpushEnabled: notifications.webpushEnabled,
                sseEnabled: notifications.sseEnabled,
            });

            // 전역상태 업데이트
            const {updateUser} = useAuthStore.getState();
            updateUser({
                ...user,
                nickname: profileData.nickname,
                monthlyBudget: profileData.monthlyBudget,
                avatar: updatedAvatar
            });

            setPreviewImage(null);
            setSelectedFile(null);
            setHasImageChange(false);

            toast.success('정보가 수정되었습니다.');
        } catch (error) {
            toast.error('정보 수정에 실패했습니다.');
            console.error('Profile update error: ', error);
        } finally {
            setIsSaving(false);
        }
    };

    // 이미지 취소
    const handleImageCancel = () => {
        setPreviewImage(null);
        setSelectedFile(null);
        setHasImageChange(false);
        // 파일 input 초기화
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    }

    // 금액 포맷팅
    const formatNumber = (num: number): string => {
        return num.toLocaleString('ko-KR');
    };
    const parseNumber = (str: string): number => {
        return parseInt(str.replace(/,/g, '')) || 0;
    };

    const renderProfileSettings = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">개인정보 수정</h3>

                {/* 프로필 사진 */}
                <div className="flex items-center space-x-6 mb-6">
                    <div className="relative">
                        {user && (
                            <Avatar
                                user={{
                                    avatar: previewImage || profileData.avatar,
                                    username: profileData.name,
                                    nickname: profileData.nickname,
                                    provider: user.provider
                                }}
                                size="lg"
                            />
                        )}
                        <label
                            className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                            <Camera className="w-4 h-4 text-white"/>
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/gif" // 허용할 파일 형식 명시
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900">프로필 사진</h4>
                        <p className="text-sm text-gray-600">JPG, PNG, GIF 파일만 업로드 가능 (최대 5MB)
                        </p>
                        <div className="flex space-x-4 mt-1">
                            <button
                                onClick={async () => {
                                    try {
                                        await profileApi.deleteAvatar();
                                        // 로컬 상태 업데이트
                                        setProfileData(prev => ({...prev, avatar: ''}));

                                        // 전역 상태 업데이트
                                        const {updateUser} = useAuthStore.getState();
                                        updateUser({
                                            ...user,
                                            avatar: ''
                                        })

                                        toast.success('프로필 사진이 삭제되었습니다.')
                                    } catch (error) {
                                        toast.error('이미지 삭제에 실패했습니다.');
                                        console.error('Profile image delete error: ', error);
                                    }
                                }}
                                className="text-sm text-red-600 hover:text-red-700"
                            >
                                사진 제거
                            </button>
                            {hasImageChange && (
                                <button
                                    onClick={handleImageCancel}
                                    className="text-sm text-gray-600 hover:text-gray-800"
                                >
                                    변경 취소
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 개인정보 입력 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                        <input
                            type="text"
                            // value={profileData.name}
                            value={user?.username || ''}
                            // onChange={(e) => handleProfileChange('name', e.target.value)}
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="실명을 입력하세요"
                        />
                        <p className="text-xs text-gray-500 mt-1">이름은 변경할 수 없습니다</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">닉네임</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={profileData.nickname}
                                onChange={(e) => handleProfileChange('nickname', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                    nicknameState.available ? 'border-green-500' :
                                        !nicknameState.available ? 'border-red-500' :
                                            'border-gray-300'
                                }`}
                                placeholder="사용할 닉네임을 입력하세요"
                            />
                            {nicknameState.checking && (
                                <div className="absolute right-3 top-3">
                                    <div
                                        className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                        <p className={`text-xs mt-1 ${
                            nicknameState.available ? 'text-green-600' :
                                !nicknameState.available ? 'text-red-600' :
                                    'text-gray-500'
                        }`}>
                            {nicknameState.message || (!profileData.nickname ? '사용할 닉네임을 입력하세요' : '')}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">개인 한 달 예산</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formatNumber(profileData.monthlyBudget)} // 콤마 추가된 형태로 표시
                                onChange={(e) => {
                                    const numericValue = parseNumber(e.target.value);
                                    if (numericValue <= 1000000000) { // 10억원 이하만 입력 허용
                                        handleProfileChange('monthlyBudget', numericValue.toString());
                                    }
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-8"
                                placeholder="0"
                            />
                            <span className="absolute right-3 top-3 text-gray-500">원</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">개인 한 달 지출 목표 금액을 설정하세요</p>
                    </div>
                    <div>
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
                                whileHover={{scale: 1.02}}
                                whileTap={{scale: 0.98}}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                    showDeleteConfirm
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                            >
                                <Trash2 className="w-4 h-4"/>
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

    const renderNotificationSettings = () => {
        console.log('Rendering notification settings, loading:', notificationLoading);
        console.log('Current notifications state:', notifications);

        const specificNotifications = ['scheduleReminder', 'paymentReminder', 'checklistReminder'];
        const activeSpecificCount = specificNotifications.filter(key => notifications[key as keyof typeof notifications]).length;

        return (
            <div className="space-y-6">
                {/* 이메일 알림 설정 카드 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">이메일 알림</h3>
                            <p className="text-sm text-gray-600 mt-1">중요한 알림을 이메일로 받아보세요</p>
                        </div>
                    </div>

                    {notificationLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-gray-600 text-sm">설정을 불러오는 중...</p>
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                                notifications.emailEnabled
                                    ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50'
                                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                            }`}
                        >
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        {/* 아이콘 영역 */}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-gradient-to-r ${
                                            notifications.emailEnabled ? 'from-orange-400 to-amber-400' : 'from-gray-400 to-gray-500'
                                        } text-white shadow-sm`}>
                                            📧
                                        </div>

                                        {/* 텍스트 영역 */}
                                        <div className="flex-1">
                                            <h4 className={`font-semibold text-lg transition-colors ${
                                                notifications.emailEnabled ? 'text-gray-900' : 'text-gray-600'
                                            }`}>
                                                이메일 알림
                                            </h4>
                                            <p className={`text-sm mt-1 transition-colors ${
                                                notifications.emailEnabled ? 'text-gray-700' : 'text-gray-500'
                                            }`}>
                                                아래 선택한 알림들을 이메일로도 받을 수 있어요
                                            </p>
                                        </div>
                                    </div>

                                    {/* 토글 스위치 */}
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notifications.emailEnabled}
                                            onChange={(e) => setNotifications(prev => ({
                                                ...prev,
                                                emailEnabled: e.target.checked
                                            }))}
                                            disabled={notificationLoading}
                                            className="sr-only peer"
                                        />
                                        <div className={`relative w-16 h-8 transition-all duration-300 ease-in-out rounded-full shadow-inner ${
                                            notifications.emailEnabled
                                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-primary-200'
                                                : 'bg-gray-300'
                                        } ${notificationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <div className={`absolute top-0.5 w-7 h-7 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out ${
                                                notifications.emailEnabled ? 'right-0.5' : 'left-0.5'
                                            }`}>
                                                <div className={`w-full h-full rounded-full flex items-center justify-center text-xs transition-colors ${
                                                    notifications.emailEnabled ? 'text-primary-600' : 'text-gray-400'
                                                }`}>
                                                    {notifications.emailEnabled ? '✓' : '○'}
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* 밑줄 제거 */}
                        </motion.div>
                    )}
                </div>

                {/* 세부 알림 설정 카드 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">알림 설정</h3>
                            <p className="text-sm text-gray-600 mt-1">원하는 알림을 선택하여 받아보세요</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Bell className="w-5 h-5 text-primary-600"/>
                            <span className="text-sm text-primary-600 font-medium">
                            {activeSpecificCount}/3 활성화
                        </span>
                        </div>
                    </div>

                    {notificationLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-gray-600 text-sm">설정을 불러오는 중...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {specificNotifications.map((key, index) => {
                                const value = notifications[key as keyof typeof notifications];
                                const settings = {
                                    scheduleReminder: {
                                        label: '일정 알림',
                                        description: '일정 시작 15분 전에 미리 알려드려요',
                                        icon: '📅',
                                        color: 'from-orange-400 to-amber-400'
                                    },
                                    paymentReminder: {
                                        label: '정산 알림',
                                        description: '그룹 정산 및 지출 관련 소식을 전해드려요',
                                        icon: '💰',
                                        color: 'from-orange-400 to-amber-400'
                                    },
                                    checklistReminder: {
                                        label: '할일 알림',
                                        description: '새 할일 등록과 마감일을 놓치지 마세요',
                                        icon: '✅',
                                        color: 'from-orange-400 to-amber-400'
                                    }
                                };

                                const setting = settings[key as keyof typeof settings];

                                return (
                                    <motion.div
                                        key={key}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                                            value
                                                ? 'border-primary-200 bg-gradient-to-r from-primary-50 to-primary-100/50'
                                                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="p-5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    {/* 아이콘 영역 */}
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-gradient-to-r ${
                                                        value ? setting.color : 'from-gray-400 to-gray-500'
                                                    } text-white shadow-sm`}>
                                                        {setting.icon}
                                                    </div>

                                                    {/* 텍스트 영역 */}
                                                    <div className="flex-1">
                                                        <h4 className={`font-semibold text-lg transition-colors ${
                                                            value ? 'text-gray-900' : 'text-gray-600'
                                                        }`}>
                                                            {setting.label}
                                                        </h4>
                                                        <p className={`text-sm mt-1 transition-colors ${
                                                            value ? 'text-gray-700' : 'text-gray-500'
                                                        }`}>
                                                            {setting.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* 토글 스위치 */}
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={value}
                                                        onChange={(e) => setNotifications(prev => ({
                                                            ...prev,
                                                            [key]: e.target.checked
                                                        }))}
                                                        disabled={notificationLoading}
                                                        className="sr-only peer"
                                                    />
                                                    <div className={`relative w-16 h-8 transition-all duration-300 ease-in-out rounded-full shadow-inner ${
                                                        value
                                                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-primary-200'
                                                            : 'bg-gray-300'
                                                    } ${notificationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        <div className={`absolute top-0.5 w-7 h-7 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out ${
                                                            value ? 'right-0.5' : 'left-0.5'
                                                        }`}>
                                                            <div className={`w-full h-full rounded-full flex items-center justify-center text-xs transition-colors ${
                                                                value ? 'text-primary-600' : 'text-gray-400'
                                                            }`}>
                                                                {value ? '✓' : '○'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        {/* 밑줄 제거 */}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}


                </div>
                {/* Save Button - 설정 영역 내 우측 하단 */}
                <div className="flex justify-end mt-8">
                    <motion.button
                        onClick={handleSave}
                        disabled={isSaving || (!nicknameState.available && profileData.nickname !== user?.nickname)}
                        className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-colors shadow-lg ${
                            isSaving || (!nicknameState.available && profileData.nickname !== user?.nickname)
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                        whileHover={!isSaving && nicknameState.available ? {scale: 1.02} : {}}
                        whileTap={!isSaving && nicknameState.available ? {scale: 0.98} : {}}
                    >
                        {isSaving ? (
                            <>
                                <div
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                                <span>저장 중...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5"/>
                                <span>변경사항 저장</span>
                            </>
                        )}
                    </motion.button>
                </div>

                {/* 하이브리드 알림 시스템 카드 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">스마트 알림 시스템</h3>
                            <p className="text-sm text-gray-600 mt-1">실시간 연결과 백그라운드 알림으로 놓치는 알림이 없어요</p>
                        </div>
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                            실시간 • 백그라운드
                        </div>
                    </div>

                    {/* 시스템 흐름도 */}
                    <div className="relative mb-6">
                        <div className="flex items-center justify-between">
                            {/* 1단계 */}
                            <div className="flex flex-col items-center space-y-2 flex-1">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                                    isSSEConnected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                    <Wifi className="w-8 h-8" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-sm">실시간 연결</p>
                                    <p className={`text-xs ${isSSEConnected ? 'text-green-600' : 'text-red-600'}`}>
                                        {isSSEConnected ? '연결됨' : '연결 끊김'}
                                    </p>
                                </div>
                            </div>

                            {/* 화살표 */}
                            <div className="flex-shrink-0 px-4 flex items-center">
                                <ArrowRight className="w-6 h-6 text-gray-400" />
                            </div>

                            {/* 2단계 */}
                            <div className="flex flex-col items-center space-y-2 flex-1">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                                    isWebPushSubscribed ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                                }`}>
                                    <Smartphone className="w-8 h-8" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-sm">백그라운드</p>
                                    <p className={`text-xs ${isWebPushSubscribed ? 'text-blue-600' : 'text-gray-400'}`}>
                                        {isWebPushSubscribed ? '구독됨' : '미구독'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 상세 설정 카드들 */}
                    <div className="space-y-4">
                        {/* SSE 연결 설정 */}
                        <div className={`p-4 rounded-xl border-2 transition-all ${
                            isSSEConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${isSSEConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <div>
                                        <p className="font-medium text-gray-900">실시간 연결 (SSE)</p>
                                        <p className="text-sm text-gray-600">
                                            {isSSEConnected ? '웹페이지가 열려있으면 즉시 알림을 받을 수 있어요' : '연결이 끊어져 실시간 알림을 받을 수 없어요'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        const newSSEEnabled = !isSSEConnected;

                                        // 🔥 설정만 업데이트하고, 실제 연결/해제는 useNotifications에서 감지
                                        setNotifications(prev => ({ ...prev, sseEnabled: newSSEEnabled }));

                                        try {
                                            const currentSettings = await notificationApi.getMySettings();
                                            await notificationApi.updateMySettings({
                                                ...currentSettings,
                                                sseEnabled: newSSEEnabled
                                            });

                                            // 설정 저장 후 SSE 연결 상태에 따라 연결/해제
                                            if (newSSEEnabled) {
                                                connectSSE?.();
                                                toast.success('실시간 알림이 활성화되었습니다.');
                                            } else {
                                                disconnectSSE?.();
                                                toast.success('실시간 알림이 비활성화되었습니다.');
                                            }
                                        } catch (error) {
                                            console.error('SSE 설정 저장 실패:', error);
                                            toast.error('설정 저장에 실패했습니다.');
                                            // 에러 시 설정 되돌리기
                                            setNotifications(prev => ({ ...prev, sseEnabled: !newSSEEnabled }));
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        isSSEConnected
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                >
                                    {isSSEConnected ? '연결 해제' : '다시 연결'}
                                </button>
                            </div>
                        </div>

                        {/* 웹푸시 설정 */}
                        <div className={`p-4 rounded-xl border-2 transition-all ${
                            isWebPushSubscribed ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${
                                        isWebPushSubscribed ? 'bg-blue-500' : 'bg-gray-400'
                                    }`}></div>
                                    <div>
                                        <p className="font-medium text-gray-900">백그라운드 알림 (웹푸시)</p>
                                        <p className="text-sm text-gray-600">
                                            {isWebPushSubscribed
                                                ? '웹페이지를 닫아도 브라우저 알림을 받을 수 있어요'
                                                : '브라우저 알림 권한이 필요해요'}
                                        </p>
                                        {!isWebPushSupported && (
                                            <p className="text-xs text-orange-600 mt-1">⚠️ 현재 브라우저에서 지원되지 않습니다</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    {notificationPermission !== 'granted' && (
                                        <button
                                            onClick={() => requestNotificationPermission?.()}
                                            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                        >
                                            권한 요청
                                        </button>
                                    )}
                                    {isWebPushSupported && notificationPermission === 'granted' && (
                                        <button
                                            onClick={async () => {
                                                if (isWebPushSubscribed) {
                                                    const success = await unsubscribeFromWebPush?.();
                                                    if (success) {
                                                        setNotifications(prev => ({ ...prev, webpushEnabled: false }));

                                                        // 👇 즉시 백엔드에 저장
                                                        try {
                                                            const currentSettings = await notificationApi.getMySettings();
                                                            await notificationApi.updateMySettings({
                                                                ...currentSettings,
                                                                webpushEnabled: false
                                                            });
                                                            toast.success('웹푸시 알림이 비활성화되었습니다.');
                                                        } catch (error) {
                                                            console.error('웹푸시 설정 저장 실패:', error);
                                                            toast.error('설정 저장에 실패했습니다.');
                                                        }
                                                    }
                                                } else {
                                                    const success = await subscribeToWebPush?.();
                                                    if (success) {
                                                        setNotifications(prev => ({ ...prev, webpushEnabled: true }));

                                                        // 👇 즉시 백엔드에 저장
                                                        try {
                                                            const currentSettings = await notificationApi.getMySettings();
                                                            await notificationApi.updateMySettings({
                                                                ...currentSettings,
                                                                webpushEnabled: true
                                                            });
                                                            toast.success('웹푸시 알림이 활성화되었습니다.');
                                                        } catch (error) {
                                                            console.error('웹푸시 설정 저장 실패:', error);
                                                            toast.error('설정 저장에 실패했습니다.');
                                                        }
                                                    }
                                                }
                                            }}
                                            disabled={!import.meta.env.VITE_VAPID_PUBLIC_KEY ||
                                                import.meta.env.VITE_VAPID_PUBLIC_KEY === 'your_vapid_public_key_here'}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                !import.meta.env.VITE_VAPID_PUBLIC_KEY ||
                                                import.meta.env.VITE_VAPID_PUBLIC_KEY === 'your_vapid_public_key_here'
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : isWebPushSubscribed
                                                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                            }`}
                                        >
                                            {isWebPushSubscribed ? '구독 해제' : '구독하기'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6}}
                className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-8 text-white"
            >
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                        <Settings className="w-8 h-8"/>
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
                    initial={{opacity: 0, x: -20}}
                    animate={{opacity: 1, x: 0}}
                    transition={{duration: 0.6, delay: 0.1}}
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
                                    <tab.icon className="w-5 h-5"/>
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{opacity: 0, x: 20}}
                    animate={{opacity: 1, x: 0}}
                    transition={{duration: 0.6, delay: 0.2}}
                    className="lg:col-span-3 relative"
                >
                    {renderContent()}
                </motion.div>
            </div>
        </div>
    );
};

export default SettingsPage;