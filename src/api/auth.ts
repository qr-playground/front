import api from "./axios";

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

    // 로그인 성공 시 로컬 스토리지에 저장
    if (authData && authData.userInfo) {
      localStorage.setItem("user", JSON.stringify(authData.userInfo));

      if (authData.tokenInfo) {
        localStorage.setItem("accessToken", authData.tokenInfo.accessToken);
        localStorage.setItem("refreshToken", authData.tokenInfo.refreshToken);
      }

      // 이벤트 발생 (AuthContext에서 감지)
      window.dispatchEvent(new Event("auth-login-success"));
    }

    return authData;
  } catch (error) {
    console.error("로그인 실패");
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

    // 로그아웃 처리
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // 이벤트 발생 (AuthContext에서 감지)
    window.dispatchEvent(new Event("auth-logout-success"));
  } catch (error) {
    // 에러가 발생해도 로컬에서는 로그아웃 처리
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
};
