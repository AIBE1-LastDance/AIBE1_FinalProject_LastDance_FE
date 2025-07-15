import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {Settings, User, Bell, Save, Camera, Trash2, Wifi, WifiOff, Smartphone, TestTube, ArrowRight, Calendar, CreditCard, CheckSquare, Mail, Shield} from 'lucide-react';
import {useAuthStore} from '../../store/authStore';
import toast from 'react-hot-toast';
import {profileApi} from "../../api/profile";
import {notificationApi, NotificationSettingRequest} from "../../api/notifications";
import {AdminAPI} from "../../api/admin";
import Avatar from "../common/Avatar";
import {useSSEStore} from "../../store/sseStore";
import {useNavigate} from "react-router-dom";

const SettingsPage: React.FC = () => {
    const {user, setProcessingAccountDeletion} = useAuthStore();
    const navigate = useNavigate();
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

    // 관리자 권한 확인
    useEffect(() => {
        const checkAdminAuth = async () => {
            if (!user) {
                setIsAdmin(false);
                setAdminCheckLoading(false);
                return;
            }

            try {
                setAdminCheckLoading(true);
                const adminResponse = await AdminAPI.verifyAdmin();
                console.log('Admin auth response:', adminResponse);
                
                // 응답 구조: { success: true, data: { role: "ADMIN" } }
                const isAdminUser = adminResponse?.data?.role === 'ADMIN';
                setIsAdmin(isAdminUser);
                
                console.log('Is admin user:', isAdminUser);
            } catch (error) {
                console.log('Admin auth failed (not admin):', error);
                setIsAdmin(false);
            } finally {
                setAdminCheckLoading(false);
            }
        };

        checkAdminAuth();
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
                    webpushEnabled: data.webpushEnabled || false,
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
                    webpushEnabled: false,
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
        webpushEnabled: false,
        sseEnabled: true,
    });
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminCheckLoading, setAdminCheckLoading] = useState(true);

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
        ...(isAdmin ? [{id: 'admin', label: '관리자 페이지', icon: Shield}] : []),
    ];

    // 디버깅용 로그 추가
    console.log('Current user:', user);
    console.log('User role:', user?.role);
    console.log('Is admin (API check):', isAdmin);
    console.log('Admin check loading:', adminCheckLoading);
    console.log('Tabs:', tabs);

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
        // 첫 클릭: 확인 UI 표시
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            setDeleteConfirmText("");
            return;
        }

        // 두 번째 클릭: 입력값 확인 후 삭제 처리
        if (deleteConfirmText === '지금삭제') {
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
                                    if (window.confirm('정말로 프로필 사진을 삭제하시겠습니까?')) {
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
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none focus:ring-accent-500 focus:border-transparent ${
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:outline-none focus:border-transparent pr-8"
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
                                    showDeleteConfirm && deleteConfirmText === '지금삭제'
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : showDeleteConfirm
                                        ? 'bg-red-400 text-white cursor-not-allowed'
                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                                disabled={showDeleteConfirm && deleteConfirmText !== '지금삭제'}
                            >
                                <Trash2 className="w-4 h-4"/>
                                <span>
                  {showDeleteConfirm ? '정말로 삭제하시겠습니까?' : '계정 삭제'}
                </span>
                            </motion.button>
                            {showDeleteConfirm && (
                                <>
                                <p className="text-xs text-red-600 mt-2">
                                    삭제를 원하시면 "지금삭제"를 입력해주세요.
                                </p>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder='지금삭제'
                                    className='w-full px-4 py-2 mt-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent'
                                />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* 변경사항 저장 버튼 */}
            <div className="flex justify-end mt-8">
                <motion.button
                    onClick={handleSave}
                    disabled={isSaving || (!nicknameState.available && profileData.nickname !== user?.nickname)}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-colors shadow-lg ${
                        isSaving || (!nicknameState.available && profileData.nickname !== user?.nickname)
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-accent-600 text-white hover:bg-accent-700'
                    }`}
                    whileHover={!isSaving && nicknameState.available ? { scale: 1.02 } : {}}
                    whileTap={!isSaving && nicknameState.available ? { scale: 0.98 } : {}}
                >
                    {isSaving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>저장 중...</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            <span>변경사항 저장</span>
                        </>
                    )}
                </motion.button>
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
                {/* 알림 방식 설정 카드 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">알림 방식</h3>
                            <p className="text-sm text-gray-600 mt-1">원하는 방식으로 알림을 받아보세요</p>
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
                            {/* 인앱 알림 */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                                    notifications.sseEnabled
                                        ? 'border-primary-200 bg-primary-50'
                                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                }`}
                            >
                                <div className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            {/* 아이콘 영역 */}
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                notifications.sseEnabled ? 'bg-primary-400' : 'bg-gray-400'
                                            } text-white shadow-sm`}>
                                                <Bell className="w-6 h-6" />
                                            </div>

                                            {/* 텍스트 영역 */}
                                            <div className="flex-1">
                                                <h4 className={`font-semibold text-lg transition-colors ${
                                                    notifications.sseEnabled ? 'text-gray-900' : 'text-gray-600'
                                                }`}>
                                                    인앱 알림
                                                </h4>
                                                <p className={`text-sm mt-1 transition-colors ${
                                                    notifications.sseEnabled ? 'text-gray-700' : 'text-gray-500'
                                                }`}>
                                                    웹페이지 내에서 실시간으로 알림을 받을 수 있어요
                                                </p>
                                            </div>
                                        </div>

                                        {/* 토글 스위치 */}
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.sseEnabled}
                                                onChange={(e) => handleSpecialMethodToggle('sseEnabled', e.target.checked)}
                                                disabled={notificationLoading}
                                                className="sr-only peer"
                                            />
                                            <div className={`relative w-16 h-8 transition-all duration-300 ease-in-out rounded-full shadow-inner ${
                                                notifications.sseEnabled
                                                    ? 'bg-primary-400'
                                                    : 'bg-gray-300'
                                            } ${notificationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <div className={`absolute top-0.5 w-7 h-7 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out ${
                                                    notifications.sseEnabled ? 'right-0.5' : 'left-0.5'
                                                }`}>
                                                    <div className={`w-full h-full rounded-full flex items-center justify-center text-xs transition-colors ${
                                                        notifications.sseEnabled ? 'text-primary-600' : 'text-gray-400'
                                                    }`}>
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>

                            {/* 이메일 알림 */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                                    notifications.emailEnabled
                                        ? 'border-primary-200 bg-primary-50'
                                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                }`}
                            >
                                <div className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            {/* 아이콘 영역 */}
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                notifications.emailEnabled ? 'bg-primary-400' : 'bg-gray-400'
                                            } text-white shadow-sm`}>
                                                <Mail className="w-6 h-6" />
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
                                                    ? 'bg-primary-400'
                                                    : 'bg-gray-300'
                                            } ${notificationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <div className={`absolute top-0.5 w-7 h-7 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out ${
                                                    notifications.emailEnabled ? 'right-0.5' : 'left-0.5'
                                                }`}>
                                                    <div className={`w-full h-full rounded-full flex items-center justify-center text-xs transition-colors ${
                                                        notifications.emailEnabled ? 'text-primary-600' : 'text-gray-400'
                                                    }`}>
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
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
                                        icon: Calendar,
                                        color: 'bg-primary-400'
                                    },
                                    paymentReminder: {
                                        label: '정산 알림',
                                        description: '그룹 정산 및 지출 관련 소식을 전해드려요',
                                        icon: CreditCard,
                                        color: 'bg-primary-400'
                                    },
                                    checklistReminder: {
                                        label: '할일 알림',
                                        description: '새 할일 등록과 마감일을 놓치지 마세요',
                                        icon: CheckSquare,
                                        color: 'bg-primary-400'
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
                                                ? 'border-primary-200 bg-primary-50'
                                                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="p-5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    {/* 아이콘 영역 */}
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                        value ? setting.color : 'bg-gray-400'
                                                    } text-white shadow-sm`}>
                                                        <setting.icon className="w-6 h-6" />
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
                                                            ? 'bg-primary-400'
                                                            : 'bg-gray-300'
                                                    } ${notificationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        <div className={`absolute top-0.5 w-7 h-7 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out ${
                                                            value ? 'right-0.5' : 'left-0.5'
                                                        }`}>
                                                            <div className={`w-full h-full rounded-full flex items-center justify-center text-xs transition-colors ${
                                                                value ? 'text-primary-600' : 'text-gray-400'
                                                            }`}>
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
                                : 'bg-accent-600 text-white hover:bg-accent-700'
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
            </div>
        );
    };

    const renderAdminSettings = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">관리자 도구</h3>
                
                <div className="space-y-4">
                    {/* 관리자 페이지 이동 버튼 */}
                    <motion.button
                        onClick={() => navigate('/admin')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
                    >
                        <div className="flex items-center space-x-3">
                            <Shield className="w-6 h-6" />
                            <div className="text-left">
                                <p className="font-semibold">관리자 페이지</p>
                                <p className="text-sm text-red-100">시스템 관리 및 사용자 관리</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>

                    {/* 관리자 정보 */}
                    <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-red-900">관리자 계정</p>
                                <p className="text-sm text-red-700">
                                    관리자 권한으로 로그인되어 있습니다.
                                </p>
                            </div>
                        </div>
                    </div>
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
            case 'admin':
                return renderAdminSettings();
            default:
                return renderProfileSettings();
        }
    };

    return (
        <div className="space-y-8">

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
                            {adminCheckLoading ? (
                                <div className="flex items-center justify-center py-4">
                                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            if (tab.id === 'admin') {
                                                navigate('/admin');
                                            } else {
                                                setActiveTab(tab.id);
                                            }
                                        }}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                                            activeTab === tab.id
                                                ? 'bg-primary-50 text-primary-600 border border-primary-200'
                                                : tab.id === 'admin'
                                                    ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                                        }`}
                                    >
                                        <tab.icon className="w-5 h-5"/>
                                        <span className="font-medium">{tab.label}</span>
                                        {tab.id === 'admin' && <ArrowRight className="w-4 h-4 ml-auto" />}
                                    </button>
                                ))
                            )}
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