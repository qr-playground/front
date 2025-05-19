import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // 인증 상태 로딩 중
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>인증 정보를 확인하는 중...</p>
      </div>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉션
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
};

export default ProtectedRoute;
