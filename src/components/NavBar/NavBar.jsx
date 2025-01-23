import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NavBar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleMyPage = () => {
    navigate('/mypage');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '1rem',
      backgroundColor: '#f8f9fa'
    }}>
      <button onClick={handleGoHome}>홈으로 이동</button>
      <div>
        {isAuthenticated ? (
          <>
            <button onClick={handleMyPage} style={{ marginRight: '0.5rem' }}>마이페이지</button>
            <button onClick={handleLogout}>로그아웃</button>
          </>
        ) : (
          <>
            <button onClick={handleLogin} style={{ marginRight: '0.5rem' }}>로그인</button>
            <button onClick={handleSignUp}>회원가입</button>
          </>
        )}
      </div>
    </header>
  );
};

export default NavBar;