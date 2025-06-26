import React from 'react';

interface AvatarProps {
    user?: {
        avatar?: string;
        username?: string;
        nickname?: string;
        provider?: string;
    };
    size?: 'sm' | 'md' | 'lg';
    fallbackBg?: string;
    onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = (
    {
        user,
        size = 'md',
        fallbackBg = 'from-purple-500 to-pink-500',
        onClick
    }) => {

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-24 h-24'  // 설정페이지용 큰 사이즈
    };

    const fontSizeClasses = {
        sm: 'text-sm font-bold',
        md: 'text-lg font-bold',
        lg: 'text-5xl font-bold'  // leading-none 추가
    };

    const containerClass = `${sizeClasses[size]} rounded-full overflow-hidden ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`;

    // Provider별 브랜드 색상 배경
    const getProviderBackground = (provider?: string) => {
        switch (provider) {
            case 'google':
                return 'from-red-500 to-blue-500';  // 구글 브랜드 색상
            case 'naver':
                return 'from-green-500 to-green-600';  // 네이버 초록색
            case 'kakao':
                return 'from-yellow-400 to-yellow-500';  // 카카오 노란색
            default:
                return fallbackBg;  // 기본값
        }
    };

    if (user?.avatar) {
        const avatarUrl = user.avatar.startsWith('http')
            ? user.avatar
            : `${import.meta.env.VITE_API_BASE_URL}${user.avatar}`;

        return (
            <div className={containerClass} onClick={onClick}>
                <img
                    src={avatarUrl}
                    alt="프로필"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // 이미지 로드 실패시 기본 아바타로 교체
                        const target = e.target as HTMLImageElement;
                        const container = target.parentElement;
                        if (container) {
                            const providerBg = getProviderBackground(user?.provider);
                            container.innerHTML = `
                <div class="w-full h-full bg-gradient-to-r ${providerBg} flex items-center justify-center text-white">
                  ${user?.username?.charAt(0) || user?.nickname?.charAt(0) || "U"}
                </div>
              `;
                        }
                    }}
                />
            </div>
        );
    }

    // 프로바이더별 브랜드 배경색 적용
    const backgroundClass = getProviderBackground(user?.provider);

    return (
        <div className={`${containerClass} bg-gradient-to-r ${backgroundClass} flex items-center justify-center text-white`}>
            <span className={`${fontSizeClasses[size]} flex items-center justify-center`}>
                {user?.nickname?.charAt(0) || user?.username?.charAt(0) || "?"}
            </span>
        </div>
    );
};

export default Avatar;
