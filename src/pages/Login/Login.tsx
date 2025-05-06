import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

const Login: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // URL에서 리디렉션 정보 체크 (회원가입 후 리디렉션 등)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const successMsg = params.get("message");

    if (successMsg) {
      setSuccess(decodeURIComponent(successMsg));
    }

    // 이미 로그인된 상태면 홈으로 리디렉션
    if (isAuthenticated) {
      navigate("/");
    }
  }, [location, isAuthenticated, navigate]);

  // 로그인 상태가 변경될 때마다 홈으로 리디렉션 체크
  useEffect(() => {
    if (isAuthenticated) {
      // 리디렉션 전에 성공 메시지 표시
      setSuccess("로그인 성공! 홈페이지로 이동합니다.");
      const timer = setTimeout(() => {
        navigate("/");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!phoneNumber.trim()) {
      setError("전화번호를 입력해주세요.");
      return;
    }

    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    try {
      await login(phoneNumber, password);
      // 로그인 성공 - useEffect에서 isAuthenticated 변경 감지하여 리디렉션
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("전화번호 또는 비밀번호가 올바르지 않습니다.");
      } else if (err.response?.status === 404) {
        setError("존재하지 않는 사용자입니다.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  };

  // 전화번호 형식 자동 변환 (입력 시)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 11);
    setPhoneNumber(value);
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h1>로그인</h1>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phoneNumber">전화번호</label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="01012345678"
              required
              disabled={isLoading}
            />
            <small className="form-hint">
              숫자만 입력하세요 (예: 01012345678)
            </small>
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </button>

          <div className="register-link">
            <span>
              아직 계정이 없으신가요?{" "}
              <Link to="/register" className="register-button-link">
                회원가입
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
