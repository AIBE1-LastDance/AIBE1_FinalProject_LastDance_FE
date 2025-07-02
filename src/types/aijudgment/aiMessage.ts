// types/aijudgment/aiMessage.ts
export interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  rating?: "up" | "down" | null;
  judgmentId?: string;
}

// types/aijudgment/aiMessage.ts
export interface AiJudgmentResponse {
  judgmentResult: string;
  judgmentId: string; // ✅ 반드시 포함되어야 함
}
