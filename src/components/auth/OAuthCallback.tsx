import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const OAuthCallback: React.FC = () => {
    const navigate = useNavigate();
    const { getCurrentUser } = useAuth();
    const [errorState, setErrorState] = useState<{
        type: string;
        message: string;
        provider?: string;
    } | null>(null);

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                // console.log('OAuth 콜백 처리 시작');

                // URL 파라미터 확인
                const urlParams = new URLSearchParams(window.location.search);
                const error = urlParams.get('error');
                const message = urlParams.get('message');

                if (error) {
                    // console.error('OAuth 에러:', error, message);

                    // 이메일 중복 에러 처리
                    if (error === 'email_already_exists') {
                        const decodedMessage = message ? decodeURIComponent(message) : '이 이메일은 이미 다른 소셜 계정으로 가입되어 있습니다.';
                        setErrorState({
                            type: 'email_duplicate',
                            message: decodedMessage
                        });
                        return;
                    }

                    // 비활성화된 계정 에러
                    if (error === 'user_inactive') {
                        setErrorState({
                            type: 'user_inactive',
                            message: '비활성화된 계정입니다. 관리자에게 문의하세요.'
                        });
                        return;
                    }

                    // 기타 에러
                    const errorMessage = message ? decodeURIComponent(message) : '로그인에 실패했습니다.';
                    setErrorState({
                        type: 'general',
                        message: errorMessage
                    });
                    return;
                }

                // 쿠키 설정을 위해 잠시 대기
                await new Promise(resolve => setTimeout(resolve, 1000));

                // 사용자 정보 확인
                const user = await getCurrentUser();
                if (user) {
                    console.log('OAuth 로그인 성공:', user);
                    navigate('/dashboard', {replace: true});
                } else {
                    console.log('사용자 정보 확인 실패');
                    setErrorState({
                        type: 'general',
                        message: '사용자 정보를 불러올 수 없습니다.'
                    });
                }

            } catch (error) {
                console.error('OAuth 콜백 처리 실패:', error);
                setErrorState({
                    type: 'general',
                    message: '로그인 처리 중 오류가 발생했습니다.'
                });
            }
        };

        handleOAuthCallback();
    }, [navigate, getCurrentUser]);

    const handleReturnToLogin = () => {
        navigate('/login', { replace: true });
    };

    // 에러 상태일 때 에러 화면 표시
    if (errorState) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 p-6">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {errorState.type === 'email_duplicate' ? '이메일 중복' :
                            errorState.type === 'user_inactive' ? '계정 비활성화' : '로그인 실패'}
                    </h2>

                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {errorState.message}
                    </p>

                    {errorState.type === 'email_duplicate' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-800">
                                💡 <strong>해결 방법:</strong><br/>
                                기존에 가입한 소셜 계정으로 로그인해주세요.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleReturnToLogin}
                        className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg py-3 px-6 transition-colors duration-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>로그인 페이지로 돌아가기</span>
                    </button>
                </div>
            </div>
        );
    }

    // 로딩 중일 때 로딩 화면
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