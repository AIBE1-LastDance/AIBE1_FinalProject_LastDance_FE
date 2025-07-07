// src/api/youthPolicy/youthPolicyApi.ts
import axios from "axios";
import { YouthPolicy } from "../../types/youthpolicy/youthPolicy";

const API_BASE_URL = "/api/v1/youth-policy";

/**
 * 모든 청년 정책 목록을 가져옵니다.
 * @returns {Promise<YouthPolicy[]>} 청년 정책 목록 배열
 */
export const fetchAllYouthPolicies = async (): Promise<YouthPolicy[]> => {
  try {
    const response = await axios.get<YouthPolicy[]>(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("[❌ 청년 정책 목록 로딩 실패]", error);
    throw new Error("청년 정책 목록을 불러오는 데 실패했습니다.");
  }
};

/**
 * 특정 청년 정책을 ID로 가져옵니다.
 * @param {string} plcyNo - 조회할 정책의 고유 번호 (plcyNo)
 * @returns {Promise<YouthPolicy>} 단일 청년 정책 객체
 */
export const fetchYouthPolicyById = async (
  plcyNo: string
): Promise<YouthPolicy> => {
  try {
    const response = await axios.get<YouthPolicy>(`${API_BASE_URL}/${plcyNo}`);
    return response.data;
  } catch (error) {
    console.error(`[❌ 청년 정책 상세 로딩 실패] 정책 번호: ${plcyNo}`, error);
    throw new Error(`정책 상세 정보를 불러오는 데 실패했습니다: ${plcyNo}`);
  }
};
