export interface YouthPolicy {
  plcyNo: string; // 정책 번호
  plcyNm: string; // 정책명
  plcyKywdNm: string; // 정책 키워드명
  plcyExplnCn: string; // 정책 설명 내용
  bizPrdBgngYmd: string; // 사업 기간 시작 연월일
  plcyStDt: string; // 정책 시작일
  plcyEndDt: string; // 정책 종료일
  bizPrdEndYmd: string; // 사업 기간 종료 연월일
  aplyYmd: string; // 신청 연월일 (정책마다 다름)
  plcySprtCn: string; // 정책 지원 내용
  lclsfNm: string; // 대분류명
  mclsfNm: string; // 중분류명
}
