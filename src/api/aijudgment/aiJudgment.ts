// api/aijudgment/aiJudgment.ts
import { apiClient } from "../../utils/api";
import type {
  AiJudgmentRequest,
  AiJudgmentResponse,
} from "../../types/aijudgment/aiMessage";

export const judgeConflict = async (
  requestBody: AiJudgmentRequest
): Promise<AiJudgmentResponse> => {
  const response = await apiClient.post("/api/v1/ai/judgments", requestBody);
  return response.data.data;
};

export const sendFeedback = async (
  judgmentId: string,
  type: "up" | "down"
): Promise<void> => {
  await apiClient.post(
    `/api/v1/ai/judgments/${judgmentId}/feedback?type=${type}`
  );
};
