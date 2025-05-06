import React, { createContext, useContext, useEffect, useState } from "react";
import { login as loginApi, logout as logoutApi } from "../api/auth";

interface User {
  id: string; // UUID
  phoneNumber: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuthState: () => void; // 상태 새로고침 함수
}

// 초기 컨텍스트 값 설정
const initialContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  refreshAuthState: () => {},
};

// 기본값과 함께 컨텍스트 생성
const AuthContext = createContext<AuthContextType>(initialContext);

// 사용자 인증 상태를 관리하는 Provider 컴포넌트
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 로컬 스토리지에서 사용자 상태 로드하는 함수
  const refreshAuthState = () => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("accessToken");

      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          // JSON 파싱 오류 발생 시 로컬 스토리지 정리
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setUser(null);
        }
      } else {
        // 유저 정보나 토큰 중 하나라도 없으면 로그아웃 상태로 설정
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 복원
  useEffect(() => {
    refreshAuthState();

    // 로컬 스토리지 변경 감지
    const handleStorageChange = () => {
      refreshAuthState();
    };

    // 커스텀 인증 이벤트 리스너
    const handleLoginSuccess = () => {
      refreshAuthState();
    };
    
    const handleLogoutSuccess = () => {
      setUser(null);
    };

    // 이벤트 리스너 등록
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-login-success", handleLoginSuccess);
    window.addEventListener("auth-logout-success", handleLogoutSuccess);

    // 컴포넌트 언마운트 시 정리
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-login-success", handleLoginSuccess);
      window.removeEventListener("auth-logout-success", handleLogoutSuccess);
    };
  }, []);

  const login = async (phoneNumber: string, password: string) => {
    try {
      setIsLoading(true);
      
      // API 호출 후 응답 처리
      const authData = await loginApi({ phoneNumber, password });
      
      // 사용자 상태 직접 업데이트 (로컬 스토리지에 저장된 것과 일치하도록)
      if (authData && authData.userInfo) {
        setUser(authData.userInfo);
      }
      
      return authData;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await logoutApi();
      setUser(null);
    } catch (error) {
      // 에러가 발생해도 로컬에서는 로그아웃 처리
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 인증 컨텍스트를 사용하기 위한 훅
export function useAuth() {
  return useContext(AuthContext);
}
