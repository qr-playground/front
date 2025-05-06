import api from "./axios";

// 사용자 정보 인터페이스
export interface UserProfile {
  id: string; // UUID
  phoneNumber: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  qrcodeInfos?: any[]; // 필요한 경우 이 타입을 더 구체화할 수 있습니다
}

// 서버 응답 인터페이스
interface SuccessResponse<T> {
  success: boolean;
  status: number;
  data: T;
  timestamp: string;
}

/**
 * 현재 로그인한 사용자의 프로필 정보를 가져옵니다.
 * @returns 사용자 프로필 정보
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get<SuccessResponse<UserProfile>>("/user/me");
    return response.data.data;
  } catch (error) {
    console.error("사용자 프로필 조회 실패:", error);
    throw error;
  }
};
