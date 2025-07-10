export interface AiJudgmentRequest {
  situations: {
    [key: string]: string; // 예: { "A": "A의 입장", "B": "B의 입장" }
  };
}

export interface AiJudgmentResponse {
  judgmentResult: string;
  judgmentId: string;
  situations: {
    [key: string]: string;
  };
}

export interface AiJudgmentHistoryResponse {
  judgmentResult: string;
  judgmentId: string;
  situations: {
    [key: string]: string;
  };
  rating?: "up" | "down" | null; // 히스토리 조회 시 rating 정보도 포함될 수 있도록 추가 (선택 사항)
  timestamp: string; // 히스토리 조회 시 타임스탬프 정보도 포함될 수 있도록 추가
}
