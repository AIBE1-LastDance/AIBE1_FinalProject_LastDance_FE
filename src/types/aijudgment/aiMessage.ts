// types/aijudgment/aiMessage.ts
export interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  rating?: "up" | "down" | null;
  judgmentId?: string;
}

export interface AiJudgmentRequest {
  situations: {
    [key: string]: string; // 예: { "A": "A의 입장", "B": "B의 입장" }
  };
}

export interface AiJudgmentResponse {
  judgmentResult: string;
  judgmentId: string;
}
