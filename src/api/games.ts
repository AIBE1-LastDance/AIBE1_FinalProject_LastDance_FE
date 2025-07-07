import { apiClient } from '../utils/api';

// 게임 타입 정의
export type GameType = "ROULETTE" | "LADDER" | "YAHTZEE";

// 게임 결과 요청 타입
export interface GameResultRequest {
  gameType: GameType;
  participants: string[];
  result: string;
  penalty: string;
}

// 게임 결과 응답 타입
export interface GameResultResponse {
  gameType: GameType;
  participants: string[];
  result: string;
  penalty: string;
  createdAt: string; // ISO 8601 형식
}

// API 응답 공통 타입
export interface ApiResponse<T> {
  success: true;
  data: T;
  message: string;
  errorCode: null;
}

// 게임 API 서비스 클래스
export class GameService {
  /**
   * 내 게임 결과 저장
   * @param gameData 게임 결과 데이터
   */
  static async saveMyGameResult(gameData: GameResultRequest): Promise<void> {
    const response = await apiClient.post('/api/v1/games/result/me', gameData);
    return response.data;
  }

  /**
   * 내 게임 결과 목록 조회
   * @returns 게임 결과 목록
   */
  static async getMyGameResults(): Promise<GameResultResponse[]> {
    const response = await apiClient.get('/api/v1/games/result/me');
    return response.data.data;
  }

  /**
   * 그룹 게임 결과 저장
   * @param groupId 그룹 ID (UUID 형식)
   * @param gameData 게임 결과 데이터
   */
  static async saveGroupGameResult(groupId: string, gameData: GameResultRequest): Promise<void> {
    const response = await apiClient.post(`/api/v1/games/result/group/${groupId}`, gameData);
    return response.data;
  }

  /**
   * 그룹 게임 결과 목록 조회
   * @param groupId 그룹 ID (UUID 형식)
   * @returns 그룹 게임 결과 목록
   */
  static async getGroupGameResults(groupId: string): Promise<GameResultResponse[]> {
    const response = await apiClient.get(`/api/v1/games/result/group/${groupId}`);
    return response.data.data;
  }
}

// 편의 함수들
export const gameApi = {
  // 내 게임 결과 관련
  saveMyResult: GameService.saveMyGameResult,
  getMyResults: GameService.getMyGameResults,
  
  // 그룹 게임 결과 관련
  saveGroupResult: GameService.saveGroupGameResult,
  getGroupResults: GameService.getGroupGameResults,
};

export default gameApi;
