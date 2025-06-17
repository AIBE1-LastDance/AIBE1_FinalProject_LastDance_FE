import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// import { initExtensionGuard } from './utils/extensionGuard.ts';

// 브라우저 확장 프로그램 간섭 방지 초기화 (임시 비활성화)
// initExtensionGuard();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
