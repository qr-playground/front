import React, { createContext, useContext, useEffect, useState } from "react";
import { login as loginApi, logout as logoutApi } from "../api/auth";
import { UserInfo } from "../api/types";

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuthState: () => void;
}

const initialContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  refreshAuthState: () => {},
};

const AuthContext = createContext<AuthContextType>(initialContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuthState = () => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("accessToken");

      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAuthState();

    const handleStorageChange = () => refreshAuthState();
    const handleLoginSuccess = () => refreshAuthState();
    const handleLogoutSuccess = () => setUser(null);

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-login-success", handleLoginSuccess);
    window.addEventListener("auth-logout-success", handleLogoutSuccess);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-login-success", handleLoginSuccess);
      window.removeEventListener("auth-logout-success", handleLogoutSuccess);
    };
  }, []);

  const login = async (phoneNumber: string, password: string) => {
    try {
      setIsLoading(true);
      const authData = await loginApi({ phoneNumber, password });
      if (authData?.userInfo) {
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
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
