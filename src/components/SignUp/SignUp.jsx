import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, verifyPhone } from '../../api/api';
import './SignUp.css'; // 스타일 파일 추가

const SignUp = () => {
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const navigate = useNavigate();

  const handlePhoneVerification = async () => {
    try {
      // 서버가 없으므로 무조건 성공 응답을 반환하도록 수정
      const result = { success: true };
      if (result.success) {
        alert('인증번호가 발송되었습니다.');
        setShowVerificationInput(true);
      } else {
        alert('전화번호 인증에 실패했습니다.');
      }
    } catch (error) {
      console.error('전화번호 인증 실패:', error);
      alert('전화번호 인증에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleVerifyCode = async () => {
    // 인증번호 확인 로직을 추가하세요
    // 예: 서버에 인증번호를 보내서 확인하는 API 호출
    try {
      // 서버가 없으므로 무조건 성공 응답을 반환하도록 수정
      const result = { success: true };
      if (result.success) {
        alert('전화번호 인증이 완료되었습니다.');
        setIsPhoneVerified(true);
      } else {
        alert('인증번호가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('인증번호 확인 실패:', error);
      alert('인증번호 확인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleSignUp = async () => {
    if (!isPhoneVerified) {
      alert('전화번호 인증이 필요합니다.');
      return;
    }
    try {
      // 서버가 없으므로 무조건 성공 응답을 반환하도록 수정
      const result = { success: true };
      if (result.success) {
        alert('회원가입이 완료되었습니다.');
        navigate('/login');
      } else {
        alert('회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원가입 실패:', error);
      alert('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="signup-container">
      <h1>회원가입</h1>
      <div className="input-group">
        <label className="input-label">전화번호</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isPhoneVerified} // 인증 완료 시 비활성화
          className={isPhoneVerified ? 'disabled-input' : ''} // 비활성화 시 클래스 추가
        />
        {!showVerificationInput && (
          <button className="verify-button" onClick={handlePhoneVerification}>인증문자 발송하기</button>
        )}
      </div>
      {showVerificationInput && (
        <div className="input-group">
          <label className="input-label">인증번호 확인</label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <button className="verify-button" onClick={handleVerifyCode}>인증하기</button>
        </div>
      )}
      <div className="input-group">
        <label className="input-label">닉네임</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label className="input-label">아이디</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label className="input-label">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="button-group">
        <button className="signup-button" onClick={handleSignUp}>회원가입</button>
      </div>
    </div>
  );
};

export default SignUp;