import { apiClient } from "../../utils/api";
import type {
  AiJudgmentRequest,
  AiJudgmentResponse,
  AiJudgmentHistoryResponse,
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

export const fetchAiJudgmentHistory = async (): Promise<
  AiJudgmentHistoryResponse[]
> => {
  const response = await apiClient.get("/api/v1/ai/judgments/history");
  return response.data.data;
};
