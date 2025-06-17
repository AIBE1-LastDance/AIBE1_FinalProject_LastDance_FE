// 브라우저 확장 프로그램 간섭 방지 유틸리티
import React from 'react';

/**
 * 확장 프로그램으로 인한 오류를 감지하고 방지합니다
 */
export const initExtensionGuard = () => {
  // 1. 전역 오류 핸들러 설정
  const handleGlobalError = (event: ErrorEvent) => {
    const isExtensionError = 
      event.filename?.includes('content.bundle.js') ||
      event.filename?.includes('extension') ||
      event.filename?.includes('chrome-extension') ||
      event.filename?.includes('moz-extension') ||
      event.error?.stack?.includes('content.bundle.js') ||
      event.error?.stack?.includes('extension');

    if (isExtensionError) {
      console.warn('Extension error detected and ignored:', event.error);
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  };

  // 2. Promise rejection 핸들러 설정
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const isExtensionError = 
      event.reason?.stack?.includes('content.bundle.js') ||
      event.reason?.stack?.includes('extension') ||
      event.reason?.stack?.includes('chrome-extension') ||
      event.reason?.stack?.includes('moz-extension');

    if (isExtensionError) {
      console.warn('Extension promise rejection detected and ignored:', event.reason);
      event.preventDefault();
      return false;
    }
  };

  // 3. DOM 조작 보호
  const protectDOMManipulation = () => {
    // className 속성 보호
    const originalGetAttribute = Element.prototype.getAttribute;
    Element.prototype.getAttribute = function(name: string) {
      try {
        const result = originalGetAttribute.call(this, name);
        return result;
      } catch (error) {
        if (error instanceof TypeError) {
          return '';
        }
        throw error;
      }
    };

    // classList 보호
    const originalClassListContains = DOMTokenList.prototype.contains;
    DOMTokenList.prototype.contains = function(token: string) {
      try {
        return originalClassListContains.call(this, token);
      } catch (error) {
        if (error instanceof TypeError) {
          return false;
        }
        throw error;
      }
    };
  };

  // 4. React 컴포넌트 보호
  const protectReactComponents = () => {
    // 이벤트 핸들러 보호
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(
      type: string, 
      listener: EventListenerOrEventListenerObject | null, 
      options?: boolean | AddEventListenerOptions
    ) {
      if (!listener) return;

      const wrappedListener = function(this: EventTarget, event: Event) {
        try {
          if (typeof listener === 'function') {
            return listener.call(this, event);
          } else if (listener && typeof listener.handleEvent === 'function') {
            return listener.handleEvent(event);
          }
        } catch (error) {
          // 확장 프로그램 관련 오류 필터링
          if (error instanceof TypeError && 
              (error.stack?.includes('content.bundle.js') ||
               error.stack?.includes('extension'))) {
            console.warn('Extension-related event error ignored:', error);
            return;
          }
          throw error;
        }
      };

      return originalAddEventListener.call(this, type, wrappedListener, options);
    };
  };

  // 5. 확장 프로그램 DOM 요소 제거
  const removeExtensionElements = () => {
    const removeElements = () => {
      const selectors = [
        '[class*="extension"]',
        '[id*="extension"]',
        '[class*="translate"]',
        '[id*="translate"]',
        '[class*="chrome-extension"]',
        '[id*="chrome-extension"]',
        'div[style*="position: fixed"][style*="z-index: 2147483647"]',
        'div[style*="position: fixed"][style*="top: 0px"][style*="left: 0px"]'
      ];

      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            if (element.parentNode && !element.closest('#root')) {
              element.remove();
            }
          });
        } catch (error) {
          // 선택자 오류 무시
        }
      });
    };

    // 초기 실행
    removeElements();

    // 주기적 실행
    setInterval(removeElements, 1000);

    // DOM 변화 감지
    const observer = new MutationObserver(() => {
      removeElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  };

  // 6. 확장 프로그램 CSS 무효화
  const neutralizeExtensionCSS = () => {
    const style = document.createElement('style');
    style.textContent = `
      /* 확장 프로그램 요소 숨기기 */
      [class*="extension"]:not(#root *),
      [id*="extension"]:not(#root *),
      [class*="translate"]:not(#root *),
      [id*="translate"]:not(#root *),
      [class*="chrome-extension"]:not(#root *),
      [id*="chrome-extension"]:not(#root *) {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }

      /* 확장 프로그램이 주입하는 고정 요소들 */
      div[style*="position: fixed"][style*="z-index: 2147483647"]:not(#root *) {
        display: none !important;
      }

      /* 앱 컨테이너 보호 */
      #root {
        isolation: isolate;
        position: relative;
        z-index: 1;
      }
    `;
    document.head.appendChild(style);
  };

  // 모든 보호 기능 실행
  window.addEventListener('error', handleGlobalError, true);
  window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      protectDOMManipulation();
      protectReactComponents();
      removeExtensionElements();
      neutralizeExtensionCSS();
    });
  } else {
    protectDOMManipulation();
    protectReactComponents();
    removeExtensionElements();
    neutralizeExtensionCSS();
  }
};

/**
 * 특정 함수를 확장 프로그램 오류로부터 보호합니다
 */
export const protectFunction = <T extends (...args: any[]) => any>(fn: T): T => {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      if (error instanceof TypeError && 
          (error.stack?.includes('content.bundle.js') ||
           error.stack?.includes('extension'))) {
        console.warn('Extension error in protected function:', error);
        return;
      }
      throw error;
    }
  }) as T;
};

/**
 * React 컴포넌트를 확장 프로그램 오류로부터 보호합니다
 */
export const withExtensionGuard = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P) => {
    try {
      return React.createElement(Component, props);
    } catch (error) {
      if (error instanceof TypeError && 
          (error.stack?.includes('content.bundle.js') ||
           error.stack?.includes('extension'))) {
        console.warn('Extension error in component:', Component.name, error);
        return null;
      }
      throw error;
    }
  };
};
