import axios from "axios";
import { refreshAccessToken } from "./auth";

const API_BASE_URL = "http://localhost:8080/api";

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 설정
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 설정
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } else {
        // refresh도 실패(401) 시 로그아웃 처리 및 안내
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new Event("auth-logout-success"));
        alert("로그인 유지 시간이 만료되었습니다. 다시 로그인 해주세요.");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
