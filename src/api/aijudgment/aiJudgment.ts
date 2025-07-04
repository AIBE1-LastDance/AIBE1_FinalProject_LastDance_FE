import type { AiJudgmentResponse } from "../../types/aijudgment/aiMessage";

/**
 * 갈등 상황 판단을 AI에 요청하는 함수
 * @param situation 사용자가 입력한 갈등 상황 텍스트
 * @returns AI 판단 결과를 포함하는 Promise
 */
export const judgeConflict = async (
  situation: string
): Promise<AiJudgmentResponse> => {
  const response = await fetch("/api/v1/ai/judgments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ situation }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "갈등 판단 요청에 실패했습니다.");
  }

  const data = await response.json();
  return data.data;
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
  const response = await fetch(
    `/api/v1/ai/judgments/${judgmentId}/feedback?type=${type}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "피드백 전송에 실패했습니다.");
  }
};
