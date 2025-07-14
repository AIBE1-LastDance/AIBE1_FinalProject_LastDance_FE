export interface ParticipantSituation {
  name: string;
  situation: string;
}

export interface AiJudgmentRequest {
  situations: { [key: string]: string }; // 참가자 이름을 키로 하는 Map<string, string>으로 변경
}
// 이 파일은 백엔드의 AiJudgmentResponseDTO와 일치해야 합니다.
export interface AiJudgmentResponse {
  judgmentResult: string;
  judgmentId: string | null; // UUID를 문자열로 변환하므로 string
  situations: { [key: string]: string }; // Map<String, String>에 해당
}

export interface AiJudgmentHistoryResponse {
  judgmentResult: string;
  judgmentId: string;
  situations: { [key: string]: string }; // Map<string, string>으로 변경
  rating?: "up" | "down" | null;
  timestamp: string;
}
