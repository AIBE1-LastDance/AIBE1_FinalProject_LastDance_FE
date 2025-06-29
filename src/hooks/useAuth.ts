import {useState} from "react";
import {apiClient} from "../utils/api.ts";
import {User} from "../types"
import {useAuthStore} from "../store/authStore.ts";

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const {login, logout: storeLogout} = useAuthStore();

    // 공통 인증 상태 정리 함수
    const clearAuthState = () => {
        console.log('인증 상태 정리 시작')
        // 먼저 스토어의 로그아웃 함수 실행
        storeLogout();

        // 로컬 스토리지에서 모든 인증 관련 항목 제거
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('app-storage-v4');

        // 추가적으로 다른 모든 auth 관련 스토리지도 확인하여 제거
        Object.keys(localStorage).forEach(key => {
            if (key.includes('auth') || key.includes('app-storage')) {
                localStorage.removeItem(key);
            }
        });

        console.log('모든 인증 관련 스토리지가 정리되었습니다.');
    }

    const getSocialLoginUrl = (provider: 'google' | 'kakao' | 'naver') => {
        // 개발환경에서는 프록시를 통해 OAuth 요청
        const baseUrl = import.meta.env.DEV 
            ? ''  // 개발환경: 프록시 사용 (상대경로)
            : (import.meta.env.VITE_API_BASE_URL || 'https://api.lastdance.store'); // 운영환경
        
        return `${baseUrl}/oauth2/authorization/${provider}`;
    };

    const getCurrentUser = async (): Promise<User | null> => {
        try {
            setIsLoading(true);
            console.log('사용자 정보 요청 시작')
            const response = await apiClient.get('/api/v1/auth/me');
            // console.log('/me 응답: ', response.status, response.data);
            const userData = response.data;
            // HTML 응답인지 확인
            if (typeof userData === 'string') {
                console.log('HTML 응답 감지됨 - 인증되지 않은 상태');
                clearAuthState();
                return null;
            }

            // 올바른 사용자 객체인지 확인
            if (userData && typeof userData === 'object' && userData.userId) {
                // 서버 응답을 클라이언트 User 타입에 맞게 변환
                const user: User = {
                    id: userData.userId,  // userId를 id로 매핑
                    username: userData.username,
                    nickname: userData.nickname,
                    email: userData.email,
                    avatar: userData.profileImageUrl,
                    provider: userData.provider.toLowerCase(), // 'GOOGLE' -> 'google'
                    monthlyBudget: userData.monthlyBudget
                };

                console.log('유효한 사용자, 로그인 처리', user);
                login(user);
                return user;
            } else {
                console.log('유효하지 않은 사용자 데이터');
                clearAuthState();
                return null;
            }
        } catch (error) {
            console.error('사용자 정보 가져오기 실패: ', error);
            console.log('오류 상세: ', error.response?.data);
            console.log('오류 상태: ', error.response?.status)
            clearAuthState(); // 토큰 만료, 쿠키 없음시 자동 정리
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await apiClient.post('/api/v1/auth/logout', {}, { timeout: 5000 });
            console.log('서버 로그아웃 요청 성공');
        } catch (error) {
            console.error('로그아웃 실패: ', error);
        } finally {
            // 성공.실패 관계없이 상태 정리
            clearAuthState();

            // 명시적으로 페이지 리로드를 수행하여 모든 상태를 초기화
            // 주석 처리 시 SPA 내에서만 상태 변경
            // window.location.href = '/login';

            setIsLoading(false);
        }
    };

    return {
        isLoading,
        getSocialLoginUrl,
        getCurrentUser,
        logout
    }
}