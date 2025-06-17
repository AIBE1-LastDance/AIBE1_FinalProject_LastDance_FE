import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGoogle, FaComment } from 'react-icons/fa';
import { SiNaver } from 'react-icons/si';
import { Home, Calendar, CreditCard, Gamepad2, Bot, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'google' | 'kakao' | 'naver') => {
    setIsLoading(provider);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUsers = {
      google: {
        id: 'google_user_123',
        name: '김우리',
        email: 'woori@gmail.com',
        provider: 'google' as const,
        avatar: undefined,
      },
      kakao: {
        id: 'kakao_user_456',
        name: '박집사',
        email: 'jipsa@kakao.com',
        provider: 'kakao' as const,
        avatar: undefined,
      },
      naver: {
        id: 'naver_user_789',
        name: '이하우스',
        email: 'house@naver.com',
        provider: 'naver' as const,
        avatar: undefined,
      }
    };

    const mockUser: User = mockUsers[provider];
    
    login(mockUser);
    toast.success(`${provider.toUpperCase()}로 로그인되었습니다!`);
    setIsLoading(null);
    navigate('/');
  };

  const features = [
    { icon: Calendar, title: '스마트 캘린더', description: '일정 관리' },
    { icon: CreditCard, title: '가계부 관리', description: '지출 추적' },
    { icon: Gamepad2, title: '재밌는 게임', description: '당번 정하기' },
    { icon: Bot, title: 'AI 도우미', description: '똑똑한 조언' },
    { icon: Users, title: '커뮤니티', description: '정보 공유' },
    { icon: Home, title: '그룹 관리', description: '공동생활' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left"
        >
          <div className="flex items-center justify-center lg:justify-start mb-8">
            <img src="/image/Logo.png" alt="우리.zip" className="w-32 h-32" />
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            우리의 하루를,<br />
            <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
              우리.zip에 담다
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            하우스메이트와 함께하는 스마트한 공동생활 관리 플랫폼
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">시작하기</h2>
            <p className="text-gray-600">소셜 계정으로 간편하게 로그인하세요</p>
          </div>

          <div className="space-y-4">
            {/* Google Login */}
            <motion.button
              className="w-full flex items-center justify-center space-x-4 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-2xl py-4 px-6 transition-all duration-200 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading !== null}
            >
              {isLoading === 'google' ? (
                <div className="w-6 h-6 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
              ) : (
                <FaGoogle className="w-6 h-6 text-red-500" />
              )}
              <span className="font-semibold text-gray-700 group-hover:text-gray-900">
                {isLoading === 'google' ? '로그인 중...' : 'Google로 시작하기'}
              </span>
            </motion.button>

            {/* Kakao Login */}
            <motion.button
              className="w-full flex items-center justify-center space-x-4 bg-yellow-400 hover:bg-yellow-500 rounded-2xl py-4 px-6 transition-all duration-200 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialLogin('kakao')}
              disabled={isLoading !== null}
            >
              {isLoading === 'kakao' ? (
                <div className="w-6 h-6 border-2 border-yellow-600 border-t-yellow-800 rounded-full animate-spin" />
              ) : (
                <FaComment className="w-6 h-6 text-yellow-800" />
              )}
              <span className="font-semibold text-yellow-800 group-hover:text-yellow-900">
                {isLoading === 'kakao' ? '로그인 중...' : '카카오로 시작하기'}
              </span>
            </motion.button>

            {/* Naver Login */}
            <motion.button
              className="w-full flex items-center justify-center space-x-4 bg-green-500 hover:bg-green-600 rounded-2xl py-4 px-6 transition-all duration-200 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialLogin('naver')}
              disabled={isLoading !== null}
            >
              {isLoading === 'naver' ? (
                <div className="w-6 h-6 border-2 border-green-300 border-t-white rounded-full animate-spin" />
              ) : (
                <SiNaver className="w-6 h-6 text-white" />
              )}
              <span className="font-semibold text-white group-hover:text-green-50">
                {isLoading === 'naver' ? '로그인 중...' : '네이버로 시작하기'}
              </span>
            </motion.button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              로그인하면 <a href="#" className="text-primary-600 hover:underline">이용약관</a> 및{' '}
              <a href="#" className="text-primary-600 hover:underline">개인정보처리방침</a>에 동의하게 됩니다.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;