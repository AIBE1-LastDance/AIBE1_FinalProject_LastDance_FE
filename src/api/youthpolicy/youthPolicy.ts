// src/api/youthPolicy/youthPolicyApi.ts
import { apiClient } from "../../utils/api"; // axios 대신 apiClient 사용
import { YouthPolicy } from "../../types/youthpolicy/youthPolicy";

const API_BASE_URL = "/api/v1/youth-policy";

export const fetchAllYouthPolicies = async (): Promise<YouthPolicy[]> => {
  const response = await apiClient.get<YouthPolicy[]>(API_BASE_URL);
  return response.data;
};

export const fetchYouthPolicyById = async (
  plcyNo: string
): Promise<YouthPolicy> => {
  const response = await apiClient.get<YouthPolicy>(
    `${API_BASE_URL}/${plcyNo}`
  );
  return response.data;
};
