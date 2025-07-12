/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Background color
        background: '#FFFFFF',
        
        // Primary color - Orange theme (#E69975가 가장 진한색)
        primary: {
          50: '#fef9f7',
          100: '#fdf2ee',
          200: '#fae1d4',
          300: '#f6ccb3',
          400: '#f1b088',
          500: '#E69975', // Main primary color - 가장 진한색
          600: '#d4845f',
          700: '#b86a47',
          800: '#9a5439',
          900: '#7d452f',
          950: '#422317',
        },
        
        // Accent color - Blue theme (#6C92E6가 가장 진한색)
        accent: {
          50: '#f0f6ff',
          100: '#e1efff', 
          200: '#c7e0ff',
          300: '#a3ccff',
          400: '#7fb0ff',
          500: '#6C92E6', // Main accent color - 가장 진한색
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
        
        // Category colors (keep colorful for categorization)
        category: {
          red: '#FF6B6B',
          blue: '#4ECDC4', 
          cyan: '#45B7D1',
          green: '#96CEB4',
          yellow: '#FFEAA7',
          purple: '#DDA0DD',
          indigo: '#6C5CE7',
          pink: '#FD79A8',
          orange: '#FDCB6E',
          teal: '#00B894',
        },
        
        // Priority colors (keep for task/priority classification)
        priority: {
          high: '#EF4444',
          medium: '#F59E0B', 
          low: '#10B981',
        },
        
        // Status colors
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
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
