import React, { useRef, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const alertedOnce = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && !alertedOnce.current) {
      alert('로그인이 필요합니다.');
      alertedOnce.current = true;
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;