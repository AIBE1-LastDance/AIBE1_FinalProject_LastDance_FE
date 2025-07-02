interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  rating?: "up" | "down" | null;
  judgmentId?: string; // ✅ 서버 피드백용 ID
}

interface AiJudgmentResponse {
  judgmentResult: string;
  judgmentId: string; // 서버에서 반환되도록 수정했다고 가정
}
