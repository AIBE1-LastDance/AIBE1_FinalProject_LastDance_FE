// src/api/report.ts
import { apiClient } from "../../utils/api"; // 기존 apiClient 임포트
import {
  ReportRequest,
  ReportResponse,
} from "../../types/community/communityReport"; // 정의된 타입 임포트
import { ApiResponse } from "../../types/index.ts"; // ApiResponse 타입 임포트

export const reportContent = async (
  reportData: ReportRequest
): Promise<ApiResponse<ReportResponse>> => {
  console.log("📦 최종 전송 payload:", JSON.stringify(reportData, null, 2));

  const response = await apiClient.post<ApiResponse<ReportResponse>>(
    "/api/v1/community/report",
    reportData,
    {
      headers: {
        "Content-Type": "application/json", // ✅ 명시적으로 설정 (디버깅용)
      },
    }
  );

  return response.data;
};
