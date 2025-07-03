// 청년 정책 개별 항목 DTO
export interface YouthPolicyDTO {
  plcyNo: string; // 정책 번호
  plcyNm: string; // 정책명
  plcyKywdNm: string; // 정책 키워드명
  plcyExplnCn: string; // 정책 설명
  bizPrdBgngYmd: string; // 사업 시작일
  bizPrdEndYmd: string; // 사업 종료일
  aplyYmd: string; // 신청일
  plcySprtCn: string; // 정책 지원 내용
  lclsfNm: string; // 소분류명
  mclsfNm: string; // 중분류명
}

// 서버 응답 구조
export interface ApiResponse<T> {
  success: boolean; // 성공 여부
  data: T; // 응답 데이터
  message: string; // 메시지
  errorCode?: string; // 에러 코드
}

// 에러 응답 구조
export interface ErrorResponse {
  success: false;
  data: null;
  message: string;
  errorCode?: string;
}
