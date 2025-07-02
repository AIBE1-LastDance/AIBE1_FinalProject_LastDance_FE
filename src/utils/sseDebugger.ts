// SSE 연결 상태를 디버깅하기 위한 유틸리티

interface SSEDebugInfo {
    timestamp: string;
    event: string;
    details: any;
}

class SSEDebugger {
    private logs: SSEDebugInfo[] = [];
    private maxLogs = 100;

    log(event: string, details?: any) {
        const logEntry: SSEDebugInfo = {
            timestamp: new Date().toISOString(),
            event,
            details
        };
        
        this.logs.unshift(logEntry);
        
        // 로그 개수 제한
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }
        
        // 개발 환경에서만 콘솔에 출력
        if (import.meta.env.DEV) {
            console.log(`[SSE Debug] ${event}:`, details);
        }
    }

    getLogs(): SSEDebugInfo[] {
        return [...this.logs];
    }

    getRecentLogs(count: number = 10): SSEDebugInfo[] {
        return this.logs.slice(0, count);
    }

    clearLogs() {
        this.logs = [];
    }

    // 브라우저 콘솔에서 사용할 수 있도록 전역에 등록
    attachToWindow() {
        if (typeof window !== 'undefined' && import.meta.env.DEV) {
            (window as any).sseDebugger = this;
        }
    }

    // 현재 상태 요약
    getStatus(): {
        totalLogs: number;
        recentEvents: string[];
        lastEventTime: string | null;
    } {
        return {
            totalLogs: this.logs.length,
            recentEvents: this.logs.slice(0, 5).map(log => log.event),
            lastEventTime: this.logs[0]?.timestamp || null
        };
    }
}

export const sseDebugger = new SSEDebugger();

// 개발 환경에서 전역 접근 가능하도록 설정
if (import.meta.env.DEV) {
    sseDebugger.attachToWindow();
}
