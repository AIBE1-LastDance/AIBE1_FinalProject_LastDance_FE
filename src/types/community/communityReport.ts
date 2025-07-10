// 백엔드의 ReportType enum과 일치하도록 정의 (신고 대상 타입)
export enum ReportTargetType {
  POST = "POST",
  COMMENT = "COMMENT",
}

// 신고 사유를 위한 enum (백엔드의 reason 필드에 들어갈 값)
export enum ReportReasonType {
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
  reportType: ReportTargetType; // 변경: ReportTargetType 사용
  targetId: string; // UUID는 JavaScript에서 string으로 표현
  reason: string; // 이 필드에는 ReportReasonType의 label (예: "스팸/도배") 또는 customReason이 들어갑니다.
}

// ReportResponseDTO에 대응하는 타입
export interface ReportResponse {
  reportId: number;
  reporterId: string;
  reportedUserId: string;
  reportType: ReportTargetType; // 변경: ReportTargetType 사용
  targetId: string;
  reason: string;
  status: string; // 백엔드 ReportStatus enum에 대응
  adminId?: string; // Nullable
  adminComment?: string; // Nullable
  processedAt?: string; // LocalDateTime에 대응 (ISO 8601 string)
  createdAt: string; // LocalDateTime에 대응
  updatedAt: string; // LocalDateTime에 대응
}
