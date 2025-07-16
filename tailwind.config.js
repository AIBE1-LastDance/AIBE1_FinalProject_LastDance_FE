/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Background color
        background: '#FFFFFF',
        
        // Primary color - Soft Orange/Peach theme (파스텔 톤)
        primary: {
          50: '#fef9f7',
          100: '#fdf0ec',
          200: '#fbe0d3',
          300: '#f7c8b1',
          400: '#f2ad87',
          500: '#E69975', // Main primary color
          600: '#d17c56',
          700: '#b06242',
          800: '#914f37',
          900: '#74412e',
          950: '#3f2218',
        },
        
        // Accent color - Soft Blue theme (파스텔 톤)
        accent: {
          50: '#f0f6ff',
          100: '#e1efff', 
          200: '#c7e0ff',
          300: '#a3ccff',
          400: '#7fb0ff',
          500: '#6C92E6', // Main accent color
          600: '#5a7bc7',
          700: '#4a66a8',
          800: '#3c5489',
          900: '#32456c',
          950: '#1f2b42',
        },
        
        // Text color
        text: {
          primary: '#333333',
          secondary: '#666666',
          muted: '#999999',
        },
        
        // Category colors (파스텔 톤으로 변경 - 구분 명확화)
        category: {
          red: '#FFB3B3',        // 파스텔 빨강
          mint: '#B3F5E6',       // 민트 (건강용) - 상쾌한 느낌
          blue: '#B3E0E0',       // 파스텔 청록
          cyan: '#99D6EA',       // 파스텔 시안
          green: '#C4E2C4',      // 파스텔 그린
          yellow: '#FFF2B3',     // 파스텔 노랑
          purple: '#E6B3E6',     // 파스텔 보라
          indigo: '#B3B3FF',     // 파스텔 인디고
          pink: '#ff91cb',       // 파스텔 핑크
          orange: '#FFCC99',     // 파스텔 오렌지 (쇼핑용)
          teal: '#99E6D9',       // 파스텔 틸
          lavender: '#D9B3FF',   // 라벤더 (여행용)
        },
        
        // Priority colors (파스텔 톤으로 변경)
        priority: {
          high: '#FFB3B3',       // 파스텔 빨강
          medium: '#FFDFB3',     // 파스텔 오렌지
          low: '#B3E6B3',        // 파스텔 그린
        },
        
        // Status colors (파스텔 톤으로 변경)
        status: {
          success: '#22C55E',    // 그린
          warning: '#F97316',    // 오렌지
          error: '#f84f4f',      // 라이트 레드
          info: '#60A5FA',       // 라이트 블루
        },
      },
      fontFamily: {
        // 제목용 폰트 - 공고딕 (이사만루)
        title: ['GongGothicMedium', 'sans-serif'],
        // 내용용 폰트 - 프리텐다드
        body: ['Pretendard-Regular', 'sans-serif'],
      },
      screens: {
        'lg': '1120px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};