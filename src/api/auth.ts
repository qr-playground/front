import api from "./axios";
import { AuthResponseData, ServerResponse, TokenInfo, UserInfo } from "./types";

// 로그인 요청 인터페이스
interface LoginRequest {
  phoneNumber: string;
  password: string;
}

// 회원가입 요청 인터페이스
interface SignupRequest {
  phoneNumber: string;
  password: string;
}

// 사용자 정보 인터페이스
interface UserInfo {
  id: string; // UUID
  phoneNumber: string;
  role: string;
}

// 토큰 정보 인터페이스
interface TokenInfo {
  grantType: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
}

// 응답 데이터 인터페이스
interface AuthResponseData {
  userInfo: UserInfo;
  tokenInfo: TokenInfo;
}

// 서버 응답 인터페이스
interface ServerResponse<T> {
  data: T;
  status: number;
  success: boolean;
  timestamp: string;
}

// 전체 응답 인터페이스
interface AuthResponse {
  data: ServerResponse<AuthResponseData>;
}

export const login = async (data: LoginRequest): Promise<AuthResponseData> => {
  try {
    const response = await api.post<ServerResponse<AuthResponseData>>(
      "/auth/login",
      data
    );
    const authData = response.data.data;

    if (authData?.userInfo) {
      localStorage.setItem("user", JSON.stringify(authData.userInfo));

      if (authData.tokenInfo) {
        localStorage.setItem("accessToken", authData.tokenInfo.accessToken);
        localStorage.setItem("refreshToken", authData.tokenInfo.refreshToken);
      }

      window.dispatchEvent(new Event("auth-login-success"));
    }

    return authData;
  } catch (error) {
    console.error("로그인 실패:", error);
    throw error;
  }
};

export const signup = async (
  data: SignupRequest
): Promise<AuthResponseData> => {
  const response = await api.post<ServerResponse<AuthResponseData>>(
    "/auth/signup",
    data
  );
  return response.data.data;
};

export const logout = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("로그아웃 실패:", error);
  } finally {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.dispatchEvent(new Event("auth-logout-success"));
  }
};

// 서버 AuthDto.Refresh에 맞게 요청, AuthDto.Response.TokenInfo에 맞게 응답 처리
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;
  try {
    const response = await api.post<ServerResponse<{ tokenInfo: TokenInfo }>>(
      "/auth/refresh",
      { refreshToken }
    );
    const { accessToken, refreshToken: newRefreshToken } =
      response.data.data.tokenInfo;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    return accessToken;
  } catch {
    return null;
  }
};
