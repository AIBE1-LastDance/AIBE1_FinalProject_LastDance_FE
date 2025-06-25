import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

const OAuthCallback: React.FC = () => {
    const navigate = useNavigate();
    const { getCurrentUser } = useAuth();

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                console.log('OAuth 콜백 처리 시작');
                
                // URL 파라미터 확인
                const urlParams = new URLSearchParams(window.location.search);
                const error = urlParams.get('error');
                
                if (error) {
                    console.error('OAuth 에러:', error);

                    if (error === 'user_inactive') {
                        alert('비활성화된 계정입니다. 관리자에게 문의하세요.')
                        navigate('/login');
                        return;
                    }

                    alert('로그인에 실패했습니다: ' + error);
                    navigate('/login');
                    return;
                }

                // 잠시 기다린 후 사용자 정보 확인
                setTimeout(async () => {
                    const user = await getCurrentUser();
                    if (user) {
                        console.log('OAuth 로그인 성공:', user);
                        navigate('/dashboard');
                    } else {
                        console.log('사용자 정보 확인 실패');
                        navigate('/login');
                    }
                }, 1000); // 1초 대기 (서버에서 쿠키 설정이 완료될 시간)
                
            } catch (error) {
                console.error('OAuth 콜백 처리 실패:', error);
                navigate('/login');
            }
        };

        handleOAuthCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">로그인 처리 중...</h2>
                <p className="text-gray-600">잠시만 기다려주세요.</p>
            </div>
        </div>
    );
};

export default OAuthCallback;
