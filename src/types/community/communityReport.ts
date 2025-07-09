// src/types/community.ts

// 백엔드 ReportType enum과 일치하도록 정의
export enum ReportType {
  POST = "POST",
  COMMENT = "COMMENT",
  SPAM = "SPAM",
  INAPPROPRIATE = "INAPPROPRIATE",
  HARASSMENT = "HARASSMENT",
  MISINFORMATION = "MISINFORMATION",
  COPYRIGHT = "COPYRIGHT",
  HATE_SPEECH = "HATE_SPEECH",
  OTHER = "OTHER",
}

// ReportRequestDTO에 대응하는 타입
export interface ReportRequest {
  reportType: ReportType;
  targetId: string; // UUID는 JavaScript에서 string으로 표현
  reason: string;
}

// ReportResponseDTO에 대응하는 타입
export interface ReportResponse {
  reportId: number;
  reporterId: string;
  reportedUserId: string;
  reportType: ReportType;
  targetId: string;
  reason: string;
  status: string; // 백엔드 ReportStatus enum에 대응
  adminId?: string; // Nullable
  adminComment?: string; // Nullable
  processedAt?: string; // LocalDateTime에 대응 (ISO 8601 string)
  createdAt: string; // LocalDateTime에 대응
  updatedAt: string; // LocalDateTime에 대응
}
