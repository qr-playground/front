import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  sendVerificationCode,
  signup,
  verifyVerificationCode,
} from "../../api/auth";
import "./Register.css";

interface RegisterFormData {
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  verificationCode: string;
}

// 회원가입 단계 enum
enum RegisterStep {
  PHONE_VERIFICATION = 1,
  CODE_VERIFICATION = 2,
  PASSWORD_SETUP = 3,
}

const Register: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<RegisterStep>(
    RegisterStep.PHONE_VERIFICATION
  );
  const [formData, setFormData] = useState<RegisterFormData>({
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    verificationCode: "",
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [resendLimitResetTime, setResendLimitResetTime] = useState(0);
  const navigate = useNavigate();

  // 카운트다운 타이머
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 재발송 제한 리셋 타이머
  React.useEffect(() => {
    if (resendLimitResetTime > 0) {
      const timer = setTimeout(
        () => setResendLimitResetTime(resendLimitResetTime - 1),
        1000
      );
      return () => clearTimeout(timer);
    } else if (resendLimitResetTime === 0 && resendCount > 0) {
      // 10분이 지나면 재발송 횟수 리셋
      setResendCount(0);
    }
  }, [resendLimitResetTime, resendCount]);

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

    // 전화번호 변경 시 인증 코드 관련 상태만 초기화 (재발송 제한은 유지)
    if (value !== formData.phoneNumber) {
      setCountdown(0);
      // 재발송 제한은 IP + Device ID 기반이므로 유지
    }
  };

  const validatePhoneNumber = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "전화번호를 입력해주세요";
    } else if (!/^\d{10,11}$/.test(formData.phoneNumber.replace(/-/g, ""))) {
      newErrors.phoneNumber = "올바른 전화번호 형식이 아닙니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVerificationCode = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.verificationCode.trim()) {
      newErrors.verificationCode = "인증 코드를 입력해주세요";
    } else if (!/^\d{6}$/.test(formData.verificationCode)) {
      newErrors.verificationCode = "인증 코드는 6자리 숫자입니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = (): boolean => {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 인증 코드 발송
  const handleSendVerificationCode = async () => {
    if (!validatePhoneNumber()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await sendVerificationCode({ phoneNumber: formData.phoneNumber });
      setCountdown(180); // 3분 카운트다운
      setCurrentStep(RegisterStep.CODE_VERIFICATION);

      // 첫 번째 발송 시 재발송 제한 타이머 시작
      if (resendCount === 0) {
        setResendLimitResetTime(600); // 10분 = 600초
        setResendCount(1);
      }
    } catch (error: any) {
      console.error("인증 코드 발송 실패:", error);
      if (error.response?.status === 429) {
        setErrors({
          ...errors,
          phoneNumber: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요.",
        });
      } else if (error.response?.data?.message) {
        setErrors({
          ...errors,
          phoneNumber: error.response.data.message,
        });
      } else {
        setErrors({
          ...errors,
          phoneNumber: "인증 코드 발송 중 오류가 발생했습니다.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 인증 코드 검증
  const handleVerifyCode = async () => {
    if (!validateVerificationCode()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyVerificationCode({
        phoneNumber: formData.phoneNumber,
        verificationCode: formData.verificationCode,
      });
      setCurrentStep(RegisterStep.PASSWORD_SETUP);
    } catch (error: any) {
      console.error("인증 코드 검증 실패:", error);
      if (error.response?.data?.message) {
        setErrors({
          ...errors,
          verificationCode: error.response.data.message,
        });
      } else {
        setErrors({
          ...errors,
          verificationCode: "인증 코드가 올바르지 않습니다.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 최종 회원가입
  const handleFinalSignup = async () => {
    if (!validatePassword()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });

      setSuccess("회원가입이 완료되었습니다!");
      setTimeout(() => {
        const encodedMessage = encodeURIComponent(
          "회원가입이 완료되었습니다. 로그인해주세요."
        );
        navigate(`/login?message=${encodedMessage}`);
      }, 1500);
    } catch (error: any) {
      console.error("회원가입 실패:", error);
      if (error.response?.status === 409) {
        setErrors({
          ...errors,
          phoneNumber: "이미 사용 중인 전화번호입니다.",
        });
        setCurrentStep(RegisterStep.PHONE_VERIFICATION);
      } else if (error.response?.data?.message) {
        setErrors({
          ...errors,
          password: error.response.data.message,
        });
      } else {
        setErrors({
          ...errors,
          password: "회원가입 처리 중 오류가 발생했습니다.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 인증 코드 재발송
  const handleResendCode = async () => {
    if (countdown > 0 || resendCount >= 5) return;

    setIsSubmitting(true);
    try {
      await sendVerificationCode({ phoneNumber: formData.phoneNumber });
      setCountdown(180);
      setResendCount(resendCount + 1);
      setErrors({ ...errors, verificationCode: "" });
    } catch (error: any) {
      console.error("인증 코드 재발송 실패:", error);
      setErrors({
        ...errors,
        verificationCode: "인증 코드 재발송에 실패했습니다.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getResendButtonText = (): string => {
    if (resendCount >= 5) {
      return resendLimitResetTime > 0
        ? `재발송 제한 (${formatTime(resendLimitResetTime)})`
        : "재발송 제한 해제됨";
    }
    if (countdown > 0) {
      return `재발송 (${formatTime(countdown)})`;
    }
    return "인증 코드 재발송";
  };

  const isResendDisabled = (): boolean => {
    return isSubmitting || countdown > 0 || resendCount >= 5;
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      <div
        className={`step ${
          currentStep >= RegisterStep.PHONE_VERIFICATION ? "active" : ""
        }`}
      >
        <span className="step-number">1</span>
        <span className="step-label">전화번호 인증</span>
      </div>
      <div
        className={`step ${
          currentStep >= RegisterStep.CODE_VERIFICATION ? "active" : ""
        }`}
      >
        <span className="step-number">2</span>
        <span className="step-label">인증 코드 확인</span>
      </div>
      <div
        className={`step ${
          currentStep >= RegisterStep.PASSWORD_SETUP ? "active" : ""
        }`}
      >
        <span className="step-number">3</span>
        <span className="step-label">비밀번호 설정</span>
      </div>
    </div>
  );

  const renderPhoneVerificationStep = () => (
    <div className="form-step">
      <h2>전화번호 인증</h2>
      <div className="form-group">
        <label htmlFor="phoneNumber">전화번호</label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          placeholder="01012345678"
          value={formData.phoneNumber}
          onChange={handlePhoneChange}
          disabled={isSubmitting}
        />
        <small className="form-hint">숫자만 입력하세요 (예: 01012345678)</small>
        {errors.phoneNumber && (
          <p className="error-text">{errors.phoneNumber}</p>
        )}
      </div>
      <button
        type="button"
        className="register-button"
        onClick={handleSendVerificationCode}
        disabled={isSubmitting}
      >
        {isSubmitting ? "발송 중..." : "인증 코드 발송"}
      </button>
    </div>
  );

  const renderCodeVerificationStep = () => (
    <div className="form-step">
      <h2>인증 코드 확인</h2>
      <p className="verification-info">
        {formData.phoneNumber}로 인증 코드를 발송했습니다.
      </p>
      <div className="form-group">
        <label htmlFor="verificationCode">인증 코드</label>
        <input
          type="text"
          id="verificationCode"
          name="verificationCode"
          placeholder="6자리 숫자 입력"
          value={formData.verificationCode}
          onChange={handleChange}
          disabled={isSubmitting}
          maxLength={6}
        />
        {countdown > 0 && (
          <small className="form-hint">
            남은 시간: {formatTime(countdown)}
          </small>
        )}
        {resendCount > 0 && (
          <small className="form-hint resend-info">
            재발송 횟수: {resendCount}/5
            {resendLimitResetTime > 0 && (
              <span> (제한 해제: {formatTime(resendLimitResetTime)})</span>
            )}
          </small>
        )}
        {errors.verificationCode && (
          <p className="error-text">{errors.verificationCode}</p>
        )}
      </div>
      <div className="button-group">
        <button
          type="button"
          className="register-button"
          onClick={handleVerifyCode}
          disabled={isSubmitting}
        >
          {isSubmitting ? "확인 중..." : "인증 코드 확인"}
        </button>
        <button
          type="button"
          className={`resend-button ${resendCount >= 5 ? "disabled" : ""}`}
          onClick={handleResendCode}
          disabled={isResendDisabled()}
        >
          {getResendButtonText()}
        </button>
      </div>
      <button
        type="button"
        className="back-button"
        onClick={() => {
          setCurrentStep(RegisterStep.PHONE_VERIFICATION);
          // 이전 단계로 돌아가도 재발송 제한은 유지
        }}
      >
        이전 단계
      </button>
    </div>
  );

  const renderPasswordSetupStep = () => (
    <div className="form-step">
      <h2>비밀번호 설정</h2>
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
        type="button"
        className="register-button"
        onClick={handleFinalSignup}
        disabled={isSubmitting || !!success}
      >
        {isSubmitting
          ? "처리 중..."
          : success
          ? "회원가입 완료"
          : "회원가입 완료"}
      </button>

      <button
        type="button"
        className="back-button"
        onClick={() => setCurrentStep(RegisterStep.CODE_VERIFICATION)}
        disabled={isSubmitting || !!success}
      >
        이전 단계
      </button>
    </div>
  );

  return (
    <div className="register-container">
      <div className="register-form-container">
        <h1>회원가입</h1>
        {success && <div className="success-message">{success}</div>}

        {renderStepIndicator()}

        <form onSubmit={(e) => e.preventDefault()}>
          {currentStep === RegisterStep.PHONE_VERIFICATION &&
            renderPhoneVerificationStep()}
          {currentStep === RegisterStep.CODE_VERIFICATION &&
            renderCodeVerificationStep()}
          {currentStep === RegisterStep.PASSWORD_SETUP &&
            renderPasswordSetupStep()}
        </form>

        <div className="login-link">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
