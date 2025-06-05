import api from "./axios";
import { ServerResponse, UserProfile } from "./types";

/**
 * 현재 로그인한 사용자의 프로필 정보를 가져옵니다.
 * @returns 사용자 프로필 정보
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get<ServerResponse<UserProfile>>("/user/me");
    return response.data.data;
  } catch (error) {
    console.error("사용자 프로필 조회 실패:", error);
    throw error;
  }
};
