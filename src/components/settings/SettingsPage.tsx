import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {Settings, User, Bell, Save, Camera, Trash2, Wifi, WifiOff, Smartphone, TestTube} from 'lucide-react';
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
    });
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setPreviewImage(e.target.result as string);
            }
        };
        reader.readAsDataURL(file);
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

    // 알림 설정만 저장
    const handleNotificationSave = async () => {
        if (isNotificationSaving) return;
        setIsNotificationSaving(true);
        try {
            await notificationApi.updateMySettings({
                emailEnabled: notifications.emailEnabled,
                scheduleReminder: notifications.scheduleReminder,
                paymentReminder: notifications.paymentReminder,
                checklistReminder: notifications.checklistReminder,
            });
            toast.success('알림 설정이 저장되었습니다.');
        } catch (error) {
            toast.error('알림 설정 저장에 실패했습니다.');
            console.error('Notification settings update error:', error);
        } finally {
            setIsNotificationSaving(false);
        }
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

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">알림 설정</h3>

                    {notificationLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div
                                className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-2">로딩 중...</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(notifications).map(([key, value]) => {
                                const settings = {
                                    emailEnabled: {
                                        label: '이메일 알림',
                                        description: '이메일로 알림을 받습니다'
                                    },
                                    scheduleReminder: {
                                        label: '일정 알림',
                                        description: '일정 시작 15분 전에 알림을 받습니다'
                                    },
                                    paymentReminder: {
                                        label: '정산 알림',
                                        description: '정산 관련 알림을 받습니다'
                                    },
                                    checklistReminder: {
                                        label: '할일 알림',
                                        description: '새로운 할일이나 마감일 알림을 받습니다'
                                    }
                                };

                                const setting = settings[key as keyof typeof settings];

                                return (
                                    <div key={key}
                                         className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{setting.label}</h4>
                                            <p className="text-sm text-gray-600">{setting.description}</p>
                                        </div>

                                        {/* 우리집 앱 색상의 모던 iOS 토글 스위치 */}
                                        <label className="relative inline-flex items-center cursor-pointer group">
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
                                            <div className={`
                                                relative w-14 h-8 transition-all duration-300 ease-in-out rounded-full
                                                ${value
                                                ? 'bg-gradient-to-r from-primary-500 to-primary-600'
                                                : 'bg-gray-300 hover:bg-gray-400'
                                            }
                                                ${notificationLoading ? 'opacity-50 cursor-not-allowed' : ''}
                                                peer-focus:ring-2 peer-focus:ring-primary-500/30
                                            `}>
                                                <div className={`
                                                    absolute top-1 w-6 h-6 bg-white rounded-full 
                                                    shadow-sm transition-all duration-300 ease-in-out
                                                    ${value
                                                    ? 'right-1'
                                                    : 'left-1'
                                                }
                                                `}/>
                                            </div>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* 하이브리드 알림 시스템 상태 */}
                    <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-blue-900">🎯 하이브리드 알림 시스템</h4>
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                SSE → 웹푸시 → 이메일
                            </span>
                        </div>
                        <p className="text-sm text-blue-700 mb-4">
                            실시간 연결 → 백그라운드 알림 → 확실한 이메일 전달 순으로 동작합니다.
                        </p>
                        
                        {/* 1단계: SSE 실시간 연결 */}
                        <div className="mb-3 p-3 bg-white rounded-lg border border-blue-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${isSSEConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <div>
                                        <p className="font-medium text-gray-900 flex items-center">
                                            <Wifi className="w-4 h-4 mr-2" />
                                            1단계: 실시간 연결 (SSE)
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {isSSEConnected ? '✅ 연결됨 - 즉시 알림 수신' : '❌ 연결 끊김 - 2단계로 전환'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={isSSEConnected ? disconnectSSE : connectSSE}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                        isSSEConnected 
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                >
                                    {isSSEConnected ? '연결 해제' : '다시 연결'}
                                </button>
                            </div>
                        </div>

                        {/* 2단계: 웹푸시 백그라운드 알림 */}
                        <div className="mb-3 p-3 bg-white rounded-lg border border-blue-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${
                                        !isWebPushSupported ? 'bg-gray-400' :
                                        isWebPushSubscribed ? 'bg-green-500' : 
                                        notificationPermission === 'granted' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}></div>
                                    <div>
                                        <p className="font-medium text-gray-900 flex items-center">
                                            <Smartphone className="w-4 h-4 mr-2" />
                                            2단계: 백그라운드 알림 (웹푸시)
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {!isWebPushSupported ? '❌ 브라우저 미지원' :
                                             isWebPushSubscribed ? '✅ 구독됨 - 백그라운드 알림 가능' :
                                             notificationPermission === 'granted' ? '⚠️ 권한 있음 - 구독 필요' :
                                             '❌ 권한 필요 - 구독 불가'}
                                        </p>
                                        {!import.meta.env.VITE_VAPID_PUBLIC_KEY || 
                                         import.meta.env.VITE_VAPID_PUBLIC_KEY === 'your_vapid_public_key_here' ? (
                                            <p className="text-xs text-orange-600 mt-1">
                                                ⚠️ VAPID 키가 설정되지 않음 - 관리자가 백엔드에서 키를 생성해야 합니다
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    {notificationPermission !== 'granted' && (
                                        <button
                                            onClick={() => requestNotificationPermission?.()}
                                            className="px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                        >
                                            권한 요청
                                        </button>
                                    )}
                                    {isWebPushSupported && notificationPermission === 'granted' && (
                                        <button
                                            onClick={() => isWebPushSubscribed ? unsubscribeFromWebPush?.() : subscribeToWebPush?.()}
                                            disabled={!import.meta.env.VITE_VAPID_PUBLIC_KEY || 
                                                     import.meta.env.VITE_VAPID_PUBLIC_KEY === 'your_vapid_public_key_here'}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                                !import.meta.env.VITE_VAPID_PUBLIC_KEY || 
                                                import.meta.env.VITE_VAPID_PUBLIC_KEY === 'your_vapid_public_key_here'
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : isWebPushSubscribed 
                                                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                        >
                                            {isWebPushSubscribed ? '구독 해제' : '구독하기'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 3단계: 이메일 확실한 전달 */}
                        <div className="mb-4 p-3 bg-white rounded-lg border border-blue-100">
                            <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${notifications.emailEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 flex items-center">
                                        <Bell className="w-4 h-4 mr-2" />
                                        3단계: 확실한 전달 (이메일)
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {notifications.emailEnabled ? '✅ 활성화 - 모든 알림이 이메일로 전송됨' : '❌ 비활성화 - 이메일 전송 안함'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 테스트 알림 버튼 */}
                        <div className="pt-3 border-t border-blue-200">
                            <button
                                onClick={async () => {
                                    try {
                                        await notificationApi.sendTestNotification({
                                            type: 'SCHEDULE',
                                            title: '테스트 알림',
                                            content: '하이브리드 알림 시스템이 정상적으로 작동합니다! 🎉',
                                            relatedId: 'test-' + Date.now()
                                        });
                                        toast.success('테스트 알림을 전송했습니다.');
                                    } catch (error) {
                                        console.error('테스트 알림 전송 실패:', error);
                                        toast.error('테스트 알림 전송에 실패했습니다.');
                                    }
                                }}
                                className="w-full py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                            >
                                <TestTube className="w-4 h-4" />
                                <span>하이브리드 알림 테스트</span>
                            </button>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                연결된 모든 알림 방식으로 테스트 메시지를 보냅니다
                            </p>
                        </div>
                    </div>

                    {/* 기존 알림 권한 설정 부분을 간소화 */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-medium text-gray-900 mb-2">📧 이메일 알림 설정</h4>
                        <p className="text-sm text-gray-600 mb-3">
                            위 하이브리드 시스템과 별개로 항상 이메일로 알림을 받으려면 이메일 알림을 활성화하세요.
                        </p>
                        <button
                            onClick={handleNotificationSave}
                            disabled={notificationLoading}
                            className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            <Save className="w-4 h-4" />
                            <span>알림 설정 저장</span>
                        </button>
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
                </motion.div>
            </div>
        </div>
    );
};

export default SettingsPage;