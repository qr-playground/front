import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css'; // 스타일 파일 추가

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      // 임시 데이터로 로그인 처리
      login();
      console.log('로그인 성공');
      navigate('/');
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className="login-container">
      <h1>로그인</h1>
      <div className="input-group">
        <div className="input-label">
          <label>아이디</label>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="input-group">
        <div className="input-label">
          <label>비밀번호</label>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="button-group">
        <button className="login-button" onClick={handleLogin}>확인</button>
        <button className="signup-button" onClick={handleSignUp}>회원가입</button>
      </div>
    </div>
  );
};

export default Login;