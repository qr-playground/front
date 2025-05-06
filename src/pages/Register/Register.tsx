import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../api/auth";
import "./Register.css";

interface RegisterFormData {
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // 필드 변경 시 해당 필드의 에러 메시지 삭제
    if (errors[name as keyof RegisterFormData]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // 전화번호 형식 자동 변환 (입력 시)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 11);
    setFormData({
      ...formData,
      phoneNumber: value,
    });

    // 에러 메시지 삭제
    if (errors.phoneNumber) {
      setErrors({
        ...errors,
        phoneNumber: "",
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요";
    } else if (formData.password.length < 6) {
      newErrors.password = "비밀번호는 6자 이상이어야 합니다";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "전화번호를 입력해주세요";
    } else if (!/^\d{10,11}$/.test(formData.phoneNumber.replace(/-/g, ""))) {
      newErrors.phoneNumber = "올바른 전화번호 형식이 아닙니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // API 호출
      const { confirmPassword, ...signupData } = formData;
      await signup(signupData);

      // 성공적인 회원가입 후 성공 메시지 표시
      setSuccess("회원가입이 완료되었습니다!");

      // 잠시 후 로그인 페이지로 이동 (성공 메시지 포함)
      setTimeout(() => {
        const encodedMessage = encodeURIComponent(
          "회원가입이 완료되었습니다. 로그인해주세요."
        );
        navigate(`/login?message=${encodedMessage}`);
      }, 1500);
    } catch (error: any) {
      console.error("회원가입 실패:", error);

      if (error.response?.status === 409) {
        // 중복된 사용자 에러 처리
        setErrors({
          ...errors,
          phoneNumber: "이미 사용 중인 전화번호입니다.",
        });
      } else if (error.response?.data?.message) {
        // 서버에서 반환된 에러 메시지 표시
        setErrors({
          ...errors,
          phoneNumber: error.response.data.message,
        });
      } else {
        setErrors({
          ...errors,
          phoneNumber: "회원가입 처리 중 오류가 발생했습니다.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-container">
        <h1>회원가입</h1>
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phoneNumber">전화번호</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="01012345678"
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              disabled={isSubmitting || !!success}
            />
            <small className="form-hint">
              숫자만 입력하세요 (예: 01012345678)
            </small>
            {errors.phoneNumber && (
              <p className="error-text">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting || !!success}
            />
            <small className="form-hint">6자 이상 입력해주세요</small>
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isSubmitting || !!success}
            />
            {errors.confirmPassword && (
              <p className="error-text">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={isSubmitting || !!success}
          >
            {isSubmitting
              ? "처리 중..."
              : success
              ? "회원가입 완료"
              : "가입하기"}
          </button>
        </form>

        <div className="login-link">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
