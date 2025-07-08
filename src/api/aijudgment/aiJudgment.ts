import { apiClient } from "../../utils/api";
import type { AiJudgmentResponse } from "../../types/aijudgment/aiMessage";

/**
 * 갈등 상황 판단을 AI에 요청하는 함수
 * @param situation 사용자가 입력한 갈등 상황 텍스트
 * @returns AI 판단 결과를 포함하는 Promise
 */
export const judgeConflict = async (
  situation: string
): Promise<AiJudgmentResponse> => {
  const response = await apiClient.post("/api/v1/ai/judgments", { situation });
  return response.data.data;
};

/**
 * AI 판단 피드백(좋아요/싫어요) 전송 API
 * @param judgmentId 판단 ID
 * @param type "up" 또는 "down"
 */
export const sendFeedback = async (
  judgmentId: string,
  type: "up" | "down"
): Promise<void> => {
  await apiClient.post(
    `/api/v1/ai/judgments/${judgmentId}/feedback?type=${type}`
  );
};
