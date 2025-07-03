// SSE 연결 상태를 디버깅하기 위한 유틸리티

interface SSEDebugInfo {
    timestamp: string;
    event: string;
    details: any;
    userId?: string;
    connectionState?: string;
}

class SSEDebugger {
    private logs: SSEDebugInfo[] = [];
    private maxLogs = 200; // 로그 개수 증가
    private connectionAttempts = 0;
    private lastConnectionTime: string | null = null;

    log(event: string, details?: any, userId?: string) {
        const logEntry: SSEDebugInfo = {
            timestamp: new Date().toISOString(),
            event,
            details,
            userId,
            connectionState: this.getConnectionState()
        };
        
        this.logs.unshift(logEntry);
        
        // 연결 시도 카운팅
        if (event.includes('연결 시작') || event.includes('connect')) {
            this.connectionAttempts++;
            this.lastConnectionTime = logEntry.timestamp;
        }
        
        // 로그 개수 제한
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }
        
        // 개발 환경에서만 콘솔에 출력
        if (import.meta.env.DEV) {
            console.log(`[SSE Debug] ${event}:`, details);
        }
    }

    private getConnectionState(): string {
        if (typeof window === 'undefined') return 'unknown';
        
        // SSE 연결 상태 확인 (실제 EventSource 객체에 접근 필요)
        return 'checking'; // 실제 구현에서는 SSEManager 상태 확인
    }

    getLogs(): SSEDebugInfo[] {
        return [...this.logs];
    }

    getRecentLogs(count: number = 10): SSEDebugInfo[] {
        return this.logs.slice(0, count);
    }

    clearLogs() {
        this.logs = [];
        this.connectionAttempts = 0;
        this.lastConnectionTime = null;
    }

    // 연결 분석 리포트
    getConnectionReport(): {
        totalAttempts: number;
        lastConnectionTime: string | null;
        recentErrors: SSEDebugInfo[];
        connectionPattern: string[];
        duplicateConnections: SSEDebugInfo[];
    } {
        const recentErrors = this.logs
            .filter(log => log.event.includes('오류') || log.event.includes('error'))
            .slice(0, 10);
            
        const connectionPattern = this.logs
            .filter(log => log.event.includes('연결') || log.event.includes('connect'))
            .slice(0, 20)
            .map(log => `${log.timestamp.substring(11, 19)} - ${log.event}`);
            
        // 중복 연결 감지 (1초 이내 연속 연결 시도)
        const duplicateConnections: SSEDebugInfo[] = [];
        for (let i = 0; i < this.logs.length - 1; i++) {
            const current = this.logs[i];
            const next = this.logs[i + 1];
            
            if (current.event.includes('연결 시작') && next.event.includes('연결 시작')) {
                const timeDiff = new Date(current.timestamp).getTime() - new Date(next.timestamp).getTime();
                if (timeDiff < 1000) { // 1초 이내
                    duplicateConnections.push(current);
                }
            }
        }

        return {
            totalAttempts: this.connectionAttempts,
            lastConnectionTime: this.lastConnectionTime,
            recentErrors,
            connectionPattern,
            duplicateConnections
        };
    }

    // 브라우저 콘솔에서 사용할 수 있도록 전역에 등록
    attachToWindow() {
        if (typeof window !== 'undefined' && import.meta.env.DEV) {
            (window as any).sseDebugger = this;
            console.log('🔧 SSE 디버거가 전역에 등록되었습니다. 사용법:');
            console.log('  window.sseDebugger.getStatus() - 현재 상태 확인');
            console.log('  window.sseDebugger.getRecentLogs(20) - 최근 로그 확인');
            console.log('  window.sseDebugger.getConnectionReport() - 연결 분석 리포트');
            console.log('  window.sseDebugger.clearLogs() - 로그 초기화');
        }
    }

    // 현재 상태 요약
    getStatus(): {
        totalLogs: number;
        recentEvents: string[];
        lastEventTime: string | null;
        connectionAttempts: number;
        potentialIssues: string[];
    } {
        const potentialIssues: string[] = [];
        
        // 문제 패턴 감지
        const recentLogs = this.logs.slice(0, 50);
        const connectionLogs = recentLogs.filter(log => log.event.includes('연결'));
        
        if (connectionLogs.length > 10) {
            potentialIssues.push('🚨 과도한 연결 시도 감지됨');
        }
        
        const errorLogs = recentLogs.filter(log => log.event.includes('오류'));
        if (errorLogs.length > 5) {
            potentialIssues.push('🚨 반복적인 오류 발생');
        }

        const skipLogs = recentLogs.filter(log => log.event.includes('스킵'));
        if (skipLogs.length > 15) {
            potentialIssues.push('⚠️ 중복 연결 시도가 많이 차단됨');
        }
        
        return {
            totalLogs: this.logs.length,
            recentEvents: this.logs.slice(0, 5).map(log => log.event),
            lastEventTime: this.logs[0]?.timestamp || null,
            connectionAttempts: this.connectionAttempts,
            potentialIssues
        };
    }
}

export const sseDebugger = new SSEDebugger();

// 개발 환경에서 전역 접근 가능하도록 설정
if (import.meta.env.DEV) {
    sseDebugger.attachToWindow();
}
