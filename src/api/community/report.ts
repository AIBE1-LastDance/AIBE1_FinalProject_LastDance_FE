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
  const response = await apiClient.post<ApiResponse<ReportResponse>>(
    "/api/v1/community/report",
    reportData
  );
  return response.data;
};
