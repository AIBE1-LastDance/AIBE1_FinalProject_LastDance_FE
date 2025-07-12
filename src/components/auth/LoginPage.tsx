import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {FaGoogle, FaComment} from 'react-icons/fa';
import {SiNaver} from 'react-icons/si';
import { Home, Calendar, CheckSquare, CreditCard, Gamepad2, Bot, Users, ExternalLink } from 'lucide-react';
import {useAuthStore} from '../../store/authStore';
import {useNavigate} from 'react-router-dom';
import {User} from '../../types';
import toast from 'react-hot-toast';
import {useAuth} from '../../hooks/useAuth';
import Modal from '../common/Modal';
import TermsContent from '../legal/TermsContent';
import PrivacyPolicyContent from '../legal/PrivacyPolicyContent';

const LoginPage: React.FC = () => {
    const {login} = useAuthStore();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const {getSocialLoginUrl} = useAuth();
    const [modalContent, setModalContent] = useState<'terms' | 'privacy' | null>(null);

    const logoUrl = import.meta.env.VITE_LOGO_URL;

    const handleSocialLogin = async (provider: 'google' | 'kakao' | 'naver') => {
        setIsLoading(provider);

        const loginUrl = getSocialLoginUrl(provider);
        window.location.href = loginUrl;
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        if (urlParams.get('expired')) {
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
    }, []);

    const features = [
        {icon: Calendar, title: '스마트 캘린더', description: '일정 관리'},
        {icon: CheckSquare, title: '할일 관리', description: '할 일 목록'},
        {icon: CreditCard, title: '가계부 관리', description: '지출 추적'},
        {icon: Gamepad2, title: '재밌는 게임', description: '당번 정하기'},
        {icon: Bot, title: 'AI 도우미', description: '똑똑한 조언'},
        {icon: Users, title: '커뮤니티', description: '정보 공유'},
        {icon: ExternalLink, title: '청년정책', description: '정책 정보'},
        {icon: Home, title: '그룹 관리', description: '공동생활'},
    ];

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-6">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Branding */}
                <motion.div
                    initial={{opacity: 0, x: -50}}
                    animate={{opacity: 1, x: 0}}
                    transition={{duration: 0.8}}
                    className="flex flex-col justify-center text-center relative"
                >
                    {/* 로고 - 절대 위치로 문구 위에 추가 (문구 위치에 영향 없음) */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 200 }}
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-[120%] z-10"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-200 to-primary-300 rounded-full blur-xl opacity-30 animate-pulse"></div>
                            <img 
                                src={logoUrl} 
                                alt="우리.zip" 
                                className="relative w-20 h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 drop-shadow-lg"
                            />
                        </div>
                    </motion.div>

                    {/* 메인 콘텐츠 (로고 없을 때와 동일한 세로 가운데 정렬) */}
                    <div className="flex flex-col">
                        {/* 제목 - 원래 위치 유지 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-title font-bold text-center text-gray-900 leading-tight mb-6">
                                우리의 하루를,<br/>
                                <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                                    우리.zip에 담다
                                </span>
                            </h1>
                        </motion.div>

                        {/* 설명 - 원래 위치 유지 */}
                        <motion.p 
                            className="text-lg lg:text-xl text-center text-gray-600 mb-12 leading-relaxed font-body"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            하우스메이트와 함께하는 스마트한 공동생활 관리 플랫폼
                        </motion.p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.6, delay: index * 0.1}}
                                className="text-center"
                            >
                                <div
                                    className="w-12 h-12 bg-gradient-to-r from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <feature.icon className="w-6 h-6 text-primary-600"/>
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                                <p className="text-sm text-gray-600">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Side - Login Form */}
                <motion.div
                    initial={{opacity: 0, x: 50}}
                    animate={{opacity: 1, x: 0}}
                    transition={{duration: 0.8, delay: 0.2}}
                    className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 flex flex-col justify-center"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">시작하기</h2>
                        <p className="text-gray-600">소셜 계정으로 간편하게 로그인하세요</p>
                    </div>

                    <div className="space-y-4">
                        {/* Google Login - 공식 디자인 가이드 */}
                        <motion.button
                            className="w-full flex items-center justify-center space-x-3 bg-white border border-[#dadce0] hover:shadow-md rounded-lg py-3 px-4 transition-all duration-200 group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSocialLogin('google')}
                            disabled={isLoading !== null}
                        >
                            {isLoading === 'google' ? (
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-[#4285f4] rounded-full animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            )}
                            <span className="font-medium text-[#3c4043] text-sm">
        {isLoading === 'google' ? '로그인 중...' : 'Google로 로그인'}
    </span>
                        </motion.button>

                        {/* Kakao Login - 공식 디자인 가이드 */}
                        <motion.button
                            className="w-full flex items-center justify-center space-x-3 bg-[#FEE500] hover:bg-[#fdd800] rounded-lg py-3 px-4 transition-all duration-200 group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSocialLogin('kakao')}
                            disabled={isLoading !== null}
                        >
                            {isLoading === 'kakao' ? (
                                <div className="w-5 h-5 border-2 border-[#3c1e1e] border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3c1e1e">
                                    <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                                </svg>
                            )}
                            <span className="font-medium text-[#3c1e1e] text-sm">
        {isLoading === 'kakao' ? '로그인 중...' : '카카오 로그인'}
    </span>
                        </motion.button>

                        {/* Naver Login - 공식 디자인 가이드 */}
                        <motion.button
                            className="w-full flex items-center justify-center space-x-3 bg-[#03C75A] hover:bg-[#02b351] rounded-lg py-3 px-4 transition-all duration-200 group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSocialLogin('naver')}
                            disabled={isLoading !== null}
                        >
                            {isLoading === 'naver' ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                                    <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/>
                                </svg>
                            )}
                            <span className="font-medium text-white text-sm">
        {isLoading === 'naver' ? '로그인 중...' : '네이버 로그인'}
    </span>
                        </motion.button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                        <p className="text-sm text-gray-500">
                            로그인하면 <button onClick={() => setModalContent('terms')} className="text-primary-600 hover:underline">이용약관</button> 및{' '}
                            <button onClick={() => setModalContent('privacy')} className="text-primary-600 hover:underline">개인정보처리방침</button>에 동의하게 됩니다.
                        </p>
                    </div>
                </motion.div>
            </div>
            <Modal 
                isOpen={modalContent !== null}
                onClose={() => setModalContent(null)}
                title={modalContent === 'terms' ? '이용약관' : '개인정보처리방침'}
            >
                {modalContent === 'terms' && <TermsContent />}
                {modalContent === 'privacy' && <PrivacyPolicyContent />}
            </Modal>
        </div>
    );
};

export default LoginPage;